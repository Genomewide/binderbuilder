import React from "react";

export interface AppShellProps {
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  inspector?: React.ReactNode;
  children: React.ReactNode;
  sidebarOpen?: boolean;
  sidebarWidth?: number;
  inspectorOpen?: boolean;
  inspectorWidth?: number;
}

export function AppShell({
  sidebar,
  header,
  inspector,
  children,
  sidebarOpen = true,
  sidebarWidth = 260,
  inspectorOpen = false,
  inspectorWidth = 320,
}: AppShellProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {sidebar && sidebarOpen && (
        <aside
          className="flex-shrink-0 border-r border-border overflow-y-auto bg-muted/30"
          style={{ width: sidebarWidth }}
        >
          {sidebar}
        </aside>
      )}
      <div className="flex flex-1 flex-col overflow-hidden">
        {header && (
          <header className="flex-shrink-0 border-b border-border">
            {header}
          </header>
        )}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
      {inspector && inspectorOpen && (
        <aside
          className="flex-shrink-0 border-l border-border overflow-y-auto bg-muted/10"
          style={{ width: inspectorWidth }}
        >
          {inspector}
        </aside>
      )}
    </div>
  );
}
