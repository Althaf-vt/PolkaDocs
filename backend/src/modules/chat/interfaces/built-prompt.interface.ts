import { ChatMessage } from '../../llm/interfaces/llm-provider.interface';

export interface BuiltPrompt {
    systemInstruction: string;
    messages: ChatMessage[];
}