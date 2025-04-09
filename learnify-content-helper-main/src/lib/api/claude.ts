import { AIResponse } from '../types';

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || '';
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

export async function sendMessageToClaude(message: string): Promise<AIResponse> {
  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: message }],
        model: 'claude-3-opus-20240229',
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na API do Claude: ${response.status}`);
    }

    const data = await response.json();
    return {
      content: data.content[0].text,
      loading: false,
      error: null
    };
  } catch (error) {
    return {
      content: '',
      loading: false,
      error: `Erro ao processar mensagem: ${error.message}`
    };
  }
}