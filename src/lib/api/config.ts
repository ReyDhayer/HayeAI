declare global {
  interface ImportMeta {
    env: {
      VITE_CLAUDE_API_KEY: string;
    }
  }
}

export const API_CONFIG = {
  CLAUDE_API_KEY: import.meta.env.VITE_CLAUDE_API_KEY || '',
  API_ENDPOINT: 'https://api.anthropic.com/v1/complete'
};