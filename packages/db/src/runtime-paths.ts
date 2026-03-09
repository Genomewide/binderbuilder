import path from "node:path";
import fs from "node:fs";

const RUNTIME_ROOT =
  process.env.RUNTIME_DIR || path.resolve(process.cwd(), "../../runtime");

function ensureDir(dir: string): string {
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function getRuntimePath(...segments: string[]): string {
  return path.join(RUNTIME_ROOT, ...segments);
}

export function getDataPath(...segments: string[]): string {
  return ensureDir(path.join(RUNTIME_ROOT, "data", ...segments));
}

export function getDbPath(): string {
  ensureDir(getRuntimePath("data"));
  return getRuntimePath("data", "app.db");
}

export function getArtifactsPath(...segments: string[]): string {
  return ensureDir(path.join(RUNTIME_ROOT, "artifacts", ...segments));
}

export function getUploadsPath(): string {
  return ensureDir(getRuntimePath("data", "uploads"));
}

export function getLogsPath(): string {
  return ensureDir(getRuntimePath("logs"));
}

export function getWorkspaceFilePath(
  workspaceId: string,
  fileId: string,
): string {
  const dir = ensureDir(
    path.join(RUNTIME_ROOT, "data", "uploads", workspaceId),
  );
  return path.join(dir, fileId);
}

export function bootstrapRuntime(): void {
  ensureDir(getRuntimePath("data"));
  ensureDir(getRuntimePath("data", "uploads"));
  ensureDir(getRuntimePath("artifacts", "generated"));
  ensureDir(getRuntimePath("artifacts", "exports"));
  ensureDir(getRuntimePath("artifacts", "temp"));
  ensureDir(getRuntimePath("logs"));
}
