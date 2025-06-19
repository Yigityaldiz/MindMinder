// src/components/auth/ForgotPasswordForm.tsx
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import FormInput from "../ui/FormInput";
import Button from "../ui/Button";

import {
  forgotPasswordSchema,
  ForgotPasswordFormData,
} from "../../utils/validators";
import { requestPasswordReset } from "../../services/authService";
import { ApiErrorResponse } from "../../types/api.types";

const ForgotPasswordForm: React.FC = () => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      // authService'deki hazır fonksiyonu çağırıyoruz.
      const response = await requestPasswordReset(data.email);
      toast.success(
        response.message ||
          "E-posta adresinize bir sıfırlama linki gönderildi. Lütfen kontrol edin."
      );
      reset(); // Formu temizle
    } catch (error: any) {
      const errorMessage =
        (error.response?.data as ApiErrorResponse)?.message ||
        "Bir hata oluştu.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-neutral-800 rounded-lg shadow-xl">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">Şifreni mi Unuttun?</h1>
        <p className="mt-2 text-neutral-400">
          Sorun değil. E-posta adresinizi girin, size yeni bir şifre
          belirlemeniz için bir link gönderelim.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <FormInput
              {...field}
              id="email"
              label="Kayıtlı E-posta Adresiniz"
              type="email"
              errorMessage={errors.email?.message}
              autoFocus
              required
            />
          )}
        />

        <Button
          type="submit"
          variant="primary"
          fullWidth
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Gönderiliyor..." : "Sıfırlama Linki Gönder"}
        </Button>

        <div className="text-sm text-center text-neutral-400">
          <Link
            to="/login"
            className="font-medium text-blue-500 hover:text-blue-400"
          >
            Giriş ekranına geri dön
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordForm;
