import React, { useState } from 'react';
import { ExportABNTModal } from './ExportABNTModal';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import type { MindElixirInstance } from 'mind-elixir';
import { ExtendedJsPDF } from '@/types/jspdf-extended';

// Local type definition to avoid import/export issues
interface MindMapNode {
  id: string;
  text: string;
  type: "main" | "history" | "data" | "context" | "date" | "important";
  children: MindMapNode[];
  imageUrl?: string;
  sourceUrl?: string;
}

interface MindMapExporterProps {
  mindMapData: MindMapNode | null;
}

export const MindMapExporter: React.FC<MindMapExporterProps> = ({ mindMapData }) => {
  const [loading, setLoading] = useState(false);
  const [abntModalOpen, setAbntModalOpen] = useState(false);
  const [abntData, setAbntData] = useState<{ nome: string; instituicao: string; ano: string; titulo: string } | null>(null);

  // Helper: Adiciona rodapé discreto em cada página
  function addFooter(doc: jsPDF) {
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor('#888');
    doc.text('Exportado por haye - https://haye.ai', 10, pageHeight - 8);
  }

  // Helper: Recursively render mind map as styled lines for PDF, with word wrap e fonte/cor correta
  // Helper: Carrega imagem de uma URL para base64 (async)
  async function fetchImageBase64(url: string): Promise<string | null> {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  }

  // Helper: Recursively render mind map as styled lines for PDF, com suporte a imagem
  async function renderMindMapForPDF({ node, doc, y, level = 0 }: { node: MindMapNode; doc: jsPDF; y: number; level?: number; }): Promise<number> {
    if (!node) return y;
    const indent = 12 * level;
    let bullet = '•';
    let color = '#333';
    if (node.type === 'main') {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      color = '#1a237e';
      bullet = '★';
    } else {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      switch (node.type) {
        case 'history': color = '#1976d2'; break;
        case 'data': color = '#388e3c'; break;
        case 'context': color = '#fbc02d'; break;
        case 'date': color = '#d32f2f'; break;
        case 'important': color = '#8e24aa'; bullet = '◆'; break;
      }
    }
    // Prepare node text
    let nodeText = node.text;
    // Split text into lines that fit page width
    const maxWidth = doc.internal.pageSize.getWidth() - (28 + indent);
    const lines = doc.splitTextToSize(nodeText, maxWidth);
    // Draw bullet and first line
    doc.setFont('helvetica', node.type === 'main' ? 'bold' : 'normal');
    doc.setFontSize(node.type === 'main' ? 16 : 12);
    doc.setTextColor(color);
    doc.text(bullet, 10 + indent, y);
    doc.setFont('helvetica', node.type === 'main' ? 'bold' : 'normal');
    doc.setFontSize(node.type === 'main' ? 16 : 12);
    doc.setTextColor('#222');
    doc.text(lines[0], 16 + indent, y);
    // (Removido: não exibir tags de tipo como [history], [data], etc.)
    y += 9;
    // Draw remaining lines (if any)
    for (let i = 1; i < lines.length; i++) {
      if (y > doc.internal.pageSize.getHeight() - 25) {
        addFooter(doc);
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', node.type === 'main' ? 'bold' : 'normal');
      doc.setFontSize(node.type === 'main' ? 16 : 12);
      doc.setTextColor('#222');
      doc.text(lines[i], 16 + indent, y);
      y += 8;
    }
    // Imagem do nó (se houver)
    if (node.imageUrl) {
      if (y > doc.internal.pageSize.getHeight() - 70) {
        addFooter(doc);
        doc.addPage();
        y = 20;
      }
      const imgBase64 = await fetchImageBase64(node.imageUrl);
      if (imgBase64) {
        try {
          // Carregar em um elemento Image para obter proporção
          const img = new window.Image();
          img.src = imgBase64;
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
          const maxW = 80;
          const scale = maxW / img.width;
          const w = maxW;
          const h = img.height * scale;
          // Centralizar na página considerando indent
          const pageW = doc.internal.pageSize.getWidth();
          const x = Math.max((pageW - w) / 2, 16 + indent);
          doc.addImage(imgBase64, 'JPEG', x, y, w, h, undefined, 'FAST');
          y += h + 6;
        } catch (e) {
          // Se não conseguir inserir, apenas ignora
        }
      }
    }
    // Fonte ao final
    if (node.sourceUrl) {
      if (y > doc.internal.pageSize.getHeight() - 25) {
        addFooter(doc);
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);
      doc.setTextColor('#222');
      doc.text(`Fonte: ${node.sourceUrl}`, 16 + indent, y);
      y += 8;
    }
    if (level === 0) y += 6;
    // Children
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        if (y > doc.internal.pageSize.getHeight() - 25) {
          addFooter(doc);
          doc.addPage();
          y = 20;
        }
        y = await renderMindMapForPDF({ node: child, doc, y, level: level + 1 });
      }
    }
    return y;
  }

  const exportToPDF = async () => {
    if (!mindMapData) {
      toast.error('Mapa mental não encontrado');
      return;
    }
    setLoading(true);
    try {
      const doc = new jsPDF();
      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor('#0d47a1');
      doc.text('Mapa Mental Exportado', 10, 14);
      doc.setDrawColor('#1976d2');
      doc.setLineWidth(0.7);
      doc.line(10, 16, 200, 16);
      let y = 26;
      // Render mind map tree
      y = await renderMindMapForPDF({ node: mindMapData, doc, y });
      addFooter(doc);
      doc.save('mapa-mental.pdf');
      toast.success('PDF exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar PDF');
    }
    setLoading(false);
  };

  // Handler para abrir o modal ABNT
  const handleExportABNT = () => {
    setAbntModalOpen(true);
  };

  // Handler para quando o usuário preencher os dados ABNT
  const handleSubmitABNT = (data: { nome: string; instituicao: string; ano: string; titulo: string }) => {
    setAbntModalOpen(false);
    setAbntData(data);
    exportPDF_ABNT(data);
  };

  // Função para exportação ABNT (folha de rosto, sumário, margens, fonte, referências)
  const exportPDF_ABNT = async (data: { nome: string; instituicao: string; ano: string; titulo: string }) => {
    if (!mindMapData) {
      toast.error('Mapa mental não encontrado');
      return;
    }
    setLoading(true);
    try {
      // Margens ABNT: 3cm sup/esq, 2cm dir/inf => em pontos (1cm ~ 28.35pt)
      const marginTop = 28.35 * 3, marginLeft = 28.35 * 3, marginRight = 28.35 * 2, marginBottom = 28.35 * 2;
      const pageW = 210, pageH = 297; // A4 em mm
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const font = 'times';
      // Helper para converter mm para pt
      const mmToPt = (mm: number) => mm * 2.83465;
      // Folha de rosto ABNT centralizada verticalmente
      doc.setFont(font, 'normal');
      doc.setFontSize(12);
      doc.setTextColor('#000');
      // Nome do autor (parte superior)
      doc.text(data.nome.toUpperCase(), mmToPt(pageW)/2, mmToPt(50), { align: 'center' });
      // Título (meio da página, centralizado, caixa alta/negrito)
      doc.setFont(font, 'bold');
      doc.setFontSize(16);
      doc.text(data.titulo.toUpperCase(), mmToPt(pageW)/2, mmToPt(pageH)/2, { align: 'center' });
      doc.setFont(font, 'normal');
      doc.setFontSize(12);
      // Instituição e ano (base, centralizados)
      doc.text(data.instituicao.toUpperCase(), mmToPt(pageW)/2, mmToPt(pageH)-mmToPt(40), { align: 'center' });
      doc.text(data.ano, mmToPt(pageW)/2, mmToPt(pageH)-mmToPt(30), { align: 'center' });
      doc.addPage();
      // Sumário ABNT: título centralizado, itens à esquerda, numeração à direita
      let y = mmToPt(30);
      doc.setFont(font, 'bold');
      doc.setFontSize(14);
      doc.text('SUMÁRIO', mmToPt(pageW)/2, y, { align: 'center' });
      y += 32;
      doc.setFont(font, 'normal');
      doc.setFontSize(12);
      // Extrair tópicos principais do mapa (level 0 e 1)
      function getSumario(node: MindMapNode, level = 0, prefix = ''): string[] {
        let arr: string[] = [];
        if (level <= 1) arr.push((prefix ? prefix + ' ' : '') + node.text);
        if (node.children && level < 1) {
          node.children.forEach((c, i) => {
            arr = arr.concat(getSumario(c, level + 1, (i+1).toString()));
          });
        }
        return arr;
      }
      const sumario = getSumario(mindMapData);
      const sumarioStartX = mmToPt(30);
      const sumarioEndX = mmToPt(pageW) - mmToPt(20);
      sumario.forEach((item, idx) => {
        // Alinha o texto à esquerda e o número à direita
        doc.text(item, sumarioStartX, y, { align: 'left' });
        doc.text(String(idx+1), sumarioEndX, y, { align: 'right' });
        y += 20;
      });
      doc.addPage();
      // Conteúdo do mapa mental (formatação ABNT)
      let contentY = marginTop;
      async function renderABNT({ node, doc, y, level = 0 }: { node: MindMapNode; doc: jsPDF; y: number; level?: number; }): Promise<number> {
        if (!node) return y;
        // Margens e recuo: tudo em pt
        const baseMarginLeft = mmToPt(30); // 3cm esquerda
        const baseMarginRight = mmToPt(20); // 2cm direita
        const indent = baseMarginLeft + level * mmToPt(12.5); // recuo 1,25cm por nível
        let nodeText = node.text;
        // Calcular largura máxima do texto (em pt)
        const pageWidthPt = mmToPt(pageW);
        const maxWidth = pageWidthPt - baseMarginLeft - baseMarginRight - (level * mmToPt(12.5));
        doc.setFont(font, level === 0 ? 'bold' : 'normal');
        doc.setFontSize(12);
        doc.setTextColor('#000');
        // Espaçamento 1,5 (aprox. 18pt para fonte 12)
        const lineHeight = 18;
        // Dividir em parágrafos se houver quebras de linha
        const paragraphs = nodeText.split(/\r?\n/);
        for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
          let p = paragraphs[pIdx];
          // Recuo só na primeira linha do parágrafo
          const lines = doc.splitTextToSize(p, maxWidth);
          for (let lIdx = 0; lIdx < lines.length; lIdx++) {
            let line = lines[lIdx];
            if (y + lineHeight > mmToPt(pageH) - mmToPt(20)) {
              doc.addPage();
              y = mmToPt(30);
            }
            // Simula justificação: se não for última linha do parágrafo, distribui espaços
            let x = indent;
            if (lIdx === 0) x += mmToPt(12.5); // recuo 1,25cm na primeira linha
            doc.text(line, x, y, { maxWidth, align: 'left' });
            y += lineHeight;
          }
          y += 4;
        }

        // Imagem do nó (se houver)
        if (node.imageUrl) {
          if (y > pageH - marginBottom - 100) {
            doc.addPage();
            y = marginTop;
          }
          const imgBase64 = await fetchImageBase64(node.imageUrl);
          if (imgBase64) {
            try {
              const img = new window.Image();
              img.src = imgBase64;
              await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
              });
              const maxW = 180;
              const scale = maxW / img.width;
              const w = maxW;
              const h = img.height * scale;
              const x = Math.max((pageW - w) / 2, indent);
              doc.addImage(imgBase64, 'JPEG', x, y, w, h, undefined, 'FAST');
              y += h + 12;
            } catch {}
          }
        }
        // Fonte ao final
        if (node.sourceUrl) {
          if (y + 14 > mmToPt(pageH) - mmToPt(20)) {
            doc.addPage();
            y = mmToPt(30);
          }
          doc.setFont(font, 'italic');
          doc.setFontSize(10);
          doc.setTextColor('#111');
          doc.text(`Fonte: ${node.sourceUrl}`, indent, y, { maxWidth, align: 'left' });
          y += 18;
        }
        // Children
        if (node.children && node.children.length > 0) {
          for (const child of node.children) {
            if (y > pageH - marginBottom - 40) {
              doc.addPage();
              y = marginTop;
            }
            y = await renderABNT({ node: child, doc, y, level: level + 1 });
          }
        }
        return y;
      }
      await renderABNT({ node: mindMapData, doc, y: contentY });
      // Referências ao final
      doc.addPage();
      doc.setFont(font, 'bold');
      doc.setFontSize(14);
      doc.text('REFERÊNCIAS', pageW/2, marginTop, { align: 'center' });
      doc.setFont(font, 'normal');
      doc.setFontSize(12);
      let refY = marginTop + 30;
      // Coletar todas as fontes únicas
      function collectSources(node: MindMapNode, acc: Set<string>) {
        if (node.sourceUrl) acc.add(node.sourceUrl);
        if (node.children) node.children.forEach(c => collectSources(c, acc));
      }
      const refs = new Set<string>();
      collectSources(mindMapData, refs);
      Array.from(refs).forEach((src, idx) => {
        // Se não couber a referência inteira, quebra página
        if (refY + 14 > mmToPt(pageH) - mmToPt(20)) {
          doc.addPage();
          refY = mmToPt(30);
        }
        doc.setFont(font, 'normal');
        doc.setFontSize(12);
        // Referência alinhada à esquerda, espaçamento simples
        doc.text(`${idx+1}. ${src}`, mmToPt(30), refY, { maxWidth: mmToPt(pageW) - mmToPt(30) - mmToPt(20), align: 'left' });
        refY += 14;
      });
      // Numeração de páginas (exceto folha de rosto)
      const pageCount = doc.getNumberOfPages();
      for (let i = 2; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont(font, 'normal');
        doc.setFontSize(10);
        // Só numera se a página não estiver vazia
        if (doc.getTextDimensions('a').h > 0) {
          doc.text(`${i-1}`, mmToPt(pageW) - mmToPt(20), mmToPt(pageH) - 18, { align: 'right' });
        }
      }
      doc.save('mapa-mental-abnt.pdf');
      toast.success('PDF ABNT exportado com sucesso!');
    } catch (err) {
      toast.error('Erro ao exportar PDF ABNT');
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <>
      <div className="flex gap-4">
        <button
          onClick={exportToPDF}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60"
          disabled={loading}
        >
          {loading ? (
            <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth="4" strokeDasharray="60" /></svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          )}
          Exportar PDF
        </button>
        {/*
        <button
          onClick={handleExportABNT}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60"
          disabled={loading}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Exportar PDF ABNT
        </button>
        */}
      </div>
      <ExportABNTModal
        open={abntModalOpen}
        onClose={() => setAbntModalOpen(false)}
        onSubmit={handleSubmitABNT}
      />
    </>
  );
};