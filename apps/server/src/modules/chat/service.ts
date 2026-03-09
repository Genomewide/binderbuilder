import { createMessagesRepository } from "../messages/repository.js";
import { getProvider } from "@baseui/ai";
import type { ChatMessage, AiProvider } from "@baseui/ai";
import type { AppDatabase } from "../../lib/db.js";

export function createChatService(db: AppDatabase) {
  const messagesRepo = createMessagesRepository(db);

  return {
    async sendMessage(
      conversationId: string,
      content: string,
      providerName = "echo",
      model?: string
    ) {
      // 1. Save user message
      const userMessage = await messagesRepo.create({
        conversationId,
        role: "user",
        contentText: content,
        status: "complete",
      });

      // 2. Fetch conversation history
      const history = await messagesRepo.findByConversationId(conversationId);

      // 3. Convert DB messages to ChatMessage format
      const chatMessages: ChatMessage[] = history.map((msg) => ({
        role: msg.role as ChatMessage["role"],
        content: msg.contentText ?? "",
      }));

      // 4. Call AI provider
      const provider = getProvider(providerName);
      const response = await provider.chat({
        messages: chatMessages,
        model,
      });

      // 5. Save assistant response
      const assistantMessage = await messagesRepo.create({
        conversationId,
        role: "assistant",
        contentText: response.message.content,
        status: "complete",
        metadataJson: response.usage
          ? JSON.stringify({
              usage: response.usage,
              finishReason: response.finishReason,
            })
          : null,
      });

      return { userMessage, assistantMessage };
    },

    async streamMessage(
      conversationId: string,
      content: string,
      providerName = "echo",
      model?: string
    ) {
      // 1. Save user message
      const userMessage = await messagesRepo.create({
        conversationId,
        role: "user",
        contentText: content,
        status: "complete",
      });

      // 2. Fetch conversation history
      const history = await messagesRepo.findByConversationId(conversationId);

      // 3. Convert DB messages to ChatMessage format
      const chatMessages: ChatMessage[] = history.map((msg) => ({
        role: msg.role as ChatMessage["role"],
        content: msg.contentText ?? "",
      }));

      // 4. Get provider and stream
      const provider = getProvider(providerName);
      const stream = provider.chatStream({
        messages: chatMessages,
        model,
        stream: true,
      });

      return {
        userMessage,
        stream,
        async saveAssistantMessage(fullContent: string, metadata?: Record<string, unknown>) {
          return messagesRepo.create({
            conversationId,
            role: "assistant",
            contentText: fullContent,
            status: "complete",
            metadataJson: metadata ? JSON.stringify(metadata) : null,
          });
        },
      };
    },
  };
}
