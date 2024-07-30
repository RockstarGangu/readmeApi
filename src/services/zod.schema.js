import { z } from "zod";

const passwordValidation = new RegExp(
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/
);

export const userSchema = z.object({
  username: z.string().min(6).max(20).trim().toLowerCase(),
  email: z.string().email(),
  password: z.string().min(6).regex(passwordValidation).trim(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).regex(passwordValidation).trim(),
});

export const newPasswordSchema = z.object({
  password: z.string().min(6).regex(passwordValidation).trim(),
  confirmPassword: z.string().min(6).regex(passwordValidation).trim(),
});
export const changePasswordSchema = z.object({
  oldPassword: z.string().min(6).regex(passwordValidation).trim(),
  newPassword: z.string().min(6).regex(passwordValidation).trim(),
});

// export const verifyEmailSchema = z.object({
//     token: z.string().trim(),
// })

export const updateAccountSchema = z.object({
  username: z.string().min(6).max(20).trim().toLowerCase().optional(),
  email: z.string().email().optional(),
});

export const contentSchema = z.object({
  title:z.string().min(3).max(75).trim(),
  code:z.string().min(3),
  description:z.string().min(3).max(2025).trim().optional(),
  relatedMedia:z.string().optional(),
  tags:z.array(z.string())
})