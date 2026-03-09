import { createPersistedStore } from "./create-persisted-store.js";

export interface LayoutState {
  sidebarOpen: boolean;
  sidebarWidth: number;
  inspectorOpen: boolean;
  inspectorWidth: number;
  activeTab: string;
  toggleSidebar: () => void;
  setSidebarWidth: (w: number) => void;
  toggleInspector: () => void;
  setInspectorWidth: (w: number) => void;
  setActiveTab: (tab: string) => void;
}

export const useLayoutStore = createPersistedStore<LayoutState>(
  (set) => ({
    sidebarOpen: true,
    sidebarWidth: 260,
    inspectorOpen: false,
    inspectorWidth: 320,
    activeTab: "chat",
    toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
    setSidebarWidth: (w) => set({ sidebarWidth: w }),
    toggleInspector: () => set((s) => ({ inspectorOpen: !s.inspectorOpen })),
    setInspectorWidth: (w) => set({ inspectorWidth: w }),
    setActiveTab: (tab) => set({ activeTab: tab }),
  }),
  {
    name: "baseui-layout",
    version: 1,
    partialize: (state) => ({
      sidebarOpen: state.sidebarOpen,
      sidebarWidth: state.sidebarWidth,
      inspectorOpen: state.inspectorOpen,
      inspectorWidth: state.inspectorWidth,
      activeTab: state.activeTab,
    }),
  },
);
