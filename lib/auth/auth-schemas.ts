import { z } from "zod";

// Shared password policy. Keep in sync with the backend validator; if the
// regex changes, grep for `PASSWORD_STRENGTH_REGEX` before tweaking so all
// signup / invite / reset flows move together.
export const PASSWORD_STRENGTH_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
export const PASSWORD_STRENGTH_MESSAGE =
  "Password must contain an uppercase letter, lowercase letter, and number";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
    password: z
      .string()
      .min(8, "Use at least 8 characters")
      .regex(PASSWORD_STRENGTH_REGEX, PASSWORD_STRENGTH_MESSAGE),
    confirm_password: z.string().min(1, "Confirm your password"),
    terms: z.boolean().refine((v) => v === true, {
      message: "Accept the terms to continue",
    }),
    recaptcha_token: z.string().min(1, "Please verify you're not a robot"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const invitationSignupSchema = z
  .object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    password: z
      .string()
      .min(8, "Use at least 8 characters")
      .regex(PASSWORD_STRENGTH_REGEX, PASSWORD_STRENGTH_MESSAGE),
    confirm_password: z.string().min(1, "Confirm your password"),
    terms: z.boolean().refine((v) => v === true, {
      message: "Accept the terms to continue",
    }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export type InvitationSignupFormValues = z.infer<typeof invitationSignupSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    new_password: z.string().min(8, "Use at least 8 characters"),
    confirm_password: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
