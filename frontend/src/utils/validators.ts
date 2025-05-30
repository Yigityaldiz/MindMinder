// src/utils/validators.ts
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Geçerli bir e-posta adresi giriniz." }),
  password: z.string().min(6, { message: "Şifre en az 6 karakter olmalıdır." }),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// İleride Kayıt sayfası için
export const registerSchema = z
  .object({
    name: z.string().min(2, { message: "İsim en az 2 karakter olmalıdır." }),
    email: z.string().email({ message: "Geçerli bir e-posta adresi giriniz." }),
    password: z
      .string()
      .min(6, { message: "Şifre en az 6 karakter olmalıdır." }),
    confirmPassword: z
      .string()
      .min(6, { message: "Şifre en az 6 karakter olmalıdır." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor.",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

// Şifremi unuttum için
export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Geçerli bir e-posta adresi giriniz." }),
});
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// Şifre sıfırlama için
export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(6, { message: "Yeni şifre en az 6 karakter olmalıdır." }),
    confirmPassword: z
      .string()
      .min(6, { message: "Yeni şifre en az 6 karakter olmalıdır." }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Şifreler eşleşmiyor.",
    path: ["confirmPassword"],
  });
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
