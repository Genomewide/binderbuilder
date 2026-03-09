import { z } from "zod";
import { timestampsSchema } from "./common.js";

// ── Setting ─────────────────────────────────────────────────────────────────

export const settingCreateSchema = z.object({
  key: z.string().min(1).max(255),
  value: z.unknown(),
});

export const settingUpdateSchema = z.object({
  value: z.unknown(),
});

export const settingSchema = z
  .object({
    key: z.string(),
    value: z.unknown(),
  })
  .merge(timestampsSchema);

export type SettingCreate = z.infer<typeof settingCreateSchema>;
export type SettingUpdate = z.infer<typeof settingUpdateSchema>;
export type Setting = z.infer<typeof settingSchema>;
