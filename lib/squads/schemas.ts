import { z } from "zod";

export const SQUAD_AVATAR_ACCEPTED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
] as const;
export const SQUAD_AVATAR_MAX_BYTES = 5 * 1024 * 1024;

const optionalDescription = z
  .string()
  .trim()
  .max(5000)
  .optional()
  .or(z.literal("").transform(() => undefined));

export const squadCreateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Use at least 2 characters")
    .max(120),
  description: optionalDescription,
  member_ids: z.array(z.string().uuid()),
});

export type SquadCreateFormValues = z.infer<typeof squadCreateSchema>;

export const squadUpdateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Use at least 2 characters")
    .max(120)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  description: optionalDescription,
});

export type SquadUpdateFormValues = z.infer<typeof squadUpdateSchema>;
