import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryProvider } from "./app/providers/QueryProvider";
import { WorkbenchLayout } from "./app/layouts/WorkbenchLayout";
import { SettingsPage } from "./features/settings/SettingsPage";
import { McpPage } from "./features/mcp/McpPage";
import { ConversationView } from "./features/conversations/ConversationView";
import { useWorkspaceSelectionStore } from "@baseui/state";

function MainContent() {
  const { activeConversationId } = useWorkspaceSelectionStore();

  if (activeConversationId) {
    return <ConversationView />;
  }

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Welcome to baseUI</h1>
        <p className="text-muted-foreground">
          Select a workspace or create one to get started.
        </p>
      </div>
    </div>
  );
}

export function App() {
  return (
    <QueryProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<WorkbenchLayout />}>
            <Route path="/" element={<MainContent />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/mcp" element={<McpPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryProvider>
  );
}
