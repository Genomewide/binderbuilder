import { AppShell, Header, Sidebar } from "@baseui/ui";
import { useLayoutStore, useWorkspaceSelectionStore } from "@baseui/state";
import { Outlet, Link } from "react-router-dom";
import { WorkspaceList } from "../../features/workspaces/WorkspaceList";
import { ConversationList } from "../../features/conversations/ConversationList";
import { WorkspaceDetail } from "../../features/workspaces/WorkspaceDetail";

export function WorkbenchLayout() {
  const {
    sidebarOpen,
    sidebarWidth,
    inspectorOpen,
    inspectorWidth,
    toggleSidebar,
    toggleInspector,
  } = useLayoutStore();

  const { activeWorkspaceId } = useWorkspaceSelectionStore();

  return (
    <AppShell
      sidebarOpen={sidebarOpen}
      sidebarWidth={sidebarWidth}
      inspectorOpen={inspectorOpen}
      inspectorWidth={inspectorWidth}
      header={
        <Header
          title="baseUI"
          onToggleSidebar={toggleSidebar}
          onToggleInspector={toggleInspector}
        >
          <nav className="flex items-center gap-4 ml-4">
            <Link to="/settings" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Settings</Link>
            <Link to="/mcp" className="text-sm text-muted-foreground hover:text-foreground transition-colors">MCP</Link>
          </nav>
        </Header>
      }
      sidebar={
        <Sidebar header={<span className="text-sm font-medium">Workspaces</span>}>
          <div className="space-y-4">
            <WorkspaceList />
            {activeWorkspaceId && (
              <div className="border-t border-border pt-2">
                <ConversationList />
              </div>
            )}
          </div>
        </Sidebar>
      }
      inspector={
        <div className="p-4">
          {activeWorkspaceId ? (
            <WorkspaceDetail workspaceId={activeWorkspaceId} />
          ) : (
            <>
              <h3 className="text-sm font-medium mb-2">Inspector</h3>
              <p className="text-xs text-muted-foreground">
                Select a workspace to view details
              </p>
            </>
          )}
        </div>
      }
    >
      <Outlet />
    </AppShell>
  );
}
