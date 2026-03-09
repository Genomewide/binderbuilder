import { z } from "zod";

// ── Primitives ──────────────────────────────────────────────────────────────

export const idSchema = z.string().uuid();

export const timestampSchema = z.string().datetime();

export const timestampsSchema = z.object({
  created_at: timestampSchema,
  updated_at: timestampSchema,
});

// ── Pagination ──────────────────────────────────────────────────────────────

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export const paginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    total: z.number().int(),
    page: z.number().int(),
    per_page: z.number().int(),
    total_pages: z.number().int(),
  });

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
};
