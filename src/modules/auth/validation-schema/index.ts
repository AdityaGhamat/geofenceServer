import { z } from "zod";
export const createUserSchema = z.object({
  name: z.string().min(5).max(56),
  email: z.string().min(5).max(56),
  password: z.string().min(6).max(20),
});
export const loginSchema = z.object({
  email: z.string().min(5).max(56),
  password: z.string().min(6).max(20),
});
export const updateLocationSchema = z.object({
  coordinates: z.array(z.number()).length(2),
});

export const updatePasswordSchema = z.object({
  old_password: z.string().min(6).max(20),
  new_password: z.string().min(6).max(20),
});
