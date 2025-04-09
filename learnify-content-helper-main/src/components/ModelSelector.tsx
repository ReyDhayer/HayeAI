import React from 'react';
import { AIModel, AI_MODELS } from '../lib/types/ai-models';
import { handleModelSelection } from '../lib/api/modelSelector';

interface ModelSelectorProps {
  onModelSelect: (response: string) => void;
  message: string;
}

export function ModelSelector({ onModelSelect, message }: ModelSelectorProps) {
  const handleModelClick = async (model: AIModel) => {
    try {
      const response = await handleModelSelection(model, message);
      if (response.error) {
        console.error('Erro:', response.error);
        return;
      }
      onModelSelect(response.content);
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
    }
  };

  return (
    <div className="flex gap-4 p-4">
      {AI_MODELS.map((model) => (
        <button
          key={model.id}
          onClick={() => handleModelClick(model)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          <span>{model.icon}</span>
          <span>{model.name}</span>
        </button>
      ))}
    </div>
  );
}