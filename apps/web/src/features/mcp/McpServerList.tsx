import { useState } from "react";
import { useMcpServers, useRegisterMcpServer } from "./hooks";

interface McpServerListProps {
  selectedServer: string | null;
  onSelectServer: (name: string) => void;
}

export function McpServerList({ selectedServer, onSelectServer }: McpServerListProps) {
  const { data: servers, isLoading } = useMcpServers();
  const registerServer = useRegisterMcpServer();
  const [newName, setNewName] = useState("");
  const [newKind, setNewKind] = useState("custom");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    registerServer.mutate(
      { name: newName.trim(), kind: newKind },
      { onSuccess: () => setNewName("") }
    );
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">MCP Servers</h2>

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Server name"
          className="flex-1 rounded border border-border bg-background px-3 py-1.5 text-sm"
        />
        <select
          value={newKind}
          onChange={(e) => setNewKind(e.target.value)}
          className="rounded border border-border bg-background px-2 py-1.5 text-sm"
        >
          <option value="custom">Custom</option>
          <option value="stdio">Stdio</option>
          <option value="streamable-http">HTTP</option>
        </select>
        <button
          type="submit"
          disabled={registerServer.isPending || !newName.trim()}
          className="rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          Add
        </button>
      </form>

      {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}

      <div className="space-y-1">
        {servers?.map((server) => (
          <button
            key={server.name}
            onClick={() => onSelectServer(server.name)}
            className={`w-full text-left rounded px-3 py-2 text-sm transition-colors ${
              selectedServer === server.name
                ? "bg-accent text-accent-foreground"
                : "hover:bg-muted"
            }`}
          >
            <span className="font-medium">{server.name}</span>
            <span className="ml-2 text-xs text-muted-foreground">({server.kind})</span>
          </button>
        ))}
        {servers?.length === 0 && (
          <p className="text-sm text-muted-foreground">No servers registered.</p>
        )}
      </div>
    </div>
  );
}
