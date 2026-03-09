import fs from "node:fs";
import path from "node:path";

const name = process.argv[2];

if (!name) {
  console.error("Usage: pnpm gen:store <name>");
  process.exit(1);
}

const pascalName = name
  .split("-")
  .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
  .join("");

const camelName = pascalName.charAt(0).toLowerCase() + pascalName.slice(1);

const storeDir = path.resolve(
  __dirname,
  "..",
  "packages",
  "state",
  "src",
);

const storeFile = path.join(storeDir, `${name}-store.ts`);

if (fs.existsSync(storeFile)) {
  console.error(`Store "${name}" already exists at ${storeFile}`);
  process.exit(1);
}

fs.mkdirSync(storeDir, { recursive: true });

fs.writeFileSync(
  storeFile,
  `import { createPersistedStore } from "./create-persisted-store";

interface ${pascalName}State {
  // Add state properties here
}

export const use${pascalName}Store = createPersistedStore<${pascalName}State>(
  (_set, _get) => ({
    // Add initial state here
  }),
  {
    name: "${name}-store",
    version: 0,
  },
);
`,
);

console.log(`Created store at ${storeFile}`);
console.log(`  - ${name}-store.ts`);
