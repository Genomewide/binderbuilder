import { useState } from "react";
import { useWorkspaceSelectionStore } from "@baseui/state";
import { useConversations, useCreateConversation } from "./hooks";

export function ConversationList() {
  const { activeWorkspaceId, activeConversationId, setActiveConversation } =
    useWorkspaceSelectionStore();
  const { data: conversations, isLoading } = useConversations(activeWorkspaceId);
  const createConversation = useCreateConversation();
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  if (!activeWorkspaceId) return null;

  const handleCreate = () => {
    if (!newTitle.trim() || !activeWorkspaceId) return;
    createConversation.mutate(
      { workspace_id: activeWorkspaceId, title: newTitle.trim() },
      {
        onSuccess: (conv) => {
          setNewTitle("");
          setShowCreate(false);
          setActiveConversation(conv.id);
        },
      },
    );
  };

  if (isLoading) {
    return <p className="text-xs text-muted-foreground px-2">Loading...</p>;
  }

  return (
    <div className="space-y-1">
      <div className="px-3 py-1">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Conversations
        </span>
      </div>

      {conversations?.map((conv) => (
        <button
          key={conv.id}
          onClick={() => setActiveConversation(conv.id)}
          className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors ${
            activeConversationId === conv.id
              ? "bg-accent text-accent-foreground"
              : "hover:bg-muted text-foreground"
          }`}
        >
          {conv.title}
        </button>
      ))}

      {conversations?.length === 0 && (
        <p className="text-xs text-muted-foreground px-3">No conversations yet</p>
      )}

      {showCreate ? (
        <div className="p-2 space-y-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="Conversation title"
            autoFocus
            className="w-full px-2 py-1 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <div className="flex gap-1">
            <button
              onClick={handleCreate}
              disabled={createConversation.isPending}
              className="flex-1 px-2 py-1 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              Create
            </button>
            <button
              onClick={() => {
                setShowCreate(false);
                setNewTitle("");
              }}
              className="flex-1 px-2 py-1 text-xs rounded-md border border-border hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowCreate(true)}
          className="w-full text-left px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted rounded-md"
        >
          + New conversation
        </button>
      )}
    </div>
  );
}
