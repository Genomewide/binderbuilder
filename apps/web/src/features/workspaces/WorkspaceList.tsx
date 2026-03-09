import { useState } from "react";
import { useWorkspaceSelectionStore } from "@baseui/state";
import { useWorkspaces, useCreateWorkspace } from "./hooks";

export function WorkspaceList() {
  const { data: workspaces, isLoading, error } = useWorkspaces();
  const createWorkspace = useCreateWorkspace();
  const { activeWorkspaceId, setActiveWorkspace } = useWorkspaceSelectionStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");

  const handleCreate = () => {
    if (!newName.trim()) return;
    createWorkspace.mutate(
      { name: newName.trim() },
      {
        onSuccess: (ws) => {
          setNewName("");
          setShowCreate(false);
          setActiveWorkspace(ws.id);
        },
      },
    );
  };

  if (isLoading) {
    return <p className="text-xs text-muted-foreground p-2">Loading workspaces...</p>;
  }

  if (error) {
    return <p className="text-xs text-destructive p-2">Failed to load workspaces</p>;
  }

  return (
    <div className="space-y-1">
      {workspaces?.map((ws) => (
        <button
          key={ws.id}
          onClick={() => setActiveWorkspace(ws.id)}
          className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
            activeWorkspaceId === ws.id
              ? "bg-accent text-accent-foreground"
              : "hover:bg-muted text-foreground"
          }`}
        >
          {ws.name}
        </button>
      ))}

      {showCreate ? (
        <div className="p-2 space-y-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="Workspace name"
            autoFocus
            className="w-full px-2 py-1 text-sm rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <div className="flex gap-1">
            <button
              onClick={handleCreate}
              disabled={createWorkspace.isPending}
              className="flex-1 px-2 py-1 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              Create
            </button>
            <button
              onClick={() => {
                setShowCreate(false);
                setNewName("");
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
          className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:bg-muted rounded-md"
        >
          + New workspace
        </button>
      )}
    </div>
  );
}
