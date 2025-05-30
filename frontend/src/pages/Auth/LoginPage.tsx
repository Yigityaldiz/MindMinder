// src/pages/Auth/LoginPage.tsx
import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore"; // Zustand store'umuzu import ediyoruz

// Zod ile form validasyon şeması
const loginSchema = z.object({
  email: z
    .string()
    .email({ message: "Lütfen geçerli bir e-posta adresi girin." }),
  password: z.string().min(6, { message: "Şifre en az 6 karakter olmalıdır." }),
});

// Form input tiplerini Zod şemasından türet
type LoginFormInputs = z.infer<typeof loginSchema>;

// Backend'den gelen başarılı yanıtın tipini belirleyelim
interface AuthSuccessResponse {
  token: string;
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
    // Backend'den dönen diğer kullanıcı alanları
  };
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  // Zustand store'undan login fonksiyonunu ve diğer gerekli state/action'ları alıyoruz
  const { login, isLoading, error, setLoading, setError } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: formIsSubmitting }, // isSubmitting'i store'daki isLoading ile karıştırmamak için yeniden adlandırdık
    reset,
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setLoading(true); // Store'daki yüklenme durumunu başlat
    setError(null); // Önceki hataları temizle

    try {
      const apiUrl = "http://localhost:3000"; // API URL'sini environment değişkeninden al
      console.log("url", apiUrl);
      const response = await axios.post<AuthSuccessResponse>(
        `${apiUrl}/api/auth/signin`, // Backend API URL'si
        data // Formdan gelen veriler
      );
      toast.success("Giriş başarılı! Yönlendiriliyorsunuz...");
      login(response.data.token, response.data.user); // Token ve kullanıcı bilgisini store'a ve localStorage'a kaydet

      reset(); // Formu temizle
      navigate("/dashboard"); // Başarılı giriş sonrası dashboard'a yönlendir (bu route'u sonra oluşturacağız)
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        "Giriş sırasında bilinmeyen bir hata oluştu.";
      console.error("Giriş başarısız:", err.response || err);
      toast.error(errorMessage);
      setError(errorMessage); // Hatayı store'a kaydet
    } finally {
      setLoading(false); // Store'daki yüklenme durumunu bitir
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800">
            Tekrar Hoş Geldin!
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Devam etmek için giriş yapın.
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-6"
        >
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700"
            >
              E-posta Adresi
            </label>
            <div className="mt-1">
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email")}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 sm:text-sm transition-colors duration-150 ${
                  errors.email
                    ? "border-red-500 focus:ring-red-400 focus:border-red-500"
                    : "border-slate-300 focus:border-sky-500 focus:ring-sky-400"
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-2 text-xs text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700"
            >
              Şifre
            </label>
            <div className="mt-1">
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register("password")}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 sm:text-sm transition-colors duration-150 ${
                  errors.password
                    ? "border-red-500 focus:ring-red-400 focus:border-red-500"
                    : "border-slate-300 focus:border-sky-500 focus:ring-sky-400"
                }`}
              />
            </div>
            {errors.password && (
              <p className="mt-2 text-xs text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end">
            <div className="text-sm">
              <Link // react-router-dom'dan Link bileşeni
                to="/request-password-reset" // Bu route'u sonra oluşturacağız
                className="font-medium text-sky-600 hover:text-sky-500 hover:underline"
              >
                Şifreni mi unuttun?
              </Link>
            </div>
          </div>

          {/* Store'daki genel hata mesajını gösterme (opsiyonel) */}
          {error && !errors.email && !errors.password && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading || formIsSubmitting} // Hem react-hook-form'un hem de store'un yüklenme durumunu kontrol et
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-60 transition-opacity"
            >
              {isLoading || formIsSubmitting
                ? "Giriş Yapılıyor..."
                : "Giriş Yap"}
            </button>
          </div>
        </form>

        <p className="mt-8 text-xs text-center text-slate-500">
          Hesabın yok mu?{" "}
          <Link // react-router-dom'dan Link bileşeni
            to="/signup" // Bu route'u sonra oluşturacağız
            className="font-semibold text-sky-600 hover:text-sky-700 hover:underline"
          >
            Hemen Kayıt Ol
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
