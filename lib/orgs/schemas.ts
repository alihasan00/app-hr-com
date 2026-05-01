import { z } from "zod";

export const ORG_LOGO_ACCEPTED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/svg+xml",
] as const;
export const ORG_LOGO_MAX_BYTES = 5 * 1024 * 1024;

export const ORG_SIZE_OPTIONS = [
  { value: "1-10", label: "1–10" },
  { value: "11-50", label: "11–50" },
  { value: "51-200", label: "51–200" },
  { value: "201-500", label: "201–500" },
  { value: "501-1000", label: "501–1,000" },
  { value: "1000+", label: "1,000+" },
] as const;

const optionalString = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .or(z.literal("").transform(() => undefined));

const optionalEmail = z
  .string()
  .trim()
  .email("Enter a valid email")
  .optional()
  .or(z.literal("").transform(() => undefined));

const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .optional()
  .or(z.literal("").transform(() => undefined))
  .refine(
    (v) =>
      !v ||
      /^(https?:\/\/)?[\w-]+(\.[\w-]+)+[\w./?%&=+-]*$/i.test(v),
    { message: "Enter a valid URL" },
  );

export const orgUpdateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Use at least 2 characters")
    .max(255)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  contact_email: optionalEmail,
  website: optionalUrl,
  description: optionalString(5000),
  industry: optionalString(100),
  size: optionalString(50),
  location: optionalString(255),
  timezone: optionalString(64),
  billing_email: optionalEmail,
  phone: optionalString(32),
  linkedin_url: optionalUrl,
});

export type OrgUpdateFormValues = z.infer<typeof orgUpdateSchema>;

export const inviteMemberSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  role: z.enum(["admin", "member"], {
    message: "Pick a role",
  }),
});

export type InviteMemberFormValues = z.infer<typeof inviteMemberSchema>;
