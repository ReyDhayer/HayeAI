export interface AIModel {
  id: string;
  name: string;
  icon: string;
}

export interface ContentBlock {
  type: string;
  text: string;
}

export interface ToolUseBlock extends ContentBlock {
  type: 'tool_use';
  text: string;
  tool_name: string;
  tool_args: Record<string, any>;
}

export const AI_MODELS: AIModel[] = [
  {
    id: 'claude',
    name: 'Claude',
    icon: '🤖'
  },
  {
    id: 'gpt4',
    name: 'GPT-4',
    icon: '✨'
  },
  {
    id: 'gpt35',
    name: 'GPT-3.5',
    icon: '🚀'
  }
];