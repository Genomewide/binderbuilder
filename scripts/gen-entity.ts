import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const name = process.argv[2];

if (!name) {
  console.error("Usage: pnpm gen:entity <name>");
  process.exit(1);
}

const pascalName = name
  .split("-")
  .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
  .join("");

const camelName = pascalName.charAt(0).toLowerCase() + pascalName.slice(1);

const root = path.resolve(__dirname, "..");

// Run gen-feature
console.log(`\n--- Generating feature ---`);
execSync(`npx tsx ${path.join(root, "scripts", "gen-feature.ts")} ${name}`, {
  stdio: "inherit",
  cwd: root,
});

// Run gen-route
console.log(`\n--- Generating route ---`);
execSync(`npx tsx ${path.join(root, "scripts", "gen-route.ts")} ${name}`, {
  stdio: "inherit",
  cwd: root,
});

// Create shared schema
console.log(`\n--- Generating shared schema ---`);
const schemasDir = path.join(root, "packages", "shared", "src", "schemas");
const schemaFile = path.join(schemasDir, `${name}.ts`);

if (fs.existsSync(schemaFile)) {
  console.error(`Schema "${name}" already exists at ${schemaFile}`);
  process.exit(1);
}

fs.mkdirSync(schemasDir, { recursive: true });

fs.writeFileSync(
  schemaFile,
  `import { z } from "zod";

export const ${camelName}Schema = z.object({
  id: z.string(),
});

export type ${pascalName} = z.infer<typeof ${camelName}Schema>;
`,
);

console.log(`Created shared schema at ${schemaFile}`);
console.log(`\nEntity "${name}" scaffolding complete.`);
