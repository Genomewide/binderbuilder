import fs from "node:fs";
import path from "node:path";

const name = process.argv[2];

if (!name) {
  console.error("Usage: pnpm gen:feature <name>");
  process.exit(1);
}

const pascalName = name
  .split("-")
  .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
  .join("");

const featureDir = path.resolve(
  __dirname,
  "..",
  "apps",
  "web",
  "src",
  "features",
  name,
);

if (fs.existsSync(featureDir)) {
  console.error(`Feature "${name}" already exists at ${featureDir}`);
  process.exit(1);
}

fs.mkdirSync(featureDir, { recursive: true });

// index.ts
fs.writeFileSync(
  path.join(featureDir, "index.ts"),
  `export { ${pascalName} } from "./${pascalName}";\n`,
);

// <Name>.tsx
fs.writeFileSync(
  path.join(featureDir, `${pascalName}.tsx`),
  `export function ${pascalName}() {
  return <div>${pascalName}</div>;
}
`,
);

// hooks.ts
fs.writeFileSync(
  path.join(featureDir, "hooks.ts"),
  `// Hooks for the ${name} feature\n`,
);

// <Name>.test.tsx
fs.writeFileSync(
  path.join(featureDir, `${pascalName}.test.tsx`),
  `import { describe, it, expect } from "vitest";

describe("${pascalName}", () => {
  it("should render", () => {
    expect(true).toBe(true);
  });
});
`,
);

console.log(`Created feature "${name}" at ${featureDir}`);
console.log(`  - index.ts`);
console.log(`  - ${pascalName}.tsx`);
console.log(`  - hooks.ts`);
console.log(`  - ${pascalName}.test.tsx`);
