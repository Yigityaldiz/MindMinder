// src/pages/Auth/ResetPasswordPage.tsx
import React from "react";
import { useParams, Navigate } from "react-router-dom";
import ResetPasswordForm from "../../components/auth/ResetPasswordForm";
import Logo from "../../components/ui/Logo";

const ResetPasswordPage: React.FC = () => {
  // react-router-dom'dan gelen useParams hook'u ile URL'deki :token kısmını yakalıyoruz.
  const { token } = useParams<{ token: string }>();

  // Eğer URL'de bir token yoksa, bu sayfayı göstermenin bir anlamı yok.
  // Kullanıcıyı login sayfasına yönlendirebiliriz.
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 p-4 sm:p-6 lg:p-8">
      <div className="mb-8 sm:mb-10">
        <Logo size="lg" />
      </div>

      <ResetPasswordForm token={token} />

      <footer className="absolute bottom-4 text-center w-full text-neutral-500 text-sm">
        &copy; {new Date().getFullYear()} AiChat. Tüm hakları saklıdır.
      </footer>
    </div>
  );
};

export default ResetPasswordPage;
