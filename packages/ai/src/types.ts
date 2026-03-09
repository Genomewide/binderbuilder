export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
  stream?: boolean;
}

export interface ChatResponse {
  message: ChatMessage;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
  finishReason?: string;
}

export interface ChatStreamChunk {
  delta: string;
  done: boolean;
  usage?: ChatResponse["usage"];
  finishReason?: string;
}

export interface AiProvider {
  name: string;
  chat(request: ChatRequest): Promise<ChatResponse>;
  chatStream(request: ChatRequest): AsyncIterable<ChatStreamChunk>;
}
