import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../lib/api";

export interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
}

export function useMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ["messages", { conversationId }],
    queryFn: () =>
      apiFetch<Message[]>(`/api/messages?conversation_id=${conversationId}`),
    enabled: !!conversationId,
  });
}
