import { AIModel } from '../types/ai-models';
import { AIResponse } from '../types';
import { sendMessageToClaude } from './claude';
import { sendMessageToGemini } from './gemini';

export async function handleModelSelection(selectedModel: AIModel, message: string): Promise<AIResponse> {
  switch (selectedModel.id) {
    case 'claude':
      return await sendMessageToClaude(message);
    case 'gemini':
      return await sendMessageToGemini(message);
    default:
      return {
        content: '',
        loading: false,
        error: 'Modelo não implementado'
      };
  }
}