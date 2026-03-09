import React from "react";

export interface SidebarProps {
  header?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}

export function Sidebar({ header, children, footer }: SidebarProps) {
  return (
    <div className="flex flex-col h-full">
      {header && (
        <div className="flex-shrink-0 p-3 border-b border-border">
          {header}
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-2">{children}</div>
      {footer && (
        <div className="flex-shrink-0 p-3 border-t border-border">
          {footer}
        </div>
      )}
    </div>
  );
}
