export interface ToolProps {
  id: string;
  title: string;
  description: string;
  icon: string;
  index?: number;
  onClick?: (id: string) => void;
  isSelected?: boolean;
}

export interface HistoryItem {
  id: string;
  toolId: string;
  query: string;
  response: string;
  timestamp: Date;
}

export interface AIResponse {
  content: string;
  loading: boolean;
  error: string | null;
}