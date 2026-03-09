import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../../lib/api";

export interface Setting {
  key: string;
  value: unknown;
}

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: () => apiFetch<Setting[]>("/api/settings"),
  });
}

export function useSetting(key: string) {
  return useQuery({
    queryKey: ["settings", key],
    queryFn: () => apiFetch<Setting>(`/api/settings/${key}`),
    enabled: !!key,
  });
}

export function useUpdateSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: unknown }) =>
      apiFetch<Setting>(`/api/settings/${key}`, {
        method: "PUT",
        body: JSON.stringify({ value }),
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["settings", variables.key] });
    },
  });
}
