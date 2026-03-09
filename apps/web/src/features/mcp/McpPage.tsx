import { useState } from "react";
import { McpServerList } from "./McpServerList";
import { McpToolBrowser } from "./McpToolBrowser";

export function McpPage() {
  const [selectedServer, setSelectedServer] = useState<string | null>(null);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">MCP Platform</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-lg border border-border p-6">
          <McpServerList
            selectedServer={selectedServer}
            onSelectServer={setSelectedServer}
          />
        </div>
        <div className="rounded-lg border border-border p-6">
          <McpToolBrowser serverName={selectedServer} />
        </div>
      </div>
    </div>
  );
}
