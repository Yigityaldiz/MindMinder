// src/components/auth/ResetPasswordForm.tsx
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

import FormInput from "../ui/FormInput";
import Button from "../ui/Button";

import {
  resetPasswordSchema,
  ResetPasswordFormData,
} from "../../utils/validators";
import { resetPassword } from "../../services/authService";
import { ApiErrorResponse } from "../../types/api.types";

interface ResetPasswordFormProps {
  token: string;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ token }) => {
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      const response = await resetPassword(token, {
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      toast.success(
        response.message ||
          "Şifreniz başarıyla güncellendi! Artık giriş yapabilirsiniz."
      );
      navigate("/login");
    } catch (error: any) {
      const errorMessage =
        (error.response?.data as ApiErrorResponse)?.message ||
        "Şifre sıfırlanırken bir hata oluştu.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-neutral-800 rounded-lg shadow-xl">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white">Yeni Şifre Belirle</h1>
        <p className="mt-2 text-neutral-400">
          Lütfen hesabınız için yeni bir şifre girin.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Controller
          name="newPassword"
          control={control}
          render={({ field }) => (
            <FormInput
              {...field}
              id="newPassword"
              label="Yeni Şifre"
              type="password"
              errorMessage={errors.newPassword?.message}
              autoFocus
              required
            />
          )}
        />
        <Controller
          name="confirmPassword"
          control={control}
          render={({ field }) => (
            <FormInput
              {...field}
              id="confirmPassword"
              label="Yeni Şifre Tekrar"
              type="password"
              errorMessage={errors.confirmPassword?.message}
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
          {isSubmitting ? "Kaydediliyor..." : "Şifreyi Güncelle"}
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

export default ResetPasswordForm;
