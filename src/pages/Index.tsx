
import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
// Define types inline since @/lib/types module is not found
interface ToolProps {
  id: string;
  title: string;
  description: string;
  icon: string;
  index?: number;
  onClick?: (id: string) => void;
  isSelected?: boolean;
}

interface HistoryItem {
  id: string;
  toolId: string;
  query: string;
  response: string;
  timestamp: Date;
}

interface AIResponse {
  content: string;
  loading: boolean;
  error: string | null;
}
import Header from "../components/Header";
import ToolCard from "../components/ToolCard";

// Temporarily comment out HistorySection import until the module is fixed
// import HistorySection from "../components/HistorySection";


import { toast } from "sonner";
import { Book, Code, FileText, Globe, HelpCircle, Pencil, Youtube, Presentation, Calendar, ClipboardList, Network, Search, Quote, Edit3, Shield, FileSearch, Library, CheckSquare } from "lucide-react";
import InputArea from "../components/InputArea";
import HistorySection from "../components/HistorySection";

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
      id: "defense-simulation",
      title: "Simulação de Defesa",
      description: "Prepare-se para sua defesa com simulações interativas e feedback detalhado",
      icon: "Presentation",
    },
    {
      id: "deadline-tracker",
      title: "Monitoramento de Prazos",
      description: "Acompanhe prazos de submissões e entregas acadêmicas",
      icon: "Calendar",
    },
    {
      id: "submission-manager",
      title: "Gerenciador de Submissões",
      description: "Organize e acompanhe suas submissões acadêmicas",
      icon: "ClipboardList",
    },
    {
      id: "mind-map",
      title: "Mapa Mental",
      description: "Crie mapas mentais interativos para organizar suas ideias",
      icon: "Network",
    },
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
      // Clear previous response
      setResponse({
        content: "",
        loading: true,
        error: null,
      });

      // Simulate API call with timeout
      setTimeout(() => {
        // This would be replaced with actual API call in production
        const toolName = tools.find(t => t.id === selectedTool)?.title || "Ferramenta";
        
        // Create mock response based on tool and input
        let mockResponse = "";
        if (text) {
          mockResponse = `<h3>Resposta do ${toolName}</h3><p>Aqui está uma resposta para: "${text}"</p>`;
          
          if (file) {
            mockResponse += `<p>Arquivo processado: ${file.name}</p>`;
          }
          
          if (youtubeUrl) {
            mockResponse += `<p>Link do YouTube analisado: ${youtubeUrl}</p>`;
          }
          
          // Add some more detailed mock content based on the tool
          switch(selectedTool) {
            case "assistant":
              mockResponse += "<p>Como assistente, posso explicar conceitos, responder perguntas e fornecer informações detalhadas sobre qualquer assunto.</p>";
              break;
            case "generator":
              mockResponse += "<p>Como gerador de conteúdo, posso criar poemas, artigos de blog e ensaios completos com base nas suas instruções.</p>";
              break;
            case "language":
              mockResponse += "<p>Como ferramenta de idioma, posso traduzir textos, verificar gramática e ortografia, e ajudar com a fluência em diferentes línguas.</p>";
              break;
            case "essay":
              mockResponse += "<p>Como ajudante de ensaios, posso aprimorar a estrutura, clareza e estilo dos seus textos acadêmicos, além de parafrasear conteúdo.</p>";
              break;
            case "summarizer":
              mockResponse += "<p>Como resumidor, posso condensar textos longos, extrair os pontos principais e identificar palavras-chave importantes.</p>";
              break;
            case "code":
              mockResponse += "<p>Como aprimorador de código, posso otimizar, refatorar e corrigir problemas no seu código, além de sugerir melhorias de performance.</p>";
              break;
            case "youtube":
              mockResponse += "<p>Como resumidor de YouTube, posso analisar vídeos e fornecer sínteses claras do conteúdo, pontos principais e conclusões.</p>";
              break;
          }
        } else if (file) {
          mockResponse = `<h3>Arquivo Processado</h3><p>Analisamos seu arquivo: ${file.name}</p>`;
        } else if (youtubeUrl) {
          mockResponse = `<h3>Resumo do Vídeo</h3><p>Analisamos o vídeo: ${youtubeUrl}</p><p>Este é um resumo simulado do conteúdo do vídeo. Em uma implementação real, extrairíamos informações do vídeo do YouTube.</p>`;
        }

        // Update response state
        setResponse({
          content: mockResponse,
          loading: false,
          error: null,
        });

        // Add to history
        const newHistoryItem: HistoryItem = {
          id: uuidv4(),
          toolId: selectedTool || "",
          query: text || file?.name || youtubeUrl || "Solicitação",
          response: mockResponse,
          timestamp: new Date(),
        };

        setHistory(prev => [newHistoryItem, ...prev]);
        
        // Show toast notification
        toast.success("Resposta gerada com sucesso!");
      }, 1500);
    } catch (error) {
      setResponse({
        content: "",
        loading: false,
        error: "Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.",
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
                  {selectedTool && response && (
                    <div className="bg-white rounded-lg p-6 shadow-lg">
                      {response.loading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                      ) : response.error ? (
                        <div className="text-red-500">{response.error}</div>
                      ) : (
                        <div dangerouslySetInnerHTML={{ __html: response.content }} />
                      )}
                    </div>
                  )}
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
              {/* Import HistorySection component before using it */}
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