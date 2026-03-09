import { useState } from "react";
import { useWorkspace, useUpdateWorkspace } from "./hooks";

interface WorkspaceDetailProps {
  workspaceId: string;
}

export function WorkspaceDetail({ workspaceId }: WorkspaceDetailProps) {
  const { data: workspace, isLoading } = useWorkspace(workspaceId);
  const updateWorkspace = useUpdateWorkspace();
  const [editing, setEditing] = useState<"name" | "description" | null>(null);
  const [editValue, setEditValue] = useState("");

  if (isLoading || !workspace) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  const startEdit = (field: "name" | "description") => {
    setEditing(field);
    setEditValue(field === "name" ? workspace.name : workspace.description ?? "");
  };

  const saveEdit = () => {
    if (!editing) return;
    const trimmed = editValue.trim();
    if (editing === "name" && !trimmed) return;

    updateWorkspace.mutate(
      { id: workspaceId, [editing]: trimmed },
      { onSuccess: () => setEditing(null) },
    );
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditValue("");
  };

  return (
    <div className="space-y-3">
      <div>
        {editing === "name" ? (
          <input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveEdit();
              if (e.key === "Escape") cancelEdit();
            }}
            autoFocus
            className="text-lg font-semibold w-full bg-transparent border-b border-border focus:outline-none focus:border-ring"
          />
        ) : (
          <h2
            onClick={() => startEdit("name")}
            className="text-lg font-semibold cursor-pointer hover:text-muted-foreground transition-colors"
            title="Click to edit"
          >
            {workspace.name}
          </h2>
        )}
      </div>

      <div>
        {editing === "description" ? (
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveEdit}
            onKeyDown={(e) => {
              if (e.key === "Escape") cancelEdit();
            }}
            autoFocus
            rows={3}
            className="w-full text-sm bg-transparent border border-border rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-ring resize-none"
          />
        ) : (
          <p
            onClick={() => startEdit("description")}
            className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
            title="Click to edit"
          >
            {workspace.description || "Add a description..."}
          </p>
        )}
      </div>
    </div>
  );
}
