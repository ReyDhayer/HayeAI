import { AIResponse } from '../types';
import { API_CONFIG } from './config';

export async function sendMessageToGemini(message: string): Promise<AIResponse> {
  try {
    const response = await fetch(API_CONFIG.GEMINI_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': API_CONFIG.GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: message
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error('Falha ao se comunicar com a API do Gemini');
    }

    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text;
    
    return {
      content,
      loading: false,
      error: null
    };
  } catch (error) {
    return {
      content: '',
      loading: false,
      error: error instanceof Error ? error.message : 'Erro ao processar mensagem com Gemini'
    };
  }
}