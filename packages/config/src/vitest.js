/** @returns {import("vitest/config").UserConfig} */
export function createVitestConfig(overrides = {}) {
  return {
    test: {
      globals: true,
      environment: "node",
      include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
      coverage: {
        reporter: ["text", "json-summary"],
      },
      ...overrides,
    },
  };
}
