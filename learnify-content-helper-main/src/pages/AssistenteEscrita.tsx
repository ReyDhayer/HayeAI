import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import FileUpload from '@/components/FileUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import { useFadeIn } from '@/lib/animations';

interface WritingAnalysis {
  category: string;
  suggestions: string[];
  examples: string[];
}

const AssistenteEscrita: React.FC = () => {
  const fadeIn = useFadeIn(100);
  const [text, setText] = useState('');
  const [documentType, setDocumentType] = useState('artigo');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<WritingAnalysis[]>([]);

  const analyzeTextMock = async () => {
    if (!text.trim()) return;

    setIsAnalyzing(true);
    // Simulação de análise - será substituída por integração com IA
    setTimeout(() => {
      const mockAnalysis: WritingAnalysis[] = [
        {
          category: 'Estrutura do Texto',
          suggestions: [
            'Adicione uma introdução mais clara que apresente o objetivo do trabalho',
            'Organize os parágrafos de forma mais coesa',
            'Fortaleça a conclusão retomando os pontos principais'
          ],
          examples: [
            'Exemplo de introdução: "Este trabalho tem como objetivo analisar..."',
            'Transição entre parágrafos: "Além disso, é importante considerar..."',
            'Conclusão efetiva: "Com base nos argumentos apresentados, conclui-se que..."'
          ]
        },
        {
          category: 'Linguagem Acadêmica',
          suggestions: [
            'Utilize termos técnicos mais precisos',
            'Evite linguagem coloquial',
            'Mantenha um tom formal e objetivo'
          ],
          examples: [
            'Em vez de "falar sobre", use "abordar" ou "discutir"',
            'Substitua "fazer uma pesquisa" por "conduzir uma investigação"',
            'Troque "muito importante" por "fundamental" ou "essencial"'
          ]
        },
        {
          category: 'Citações e Referências',
          suggestions: [
            'Inclua mais citações para fundamentar seus argumentos',
            'Padronize o formato das citações',
            'Verifique se todas as referências estão no texto'
          ],
          examples: [
            'Citação direta: "Segundo Silva (2020, p. 45)..."',
            'Citação indireta: De acordo com Santos (2019), a metodologia...'
          ]
        }
      ];
      setAnalysis(mockAnalysis);
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className={`container mx-auto px-4 py-8 ${fadeIn}`}>
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">Assistente de Escrita Acadêmica</h1>

          <Card className="p-6 mb-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-4">Tipo de Documento</h2>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o tipo de documento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="artigo">Artigo Científico</SelectItem>
                  <SelectItem value="dissertacao">Dissertação</SelectItem>
                  <SelectItem value="tese">Tese</SelectItem>
                  <SelectItem value="relatorio">Relatório Técnico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-4">Seu Texto</h2>
              <Textarea
                placeholder="Cole aqui seu texto acadêmico..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[300px] mb-4"
              />
              <FileUpload
                onFileChange={(files) => {
                  if (files && files[0]) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      if (e.target?.result) {
                        setText(e.target.result as string);
                      }
                    };
                    reader.readAsText(files[0]);
                  }
                }}
                label="Ou envie um arquivo"
                accept=".doc,.docx,.pdf,.txt,.jpg,.jpeg,.png"
              />
              <Button
                onClick={analyzeTextMock}
                disabled={!text.trim() || isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? 'Analisando...' : 'Analisar Texto'}
              </Button>
            </div>
          </Card>

          {analysis.length > 0 && (
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-6">Sugestões de Melhoria</h2>
              <Tabs defaultValue="estrutura" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="estrutura">Estrutura</TabsTrigger>
                  <TabsTrigger value="linguagem">Linguagem</TabsTrigger>
                  <TabsTrigger value="citacoes">Citações</TabsTrigger>
                </TabsList>

                {analysis.map((section, index) => (
                  <TabsContent key={index} value={section.category.toLowerCase().replace(' ', '-')}>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold mb-4">Sugestões</h3>
                        <ul className="list-disc list-inside space-y-2">
                          {section.suggestions.map((suggestion, idx) => (
                            <li key={idx} className="text-gray-700">{suggestion}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold mb-4">Exemplos</h3>
                        <div className="bg-muted p-4 rounded-lg space-y-3">
                          {section.examples.map((example, idx) => (
                            <p key={idx} className="text-gray-700">{example}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default AssistenteEscrita;