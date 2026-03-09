import { create, type StateCreator } from "zustand";
import { persist, type PersistOptions } from "zustand/middleware";

export interface PersistedStoreOptions<T> {
  name: string;
  version?: number;
  partialize?: (state: T) => Partial<T>;
  migrate?: (persisted: unknown, version: number) => T;
}

export function createPersistedStore<T extends object>(
  initializer: StateCreator<T, [], [["zustand/persist", T]]>,
  options: PersistedStoreOptions<T>,
) {
  const persistOptions: PersistOptions<T, Partial<T>> = {
    name: options.name,
    version: options.version ?? 0,
    partialize: options.partialize,
    migrate: options.migrate as PersistOptions<T, Partial<T>>["migrate"],
  };

  return create<T>()(persist(initializer, persistOptions));
}
