import { API_CONFIG } from './config';
import { Anthropic } from '@anthropic-ai/sdk';
import { ContentBlock } from '../types/ai-models';

const client = new Anthropic({
  apiKey: API_CONFIG.CLAUDE_API_KEY
});

export interface ClaudeResponse {
  content: string;
  error?: string;
}

export async function generateClaudeResponse(prompt: string): Promise<ClaudeResponse> {
  try {
    const message = await client.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 20000,
      temperature: 1,
      messages: [{
        role: 'user',
        content: prompt
      }],
      system: 'Você é um assistente AI especializado em ajudar com tarefas acadêmicas e de aprendizado.'
    });

    return {
      content: (message.content[0] as ContentBlock).text
    };
  } catch (error) {
    console.error('Erro ao gerar resposta do Claude:', error);
    return {
      content: '',
      error: 'Erro ao processar a requisição. Por favor, tente novamente.'
    };
  }
}