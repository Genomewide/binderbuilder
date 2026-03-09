import type { AiProvider } from "../types.js";

const providers = new Map<string, AiProvider>();

export function registerProvider(provider: AiProvider): void {
  providers.set(provider.name, provider);
}

export function getProvider(name: string): AiProvider {
  const provider = providers.get(name);
  if (!provider) {
    throw new Error(
      `AI provider "${name}" not found. Available: ${listProviders().join(", ") || "(none)"}`
    );
  }
  return provider;
}

export function listProviders(): string[] {
  return Array.from(providers.keys());
}
