
import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { ToolProps, HistoryItem, AIResponse } from "@/lib/types";
import Header from "@/components/Header";
import ToolCard from "@/components/ToolCard";
import MainContent from "@/components/MainContent";
import InputArea from "@/components/InputArea";
import HistorySection from "@/components/HistorySection";
import { toast } from "sonner";
import { Book, Code, FileText, Globe, HelpCircle, Pencil, Youtube } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getVideoDetails } from '@/lib/api/youtube';

const Index = () => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [response, setResponse] = useState<AIResponse>({
    content: "",
    loading: false,
    error: null,
  });

  const tools: ToolProps[] = [
    {
      id: "assistant",
      title: "Assistente de Aprendizagem",
      description: "Pergunte e obtenha explicações detalhadas sobre qualquer assunto",
      icon: "HelpCircle",
    },
    {
      id: "generator",
      title: "Gerador de Conteúdo",
      description: "Crie poemas, blogs e ensaios com facilidade",
      icon: "Pencil",
    },
    {
      id: "language",
      title: "Idioma",
      description: "Traduza textos e verifique a gramática",
      icon: "Globe",
    },
    {
      id: "essay",
      title: "Ajudante de Ensaios",
      description: "Aprimore e parafraseie seus textos acadêmicos",
      icon: "FileText",
    },
    {
      id: "summarizer",
      title: "Resumidor",
      description: "Resuma textos, livros e extraia palavras-chave",
      icon: "Book",
    },
    {
      id: "code",
      title: "Aprimorador de Código",
      description: "Melhore, otimize e corrija seu código",
      icon: "Code",
    },
    {
      id: "youtube",
      title: "Resumo do YouTube",
      description: "Obtenha resumos de vídeos do YouTube",
      icon: "Youtube",
    },
    {
      id: "research",
      title: "Assistente de Pesquisa Acadêmica",
      description: "Auxílio avançado em pesquisas, análise de artigos e produção científica",
      icon: "Search",
    },
    {
      id: "citations",
      title: "Gerador de Citações",
      description: "Crie citações e referências bibliográficas em diversos formatos acadêmicos",
      icon: "Quote",
    },
    {
      id: "academic-writing",
      title: "Assistente de Escrita Acadêmica",
      description: "Ajuda especializada na estruturação e escrita de trabalhos acadêmicos",
      icon: "Edit3",
    },
    {
      id: "plagiarism",
      title: "Análise de Plágio",
      description: "Verificação avançada de originalidade e detecção de plágio",
      icon: "Shield",
    },
    {
      id: "article-analysis",
      title: "Análise de Artigos",
      description: "Análise detalhada de artigos científicos e extração de insights",
      icon: "FileSearch",
    },
    {
      id: "content-library",
      title: "Biblioteca de Conteúdo",
      description: "Acesso ilimitado a recursos acadêmicos e materiais de referência",
      icon: "Library",
    },
    {
      id: "advanced-correction",
      title: "Corretor Avançado",
      description: "Correção detalhada de trabalhos com sugestões de melhoria",
      icon: "CheckSquare",
    },
    {
      id: "essay-generator",
      title: "Gerador de Redações",
      description: "Crie redações estruturadas com introdução, desenvolvimento e conclusão",
      icon: "FileText",
    },
  ];

  const handleToolSelect = (id: string) => {
    setSelectedTool(id);
    setResponse({
      content: "",
      loading: false,
      error: null,
    });
  };

  const handleSubmit = async (text: string, file?: File | null, youtubeUrl?: string) => {
    try {
      if (!selectedTool) {
        toast.error("Por favor, selecione uma ferramenta primeiro.");
        return;
      }
  
      setResponse({
        content: "",
        loading: true,
        error: null,
      });
  
      const genAI = new GoogleGenerativeAI("AIzaSyBjrD1WtKKseislU-NuWpdU0o5qUziX5A0");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
      let prompt = "";
      switch (selectedTool) {
        case "assistant":
          prompt = `Como um assistente de aprendizagem especializado, forneça uma explicação detalhada e didática sobre: ${text}. Use exemplos práticos e divida a explicação em tópicos quando apropriado.`;
          break;
        case "generator":
          prompt = `Como um gerador de conteúdo criativo, crie um texto original e envolvente sobre: ${text}. Mantenha um tom adequado ao tema e use recursos literários apropriados.`;
          break;
        case "language":
          prompt = `Como um especialista em idiomas, analise ou traduza o seguinte texto mantendo o contexto e nuances: ${text}. Forneça explicações sobre escolhas de tradução quando relevante.`;
          break;
        case "essay":
          prompt = `Como um assistente de redação acadêmica, aprimore o seguinte texto mantendo o estilo acadêmico e formal: ${text}. Sugira melhorias na estrutura e argumentação.`;
          break;
        case "summarizer":
          prompt = `Como um especialista em resumos, faça um resumo conciso e objetivo do seguinte texto, destacando os pontos principais: ${text}. Identifique e liste as palavras-chave.`;
          break;
        case "code":
          prompt = `Como um especialista em programação, analise e melhore o seguinte código: ${text}. 
          Forneça:
          1. Análise do código atual
          2. Sugestões de otimização
          3. Possíveis problemas de segurança
          4. Boas práticas não aplicadas
          5. Código melhorado com comentários`;
          break;
        case "youtube":
          try {
            const videoDetails = await getVideoDetails(youtubeUrl || text);
            prompt = `Analise este vídeo do YouTube:
              Título: ${videoDetails.title}
              Canal: ${videoDetails.channelTitle}
              Descrição: ${videoDetails.description}
              Duração: ${videoDetails.duration}
  
              Por favor, forneça:
              1. Resumo do conteúdo baseado na descrição
              2. Principais tópicos abordados
              3. Pontos-chave do vídeo
              4. Conclusões principais
              5. Sugestões de conteúdo relacionado`;
          } catch (error) {
            throw new Error('Erro ao processar informações do vídeo. Verifique se a URL do YouTube é válida.');
          }
          break;
        case "research":
          prompt = `Como um assistente de pesquisa acadêmica, forneça uma análise aprofundada sobre: ${text}. 
          Inclua:
          1. Contextualização do tema
          2. Principais teorias e autores
          3. Metodologias relevantes
          4. Tendências atuais
          5. Referências bibliográficas`;
          break;
        default:
          prompt = `${tools.find(t => t.id === selectedTool)?.title}: ${text}`;
      }
  
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      // Format the response with better HTML structure
      const formattedResponse = `
        <div class="prose max-w-none space-y-6">
          <div class="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 mb-6">
            <h2 class="text-2xl font-bold text-blue-600 mb-2">
              ${tools.find(t => t.id === selectedTool)?.title}
            </h2>
            <p class="text-gray-600 italic">Consulta: ${text}</p>
          </div>
          
          <div class="space-y-4">
            ${response.text()
              .split('\n')
              .map(line => {
                // Format headings
                if (line.startsWith('#')) {
                  const level = line.match(/^#+/)[0].length;
                  const text = line.replace(/^#+\s*/, '');
                  return `<h${level} class="text-xl font-semibold text-gray-800 mt-6">${text}</h${level}>`;
                }
                // Format lists
                if (line.match(/^\d+\./)) {
                  return `<div class="flex gap-2 items-start">
                    <span class="text-blue-500 font-bold">${line.match(/^\d+\./)[0]}</span>
                    <p class="text-gray-700">${line.replace(/^\d+\.\s*/, '')}</p>
                  </div>`;
                }
                // Format normal paragraphs
                return line ? `<p class="text-gray-700">${line}</p>` : '<br/>';
              })
              .join('\n')}
          </div>
          
          <div class="mt-6 pt-4 border-t border-gray-200">
            <p class="text-sm text-gray-500">
              Gerado por ${tools.find(t => t.id === selectedTool)?.title.toLowerCase()}
            </p>
          </div>
        </div>
      `;
  
      setResponse({
        content: formattedResponse,
        loading: false,
        error: null,
      });
  
      const newHistoryItem: HistoryItem = {
        id: uuidv4(),
        toolId: selectedTool,
        query: text || file?.name || youtubeUrl || "Solicitação",
        response: formattedResponse,
        timestamp: new Date(),
      };
  
      setHistory(prev => [newHistoryItem, ...prev]);
      toast.success("Resposta gerada com sucesso!");
  
    } catch (error) {
      console.error('Error:', error);
      setResponse({
        content: "",
        loading: false,
        error: error instanceof Error ? error.message : "Erro ao processar solicitação",
      });
      
      toast.error("Erro ao gerar resposta.");
    }
  };

  const handleSelectHistoryItem = (id: string) => {
    const item = history.find(h => h.id === id);
    if (item) {
      setSelectedTool(item.toolId);
      setResponse({
        content: item.response,
        loading: false,
        error: null,
      });
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    toast.success("Histórico limpo com sucesso!");
  };

  // Add blob elements for background decoration
  const renderBlobs = () => {
    return (
      <>
        <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      </>
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {renderBlobs()}
      <div className="relative z-10">
        <Header />
        
        <main className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-3/4">
              <h2 className="text-2xl font-bold mb-6">Ferramentas</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {tools.map((tool, index) => (
                  <ToolCard
                    key={tool.id}
                    {...tool}
                    index={index}
                    onClick={handleToolSelect}
                    isSelected={selectedTool === tool.id}
                  />
                ))}
              </div>
              
              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-6">
                  {selectedTool
                    ? `${tools.find(t => t.id === selectedTool)?.title || "Ferramenta"}`
                    : "Selecione uma ferramenta para começar"}
                </h2>
                
                <div className="min-h-[300px]">
                  <MainContent selectedTool={selectedTool} response={response} />
                  {selectedTool && (
                    <InputArea
                      selectedTool={selectedTool}
                      onSubmit={handleSubmit}
                    />
                  )}
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-1/4">
              <HistorySection
                history={history}
                onSelectHistoryItem={handleSelectHistoryItem}
                onClearHistory={handleClearHistory}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
