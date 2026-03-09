import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../../lib/api";

export interface Conversation {
  id: string;
  workspace_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export function useConversations(workspaceId: string | null) {
  return useQuery({
    queryKey: ["conversations", { workspaceId }],
    queryFn: () =>
      apiFetch<Conversation[]>(`/api/conversations?workspace_id=${workspaceId}`),
    enabled: !!workspaceId,
  });
}

export function useConversation(id: string | null) {
  return useQuery({
    queryKey: ["conversations", id],
    queryFn: () => apiFetch<Conversation>(`/api/conversations/${id}`),
    enabled: !!id,
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { workspace_id: string; title: string }) =>
      apiFetch<Conversation>("/api/conversations", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["conversations", { workspaceId: variables.workspace_id }],
      });
    },
  });
}
