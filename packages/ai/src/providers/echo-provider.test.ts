import { describe, it, expect } from "vitest";
import { echoProvider } from "./echo-provider.js";
import type { ChatRequest } from "../types.js";

describe("EchoProvider", () => {
  const request: ChatRequest = {
    messages: [
      { role: "system", content: "You are helpful." },
      { role: "user", content: "Hello world" },
    ],
  };

  describe("chat", () => {
    it("echoes back the last user message", async () => {
      const response = await echoProvider.chat(request);

      expect(response.message.role).toBe("assistant");
      expect(response.message.content).toBe("Echo: Hello world");
      expect(response.finishReason).toBe("stop");
    });

    it("reports usage", async () => {
      const response = await echoProvider.chat(request);

      expect(response.usage).toBeDefined();
      expect(response.usage!.promptTokens).toBe("Hello world".length);
      expect(response.usage!.completionTokens).toBe("Echo: Hello world".length);
    });

    it("handles missing user message", async () => {
      const noUserRequest: ChatRequest = {
        messages: [{ role: "system", content: "You are helpful." }],
      };
      const response = await echoProvider.chat(noUserRequest);

      expect(response.message.content).toBe("Echo: (no user message)");
    });
  });

  describe("chatStream", () => {
    it("streams the echoed response word by word", async () => {
      const chunks: string[] = [];
      let doneChunk = false;

      for await (const chunk of echoProvider.chatStream(request)) {
        if (chunk.done) {
          doneChunk = true;
          expect(chunk.usage).toBeDefined();
          expect(chunk.finishReason).toBe("stop");
        } else {
          chunks.push(chunk.delta);
        }
      }

      expect(doneChunk).toBe(true);
      expect(chunks.join("")).toBe("Echo: Hello world");
    });

    it("yields a final done chunk", async () => {
      const allChunks = [];
      for await (const chunk of echoProvider.chatStream(request)) {
        allChunks.push(chunk);
      }

      const lastChunk = allChunks[allChunks.length - 1];
      expect(lastChunk.done).toBe(true);
      expect(lastChunk.delta).toBe("");
    });
  });
});
