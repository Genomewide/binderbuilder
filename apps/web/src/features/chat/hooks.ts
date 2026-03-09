import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../../lib/api";
import { useCallback, useRef, useState } from "react";

interface SendMessageResponse {
  userMessage: { id: string; role: string; contentText: string };
  assistantMessage: { id: string; role: string; contentText: string };
}

export function useSendMessage(conversationId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      content,
      provider,
      model,
    }: {
      content: string;
      provider?: string;
      model?: string;
    }) => {
      if (!conversationId) throw new Error("No conversation selected");
      return apiFetch<SendMessageResponse>(
        `/api/chat/${conversationId}/send`,
        {
          method: "POST",
          body: JSON.stringify({ content, provider, model }),
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["messages", { conversationId }],
      });
    },
  });
}

export function useStreamMessage(conversationId: string | null) {
  const queryClient = useQueryClient();
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const stream = useCallback(
    async ({
      content,
      provider,
      model,
    }: {
      content: string;
      provider?: string;
      model?: string;
    }) => {
      if (!conversationId) throw new Error("No conversation selected");

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsStreaming(true);
      setStreamingText("");

      try {
        const res = await fetch(`/api/chat/${conversationId}/stream`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content, provider, model }),
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
        if (!res.body) throw new Error("No response body");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (!jsonStr) continue;

            try {
              const data = JSON.parse(jsonStr);
              if (data.delta !== undefined) {
                accumulated += data.delta;
                setStreamingText(accumulated);
              }
              if (data.done) {
                // Stream finished
              }
            } catch {
              // skip invalid JSON
            }
          }
        }
      } finally {
        setIsStreaming(false);
        setStreamingText("");
        abortRef.current = null;
        queryClient.invalidateQueries({
          queryKey: ["messages", { conversationId }],
        });
      }
    },
    [conversationId, queryClient]
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { stream, streamingText, isStreaming, cancel };
}
