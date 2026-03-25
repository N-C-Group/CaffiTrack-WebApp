import { z } from "zod";

/** Contact form payload (validated only; not persisted to a database). */
export const insertContactMessageSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  message: z.string().min(1, "Message is required"),
});

export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;

/** Feature request form (validated only; emailed, not stored in a database). */
export const insertFeatureRequestSchema = z.object({
  type: z.enum(["drink", "chain"]),
  name: z.string().min(1, "Name is required"),
  details: z.string().optional(),
  /** Empty string from the form means “no email”. */
  submitterEmail: z
    .string()
    .refine(
      (v) => v.trim() === "" || z.string().email().safeParse(v.trim()).success,
      "Invalid email",
    ),
});

export type InsertFeatureRequest = z.infer<typeof insertFeatureRequestSchema>;
