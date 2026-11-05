export const LLM_PROVIDER = Symbol('LLM_PROVIDER');

// Chat message role union type
export type ChatRole = 'user' | 'assistant' | 'system';

// Universal chat message structure
export interface ChatMessage {
  role: ChatRole;
  content: string;
}

// Payload input accepted by LLM providers
export interface GenerateInput {
  prompt?: string;
  messages?: ChatMessage[];
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
}

// Generation response contract including token metadata
export interface GenerateOutput {
  content: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

export interface LlmProvider {
  generate(input: GenerateInput): Promise<GenerateOutput>;
  stream(input: GenerateInput): AsyncIterable<string>;
}