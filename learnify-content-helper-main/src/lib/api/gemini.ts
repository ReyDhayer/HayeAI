import { AIResponse } from '../types';

export async function sendMessageToGemini(message: string): Promise<AIResponse> {
  try {
    // Aqui você deve implementar a chamada para a API do Gemini
    // Exemplo de implementação:
    const response = await fetch('https://api.gemini.ai/v1/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`
      },
      body: JSON.stringify({
        message: message
      })
    });

    if (!response.ok) {
      throw new Error('Falha ao se comunicar com a API do Gemini');
    }

    const data = await response.json();
    
    return {
      content: data.response,
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