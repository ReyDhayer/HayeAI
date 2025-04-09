
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
import { useNavigate } from 'react-router-dom';
import { AIModel } from '../lib/types/ai-models';


const Index = () => {
  const navigate = useNavigate();
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [response, setResponse] = useState<AIResponse>({
    content: "",
    loading: false,
    error: null,
  });

  const tools: ToolProps[] = [
    {
   
      id: "flashcards",
      title: "Flashcards Inteligentes",
      description: "Crie e estude com flashcards adaptáveis usando IA",
      icon: "Brain",
    },
    {
      id: "gestao-financeira",
      title: "Gestão Financeira",
      description: "Gerencie suas finanças pessoais e acadêmicas com facilidade",
      icon: "DollarSign",
    },
    {
      id: "debate-simulator",
      title: "Simulador de Debate",
      description: "Treina argumentação para apresentações e discussões em sala de aula",
      icon: "MessageSquare",
    },
    {
      id: "qa-creator",
      title: "Criador de Perguntas e Respostas",
      description: "Gera questões para testar o aprendizado sobre qualquer tema",
      icon: "HelpCircle",
    },
    {
      id: "exercise-explainer",
      title: "Explicador de Exercícios",
      description: "Resolve e explica passo a passo exercícios matemáticos, físicos e químicos",
      icon: "Calculator",
    },
    {
      id: "text-narrator",
      title: "Narrador de Textos",
      description: "Converte textos acadêmicos em áudio para facilitar o estudo",
      icon: "Headphones",
    },
    { 
      id: "peer-review",
      title: "Simulador de Revisão por Pares",
      description: "Teste seu artigo como se estivesse passando por uma revisão acadêmica real",
      icon: "Users",
    },
    {
      id: "quiz-generator",
      title: "Gerador de Questionários",
      description: "Cria questionários e formulários para coletas de dados em pesquisas",
      icon: "ListChecks",
    },
    {
      id: "exam-simulator",
      title: "Simulador de Provas",
      description: "Gera simulados com questões de vestibulares, ENEM e concursos",
      icon: "FileCheck",
    },
    {
      id: "defense-simulator",
      title: "Simulador de Defesa",
      description: "Pratique sua defesa de tese com feedback em tempo real",
      icon: "Presentation",
    },
    {
      id: "monitor-prazos",
      title: "Monitor de Prazos",
      description: "Acompanhe prazos de submissões e entregas acadêmicas",
      icon: "Calendar",
    },
    {
      id: "gerador-imagem",
      title: "Gerador de Imagem",
      description: "Crie imagens personalizadas com inteligência artificial",
      icon: "Image",
    },
    {
      id: "gerador-video",
      title: "Gerador de Vídeo",
      description: "Produza vídeos profissionais automaticamente",
      icon: "Video",
    },
    {
      id: "mind-map",
      title: "Mapa Mental AI",
      description: "Crie mapas mentais avançados com inteligência artificial",
      icon: "Brain",
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
      id: "language22",
      title: "Idioma",
      description: "Traduza textos e faça perguntas mais abertas e verifique a gramática",
      icon: "Globe",
    },
    {
      id: "essay",
      title: "Ajudante de Ensaios",
      description: "Aprimore e parafraseie seus textos acadêmicos",
      icon: "FileText",
    },
    {
      id: "essay-correction",
      title: "Corretor de Redações",
      description: "Análise detalhada e correção de redações com feedback personalizado",
      icon: "ClipboardCheck",
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
    {
      id: "bibliography-analyzer",
      title: "Analisador de Bibliografia",
      description: "Analise e organize suas referências bibliográficas",
      icon: "BookOpen",
    },
    {
      id: "methodology-assistant",
      title: "Assistente de Metodologia",
      description: "Orientação na escolha e aplicação de metodologias científicas",
      icon: "FlaskConical",
    },
    {
      id: "presentation-generator",
      title: "Gerador de Apresentações",
      description: "Crie apresentações acadêmicas profissionais e impactantes",
      icon: "Projector",
    },
  ];

  const handleToolSelect = (id: string) => {
    switch (id) {
      case "language":
        navigate("/idiomas");
        break;
      case "language2":
        navigate("/idiomas");
        break;
      case "essay":
        navigate("/assistente-escrita");
        break;
      case "essay-correction":
        navigate("/corretor-redacoes");
        break;
      case "advanced-correction":
        navigate("/corretor-avancado");
        break;
      case "correction":
        navigate("/corretor");
        break;
      case "summarizer":
        navigate("/biblioteca-conteudo");
        break;
      case "flashcards":
        navigate("/flashcards");
        break;
      case "monitor-prazos":
        navigate("/monitor-prazos");
        break;
      case "mind-map":
        navigate("/mind-map");
        break;
      case "gestao-financeira":
        navigate("/gestao-financeira");
        break;
      case "gerador-imagem":
        navigate("/gerador-imagem");
        break;
      case "gerador-video":
        navigate("/gerador-video");
        break;
      case "jogos":
        navigate("/jogos");
        break;
      case "conhecimentos-gerais":
        navigate("/jogos/conhecimentos-gerais");
        break;
      case "enem":
        navigate("/enem");
        break;
      case "text-narrator":
        navigate("/narrador-textos");
        break;
      case "plagiarism":
        navigate("/analise-plagio");
        break;
      case "content-library":
        navigate("/biblioteca-conteudo");
        break;
      case "language":
        navigate("/idiomas");
        break;
      case "code":
        navigate("/aprimorador-codigo");
        break;
      case "defense-simulator":
        navigate("/simulador-defesa");
        break;
      case "peer-review":
        navigate("/simulador-revisao-pares");
        break;
      case "youtube":
        navigate("/resumo-youtube");
        break;
      case "research":
        navigate("/assistente-pesquisa");
        break;
      case "academic-writing":
        navigate("/assistente-escrita");
        break;
      case "article-analysis":
        navigate("/analise-artigos");
        break;
      case "essay-generator":
        navigate("/gerador-redacoes");
        break;
      case "bibliography-analyzer":
        navigate("/analisador-bibliografia");
        break;
      case "methodology-assistant":
        navigate("/assistente-metodologia");
        break;
      case "exercise-explainer":
        navigate("/explicador-exercicios");
        break;
      default:
        setSelectedTool(id);
        setResponse({
          content: "",
          loading: false,
          error: null,
        });
    }
  };

  const handleSubmit = async (text: string, model: AIModel, file?: File | null, youtubeUrl?: string) => {
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

      let fileContent = "";
      let fileType = "";

      if (file) {
        fileType = file.type;
        
        if (file.type.startsWith('audio/')) {
          // Handle audio file
          const audioContext = new AudioContext();
          const arrayBuffer = await file.arrayBuffer();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          // Convert audio to text using Web Speech API
          const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
          recognition.lang = 'pt-BR';
          
          fileContent = await new Promise((resolve, reject) => {
            recognition.onresult = (event) => {
              const transcript = event.results[0][0].transcript;
              resolve(transcript);
            };
            recognition.onerror = reject;
            recognition.start();
          });
        } else {
          // Handle text files
          fileContent = await file.text();
        }
      }

      const genAI = new GoogleGenerativeAI("AIzaSyBjrD1WtKKseislU-NuWpdU0o5qUziX5A0");
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro-exp-03-25" });

      let prompt = "";
      switch (selectedTool) {
        case "defense-simulator":
          prompt = `Como um simulador de defesa de tese, vou atuar como uma banca examinadora virtual para: ${text}. 
          Forneça:
          1. Análise da apresentação
          2. Questões típicas da banca
          3. Sugestões de melhoria
          4. Feedback detalhado
          5. Pontos fortes e fracos`;
          break;
        case "deadline-monitor":
          prompt = `Como um monitor de prazos acadêmicos, analise e organize os seguintes prazos e compromissos: ${text}.
          Forneça:
          1. Cronograma organizado
          2. Alertas de proximidade
          3. Sugestões de priorização
          4. Marcos importantes
          5. Recomendações de gestão de tempo`;
          break;
        case "defense-assistant":
          prompt = `Como um assistente de defesa de tese, ajude a preparar e estruturar a defesa: ${text}.
          Forneça:
          1. Estrutura da apresentação
          2. Pontos-chave a destacar
          3. Estratégias de comunicação
          4. Dicas de postura e oratória
          5. Preparação para perguntas`;
          break;
        case "mind-map":
          prompt = `Como um criador de mapas mentais, organize as seguintes ideias e conceitos: ${text}.
          Forneça:
          1. Estrutura hierárquica
          2. Conexões entre conceitos
          3. Palavras-chave principais
          4. Ramificações secundárias
          5. Sugestões de expansão`;
          break;

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
  
      // Add file analysis to the prompt if a file is present
      if (fileContent) {
        prompt += `\n\nAnálise do arquivo (${fileType}): ${fileContent}`;
      }

      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      // Format the response with better HTML structure and animations
      const formattedResponse = `
        <div class="prose max-w-none space-y-6 backdrop-blur-lg bg-white/40 rounded-2xl p-8 shadow-2xl border border-white/30 animate-fade-in">
          <div class="bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-2xl p-6 mb-8 transform hover:scale-[1.02] transition-all duration-500 shadow-xl hover:shadow-2xl animate-slide-up">
            <div class="flex items-center gap-4 mb-4">
              <div class="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-inner animate-pulse">
                <span class="text-white text-2xl font-bold">
                  ${(() => {
                    const tool = tools.find(t => t.id === selectedTool);
                    switch(tool?.icon) {
                      case 'HelpCircle': return '❓';
                      case 'Pencil': return '✏️';
                      case 'Globe': return '🌎';
                      case 'FileText': return '📄';
                      case 'Book': return '📚';
                      case 'Code': return '💻';
                      case 'Youtube': return '▶️';
                      default: return '🔍';
                    }
                  })()}
                </span>
              </div>
              <h2 class="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
                ${tools.find(t => t.id === selectedTool)?.title}
              </h2>
            </div>
            <p class="text-gray-700 italic text-xl font-medium">Consulta: ${text}</p>
          </div>
          
          <div class="space-y-8">
            ${response.text()
              .split('\n')
              .map((line, index) => {
                // Format headings
                if (line.startsWith('#')) {
                  const level = line.match(/^#+/)[0].length;
                  const text = line.replace(/^#+\s*/, '');
                  return `<h${level} class="text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent py-6 animate-fade-in" style="animation-delay: ${index * 100}ms">${text}</h${level}>`;
                }
                // Format lists
                if (line.match(/^\d+\./)) {
                  return `<div class="flex gap-6 items-start p-6 bg-white/50 rounded-xl hover:bg-white/70 transition-all duration-500 backdrop-blur-md shadow-lg hover:shadow-xl animate-slide-up" style="animation-delay: ${index * 100}ms">
                    <span class="flex items-center justify-center w-10 h-10 text-white text-xl font-bold bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl shadow-inner">${line.match(/^\d+\./)[0].replace('.', '')}</span>
                    <p class="text-gray-800 text-xl font-medium flex-1 leading-relaxed">${line.replace(/^\d+\.\s*/, '')}</p>
                  </div>`;
                }
                // Format normal paragraphs
                return line ? `<p class="text-gray-800 text-xl font-medium leading-relaxed hover:bg-white/50 p-6 rounded-xl transition-all duration-500 animate-fade-in" style="animation-delay: ${index * 100}ms">${line}</p>` : '<br/>';
              })
              .join('\n')}
          </div>
          
          <div class="mt-10 pt-8 border-t border-white/30">
            <p class="text-base text-gray-600 flex items-center gap-3 font-medium">
              <span class="w-3 h-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-pulse"></span>
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
                      onSubmit={(text, model, fileData, youtubeUrl) => {
                        handleSubmit(text, model, fileData, youtubeUrl);
                      }}
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

const Home: React.FC = () => {
  return (
    <div>
  
    </div>
  );
};

// Remove duplicate default export since Index is already exported
