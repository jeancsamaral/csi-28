declare module 'llamaai' {
  export interface LlamaAPIOptions {
    apiKey: string | undefined;
  }

  export interface ChatCompletionMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
    name?: string;
  }

  export interface ChatCompletionOptions {
    model: string;
    messages: ChatCompletionMessage[];
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
  }

  export interface ChatCompletionResponse {
    choices: Array<{
      message: {
        content: string;
      };
    }>;
  }

  export class LlamaAPI {
    constructor(options: LlamaAPIOptions);
    
    chat: {
      completions: {
        create(options: ChatCompletionOptions): Promise<ChatCompletionResponse>;
      };
    };
  }
} 