// src/components/auth/RegisterForm.tsx
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

import FormInput from "../ui/FormInput";
import Button from "../ui/Button";

import { registerSchema, RegisterFormData } from "../../utils/validators";
import { registerUser } from "../../services/authService";
import { ApiErrorResponse } from "../../types/api.types";

const RegisterForm: React.FC = () => {
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      // registerUser servisini çağırıyoruz
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      toast.success("Başarıyla kayıt oldunuz! Lütfen giriş yapın.");
      navigate("/login"); // Başarılı kayıt sonrası login sayfasına yönlendir
    } catch (error: any) {
      console.error("Registration error:", error);
      const errorMessage =
        (error.response?.data as ApiErrorResponse)?.message ||
        "Kayıt sırasında bir hata oluştu.";
      toast.error(errorMessage);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-neutral-800 rounded-lg shadow-xl">
      <h1 className="text-3xl font-bold text-center text-white mb-6">
        Hesap Oluştur
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <FormInput
              {...field}
              id="name"
              label="Adınız Soyadınız"
              type="text"
              errorMessage={errors.name?.message}
              autoFocus
              required
            />
          )}
        />
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <FormInput
              {...field}
              id="email"
              label="E-posta Adresi"
              type="email"
              errorMessage={errors.email?.message}
              required
            />
          )}
        />
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <FormInput
              {...field}
              id="password"
              label="Şifre"
              type="password"
              errorMessage={errors.password?.message}
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
              label="Şifre Tekrar"
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
          {isSubmitting ? "Hesap Oluşturuluyor..." : "Kayıt Ol"}
        </Button>

        <div className="text-sm text-center text-neutral-400">
          Zaten bir hesabın var mı?{" "}
          <Link
            to="/login"
            className="font-medium text-blue-500 hover:text-blue-400"
          >
            Giriş Yap
          </Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
