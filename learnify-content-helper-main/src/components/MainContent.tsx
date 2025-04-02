
import React from "react";
import { AIResponse } from "@/lib/types";
import { useFadeIn } from "@/lib/animations";

interface MainContentProps {
  selectedTool: string | null;
  response: AIResponse;
  selectedModel?: { icon: string; name: string };
}

const MainContent: React.FC<MainContentProps> = ({ selectedTool, response, selectedModel }) => {
  const fadeIn = useFadeIn(200);

  // Placeholder responses for each tool
  const placeholderMessages: Record<string, string> = {
    assistant: "Olá! Como posso ajudar você hoje? Faça uma pergunta ou peça uma explicação sobre qualquer assunto.",
    generator: "Que tipo de conteúdo você gostaria de gerar? Posso criar poemas, blogs ou ensaios.",
    language: "Qual texto você gostaria de traduzir ou verificar gramaticalmente?",
    essay: "Compartilhe seu ensaio aqui e eu posso aprimorá-lo ou parafraseá-lo para você.",
    summarizer: "Cole um texto longo, link de um livro ou artigo para que eu possa resumi-lo ou extrair palavras-chave.",
    code: "Cole seu código aqui para que eu possa analisá-lo e sugerir aprimoramentos.",
    youtube: "Cole o link de um vídeo do YouTube para que eu possa gerar um resumo do conteúdo.",
  };

  const getPlaceholderContent = () => {
    if (!selectedTool) return "Selecione uma ferramenta para começar";
    return placeholderMessages[selectedTool] || "Como posso ajudar você?";
  };

  const renderContent = () => {
    if (response.loading) {
      return (
        <div className="flex flex-col items-center justify-center h-full py-12">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 bg-blue-500 opacity-70 rounded-full blob"></div>
          </div>
          <p className="mt-4 text-muted-foreground">Processando sua solicitação...</p>
        </div>
      );
    }

    if (response.error) {
      return (
        <div className="p-6 rounded-xl bg-destructive/10 border border-destructive/20">
          <h3 className="text-lg font-medium text-destructive mb-2">Ocorreu um erro</h3>
          <p className="text-muted-foreground">{response.error}</p>
        </div>
      );
    }

    if (response.content) {
      return (
        <div className="prose max-w-none dark:prose-invert">
          {selectedModel && (
            <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
              <span>{selectedModel.icon}</span>
              <span>Resposta do {selectedModel.name}</span>
            </div>
          )}
          <div dangerouslySetInnerHTML={{ __html: response.content }} />
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full py-12 text-center">
        <p className="text-muted-foreground">{getPlaceholderContent()}</p>
      </div>
    );
  };

  return (
    <div className={`glass-panel rounded-2xl p-6 h-full min-h-[400px] overflow-auto ${fadeIn}`}>
      {renderContent()}
    </div>
  );
};

export default MainContent;
