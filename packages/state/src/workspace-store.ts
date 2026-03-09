import { createPersistedStore } from "./create-persisted-store.js";

export interface WorkspaceSelectionState {
  activeWorkspaceId: string | null;
  activeConversationId: string | null;
  setActiveWorkspace: (id: string | null) => void;
  setActiveConversation: (id: string | null) => void;
}

export const useWorkspaceSelectionStore =
  createPersistedStore<WorkspaceSelectionState>(
    (set) => ({
      activeWorkspaceId: null,
      activeConversationId: null,
      setActiveWorkspace: (id) =>
        set({ activeWorkspaceId: id, activeConversationId: null }),
      setActiveConversation: (id) => set({ activeConversationId: id }),
    }),
    {
      name: "baseui-workspace-selection",
      version: 1,
    },
  );
