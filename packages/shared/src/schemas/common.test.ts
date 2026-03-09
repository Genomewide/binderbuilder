import { describe, it, expect } from "vitest";
import {
  idSchema,
  timestampSchema,
  paginationQuerySchema,
  workspaceCreateSchema,
  workspaceSchema,
  messageRoleEnum,
  messageCreateSchema,
  jobStatusEnum,
  artifactKindEnum,
  skillCreateSchema,
  activityLogCreateSchema,
  settingCreateSchema,
  fileCreateSchema,
  mcpServerCreateSchema,
} from "../schemas/index.js";

describe("common schemas", () => {
  it("accepts a valid UUID", () => {
    const result = idSchema.safeParse("550e8400-e29b-41d4-a716-446655440000");
    expect(result.success).toBe(true);
  });

  it("rejects an invalid UUID", () => {
    const result = idSchema.safeParse("not-a-uuid");
    expect(result.success).toBe(false);
  });

  it("accepts a valid ISO datetime", () => {
    const result = timestampSchema.safeParse("2024-01-15T10:30:00Z");
    expect(result.success).toBe(true);
  });

  it("rejects an invalid datetime", () => {
    const result = timestampSchema.safeParse("yesterday");
    expect(result.success).toBe(false);
  });

  it("applies pagination defaults", () => {
    const result = paginationQuerySchema.parse({});
    expect(result).toEqual({ page: 1, per_page: 20 });
  });

  it("coerces pagination string values", () => {
    const result = paginationQuerySchema.parse({ page: "3", per_page: "50" });
    expect(result).toEqual({ page: 3, per_page: 50 });
  });

  it("rejects per_page over 100", () => {
    const result = paginationQuerySchema.safeParse({ per_page: 200 });
    expect(result.success).toBe(false);
  });
});

describe("workspace schemas", () => {
  it("validates a workspace create with minimal fields", () => {
    const result = workspaceCreateSchema.safeParse({ name: "My Workspace" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("My Workspace");
      expect(result.data.id).toBeDefined();
    }
  });

  it("rejects a workspace create with empty name", () => {
    const result = workspaceCreateSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("validates a full workspace response", () => {
    const result = workspaceSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Test",
      description: null,
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z",
    });
    expect(result.success).toBe(true);
  });
});

describe("message schemas", () => {
  it("validates message roles", () => {
    expect(messageRoleEnum.safeParse("user").success).toBe(true);
    expect(messageRoleEnum.safeParse("assistant").success).toBe(true);
    expect(messageRoleEnum.safeParse("system").success).toBe(true);
    expect(messageRoleEnum.safeParse("tool").success).toBe(true);
    expect(messageRoleEnum.safeParse("admin").success).toBe(false);
  });

  it("creates a message with defaults", () => {
    const result = messageCreateSchema.safeParse({
      conversation_id: "550e8400-e29b-41d4-a716-446655440000",
      role: "user",
      content_text: "Hello",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("pending");
      expect(result.data.id).toBeDefined();
    }
  });
});

describe("enum schemas", () => {
  it("validates job statuses", () => {
    expect(jobStatusEnum.safeParse("queued").success).toBe(true);
    expect(jobStatusEnum.safeParse("running").success).toBe(true);
    expect(jobStatusEnum.safeParse("invalid").success).toBe(false);
  });

  it("validates artifact kinds", () => {
    expect(artifactKindEnum.safeParse("code").success).toBe(true);
    expect(artifactKindEnum.safeParse("document").success).toBe(true);
    expect(artifactKindEnum.safeParse("unknown").success).toBe(false);
  });
});

describe("skill schemas", () => {
  it("validates slug format", () => {
    const base = {
      name: "Test Skill",
      source: "builtin" as const,
    };
    expect(skillCreateSchema.safeParse({ ...base, slug: "my-skill" }).success).toBe(true);
    expect(skillCreateSchema.safeParse({ ...base, slug: "my_skill" }).success).toBe(false);
    expect(skillCreateSchema.safeParse({ ...base, slug: "MySkill" }).success).toBe(false);
  });
});

describe("activity log schemas", () => {
  it("validates an activity log entry", () => {
    const result = activityLogCreateSchema.safeParse({
      entity_type: "workspace",
      action: "create",
      summary: "Created workspace",
    });
    expect(result.success).toBe(true);
  });
});

describe("setting schemas", () => {
  it("accepts any value type", () => {
    expect(settingCreateSchema.safeParse({ key: "theme", value: "dark" }).success).toBe(true);
    expect(settingCreateSchema.safeParse({ key: "count", value: 42 }).success).toBe(true);
    expect(
      settingCreateSchema.safeParse({ key: "config", value: { nested: true } }).success,
    ).toBe(true);
  });
});

describe("file schemas", () => {
  it("validates a file create", () => {
    const result = fileCreateSchema.safeParse({
      workspace_id: "550e8400-e29b-41d4-a716-446655440000",
      display_name: "report.pdf",
      original_name: "report_2024.pdf",
      mime_type: "application/pdf",
      size_bytes: 1024,
      disk_path: "/uploads/report.pdf",
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative size_bytes", () => {
    const result = fileCreateSchema.safeParse({
      workspace_id: "550e8400-e29b-41d4-a716-446655440000",
      display_name: "report.pdf",
      original_name: "report.pdf",
      mime_type: "application/pdf",
      size_bytes: -1,
      disk_path: "/uploads/report.pdf",
    });
    expect(result.success).toBe(false);
  });
});

describe("mcp server schemas", () => {
  it("validates a server create", () => {
    const result = mcpServerCreateSchema.safeParse({
      name: "Local MCP",
      url: "http://localhost:3001",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.enabled).toBe(true);
    }
  });

  it("rejects invalid URL", () => {
    const result = mcpServerCreateSchema.safeParse({
      name: "Bad Server",
      url: "not-a-url",
    });
    expect(result.success).toBe(false);
  });
});
