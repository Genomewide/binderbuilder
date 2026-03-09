import { useState } from "react";
import { useMcpTools, useCallMcpTool } from "./hooks";

interface McpToolBrowserProps {
  serverName: string | null;
}

export function McpToolBrowser({ serverName }: McpToolBrowserProps) {
  const { data: tools, isLoading } = useMcpTools(serverName);
  const callTool = useCallMcpTool();
  const [inputValue, setInputValue] = useState("{}");
  const [lastResult, setLastResult] = useState<unknown>(null);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  if (!serverName) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Select a server to browse tools.</p>
      </div>
    );
  }

  const handleCall = (toolName: string) => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(inputValue);
    } catch {
      parsed = {};
    }
    callTool.mutate(
      { serverName, toolName, input: parsed },
      {
        onSuccess: (result) => {
          setLastResult(result);
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">
        Tools — <span className="text-muted-foreground">{serverName}</span>
      </h2>

      {isLoading && <p className="text-sm text-muted-foreground">Loading tools...</p>}

      <div className="space-y-2">
        {tools?.map((tool) => (
          <div
            key={tool.name}
            className="rounded-lg border border-border p-4 space-y-2"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-sm">{tool.title ?? tool.name}</h3>
                {tool.description && (
                  <p className="text-xs text-muted-foreground">{tool.description}</p>
                )}
              </div>
              <button
                onClick={() => {
                  setSelectedTool(tool.name === selectedTool ? null : tool.name);
                  setLastResult(null);
                }}
                className="rounded border border-border px-2 py-1 text-xs hover:bg-muted"
              >
                {selectedTool === tool.name ? "Close" : "Try"}
              </button>
            </div>

            {selectedTool === tool.name && (
              <div className="space-y-2 pt-2 border-t border-border">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  rows={3}
                  className="w-full rounded border border-border bg-background px-3 py-2 text-sm font-mono"
                  placeholder='{"key": "value"}'
                />
                <button
                  onClick={() => handleCall(tool.name)}
                  disabled={callTool.isPending}
                  className="rounded bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {callTool.isPending ? "Calling..." : "Call Tool"}
                </button>
                {lastResult !== null && (
                  <pre className="rounded bg-muted p-3 text-xs overflow-auto max-h-48">
                    {JSON.stringify(lastResult, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        ))}
        {tools?.length === 0 && (
          <p className="text-sm text-muted-foreground">No tools available.</p>
        )}
      </div>
    </div>
  );
}
