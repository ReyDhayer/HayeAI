import axios from 'axios';

const GOOGLE_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GOOGLE_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

interface GoogleAIResponse {
  content: string;
  error?: string;
}

const generatePromptByTool = (toolId: string, text: string, file?: File | null, youtubeUrl?: string): string => {
  const prompts: { [key: string]: string } = {
    assistant: `Atue como um assistente de aprendizagem especializado. Responda de forma clara e didática. Pergunta: ${text}`,
    generator: `Atue como um gerador de conteúdo criativo. Crie conteúdo original e envolvente sobre: ${text}`,
    language: `Atue como um especialista em idiomas. Analise ou traduza o seguinte texto: ${text}`,
    essay: `Atue como um assistente de redação acadêmica. Ajude com o seguinte texto: ${text}`,
    summarizer: `Atue como um especialista em resumos. Faça um resumo claro e conciso do seguinte texto: ${text}`,
    code: `Atue como um especialista em programação. Analise ou melhore o seguinte código: ${text}`,
    youtube: `Analise e resuma o conteúdo do vídeo: ${youtubeUrl || text}`,
    // ... other prompts remain the same ...
  };

  const basePrompt = `Você é um assistente especializado. Por favor, responda em português do Brasil. `;
  return basePrompt + (prompts[toolId] || text);
};

export const callGoogleAI = async (toolId: string, text: string, file?: File | null, youtubeUrl?: string): Promise<GoogleAIResponse> => {
  try {
    const prompt = generatePromptByTool(toolId, text, file, youtubeUrl);

    const response = await axios({
      method: 'POST',
      url: `${GOOGLE_API_URL}?key=${GOOGLE_API_KEY}`,
      data: {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('API Response:', response.data);

    if (response.data && response.data.candidates && response.data.candidates[0]) {
      return {
        content: response.data.candidates[0].content.parts[0].text,
        error: null
      };
    }

    throw new Error('Invalid response format from API');

  } catch (error) {
    console.error('API Error Details:', error);
    return {
      content: '',
      error: error.response?.data?.error?.message || 'Failed to connect to Google AI API'
    };
  }
};