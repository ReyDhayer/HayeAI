
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

export interface AIResponse {
  content: string;
  loading: boolean;
  error: string | null;
}
