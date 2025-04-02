
export interface ToolProps {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface HistoryItem {
  id: string;
  toolId: string;
  query: string;
  response: string;
  timestamp: Date;
}

export type ToolType = 
  | "assistant" 
  | "generator" 
  | "language" 
  | "essay" 
  | "summarizer" 
  | "code" 
  | "youtube";

// Add these new types
export interface FileAnalysis {
  type: string;
  content: string;
  metadata?: {
    size?: number;
    duration?: number;
    format?: string;
  };
}

// Update AIResponse type
export interface AIResponse {
  content: string;
  loading: boolean;
  error: null | string;
  fileAnalysis?: FileAnalysis;
}


