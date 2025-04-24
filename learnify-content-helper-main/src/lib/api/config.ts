export const API_CONFIG = {
  CLAUDE_API_KEY: process.env.VITE_CLAUDE_API_KEY || '',
  API_ENDPOINT: 'https://api.anthropic.com/v1/complete',
  GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY || '',
  GEMINI_API_ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'
};