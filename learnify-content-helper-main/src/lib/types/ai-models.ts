export type AIModelType = 'chatgpt' | 'claude' | 'gemini';

export interface AIModel {
  id: AIModelType;
  name: string;
  icon: string;
}

export const AI_MODELS: AIModel[] = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    icon: '🤖'
  },
  {
    id: 'claude',
    name: 'Claude',
    icon: '🧠'
  },
  {
    id: 'gemini',
    name: 'Gemini',
    icon: '✨'
  }
];