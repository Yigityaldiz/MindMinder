import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

import FormInput from "../ui/FormInput";
import Button from "../ui/Button";

import { loginSchema, LoginFormData } from "../../utils/validators";
import useAuthStore from "../../store/authStore";
import { loginUser } from "../../services/authService";
import { ApiErrorResponse } from "../../types/api.types";

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login, setLoading, setError: setAuthError } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setAuthError(null);
    setLoading(true);
    try {
      const response = await loginUser(data);
      login(response.token, response.user);
      toast.success("Başarıyla giriş yapıldı!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage =
        (error.response?.data as ApiErrorResponse)?.message ||
        "Giriş sırasında bir hata oluştu.";
      setAuthError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-neutral-800 rounded-lg shadow-xl">
      <h1 className="text-3xl font-bold text-center text-white mb-6">
        Giriş Yap
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <FormInput
              {...field}
              id="email"
              label="E-posta Adresi"
              type="email"
              placeholder=""
              errorMessage={errors.email?.message}
              autoFocus
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
              placeholder=""
              errorMessage={errors.password?.message}
              required
            />
          )}
        />

        <div className="flex justify-end text-sm">
          <Link
            to="/forgot-password"
            className="font-medium text-blue-500 hover:text-blue-400"
          >
            Şifremi Unuttum?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Giriş Yapılıyor..." : "Giriş Yap"}
        </Button>

        <div className="text-sm text-center text-neutral-400">
          Hesabın yok mu?{" "}
          <Link
            to="/signup"
            className="font-medium text-blue-500 hover:text-blue-400"
          >
            Kayıt Ol
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
