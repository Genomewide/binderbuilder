import fs from "node:fs";
import path from "node:path";

const name = process.argv[2];

if (!name) {
  console.error("Usage: pnpm gen:route <name>");
  process.exit(1);
}

const pascalName = name
  .split("-")
  .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
  .join("");

const camelName = pascalName.charAt(0).toLowerCase() + pascalName.slice(1);

const moduleDir = path.resolve(
  __dirname,
  "..",
  "apps",
  "server",
  "src",
  "modules",
  name,
);

if (fs.existsSync(moduleDir)) {
  console.error(`Route module "${name}" already exists at ${moduleDir}`);
  process.exit(1);
}

fs.mkdirSync(moduleDir, { recursive: true });

// routes.ts
fs.writeFileSync(
  path.join(moduleDir, "routes.ts"),
  `import type { FastifyInstance } from "fastify";
import { ${camelName}Service } from "./service";

export async function ${camelName}Routes(app: FastifyInstance) {
  app.get("/${name}", async (_request, _reply) => {
    const result = await ${camelName}Service.getAll();
    return result;
  });
}
`,
);

// service.ts
fs.writeFileSync(
  path.join(moduleDir, "service.ts"),
  `import { ${camelName}Repository } from "./repository";

export const ${camelName}Service = {
  async getAll() {
    return ${camelName}Repository.findAll();
  },
};
`,
);

// repository.ts
fs.writeFileSync(
  path.join(moduleDir, "repository.ts"),
  `export const ${camelName}Repository = {
  async findAll() {
    return [];
  },
};
`,
);

// routes.test.ts
fs.writeFileSync(
  path.join(moduleDir, "routes.test.ts"),
  `import { describe, it, expect } from "vitest";

describe("${camelName}Routes", () => {
  it("should be defined", () => {
    expect(true).toBe(true);
  });
});
`,
);

console.log(`Created route module "${name}" at ${moduleDir}`);
console.log(`  - routes.ts`);
console.log(`  - service.ts`);
console.log(`  - repository.ts`);
console.log(`  - routes.test.ts`);
