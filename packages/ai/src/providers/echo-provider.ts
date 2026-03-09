import type { AiProvider, ChatRequest, ChatResponse, ChatStreamChunk } from "../types.js";

function getLastUserContent(request: ChatRequest): string {
  for (let i = request.messages.length - 1; i >= 0; i--) {
    if (request.messages[i].role === "user") {
      return request.messages[i].content;
    }
  }
  return "(no user message)";
}

export const echoProvider: AiProvider = {
  name: "echo",

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const userContent = getLastUserContent(request);
    const responseText = `Echo: ${userContent}`;
    return {
      message: {
        role: "assistant",
        content: responseText,
      },
      usage: {
        promptTokens: userContent.length,
        completionTokens: responseText.length,
      },
      finishReason: "stop",
    };
  },

  async *chatStream(request: ChatRequest): AsyncIterable<ChatStreamChunk> {
    const userContent = getLastUserContent(request);
    const responseText = `Echo: ${userContent}`;
    const words = responseText.split(/(\s+)/);

    for (let i = 0; i < words.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 10));
      yield {
        delta: words[i],
        done: false,
      };
    }

    yield {
      delta: "",
      done: true,
      usage: {
        promptTokens: userContent.length,
        completionTokens: responseText.length,
      },
      finishReason: "stop",
    };
  },
};
