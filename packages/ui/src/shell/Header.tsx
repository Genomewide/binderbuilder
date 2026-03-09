import React from "react";

export interface HeaderProps {
  title?: string;
  onToggleSidebar?: () => void;
  onToggleInspector?: () => void;
  children?: React.ReactNode;
}

export function Header({
  title = "baseUI",
  onToggleSidebar,
  onToggleInspector,
  children,
}: HeaderProps) {
  return (
    <div className="flex items-center h-12 px-4 gap-3">
      {onToggleSidebar && (
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded hover:bg-muted text-muted-foreground"
          aria-label="Toggle sidebar"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>
      )}
      <h1 className="text-sm font-semibold">{title}</h1>
      <div className="flex-1">{children}</div>
      {onToggleInspector && (
        <button
          onClick={onToggleInspector}
          className="p-1.5 rounded hover:bg-muted text-muted-foreground"
          aria-label="Toggle inspector"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M15 3v18" />
          </svg>
        </button>
      )}
    </div>
  );
}
