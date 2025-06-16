// src/pages/Auth/RegisterPage.tsx
import React from "react";
import RegisterForm from "../../components/auth/RegisterForm";
import Logo from "../../components/ui/Logo";

const RegisterPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 p-4 sm:p-6 lg:p-8">
      <div className="mb-8 sm:mb-10">
        <Logo size="lg" />
      </div>

      <RegisterForm />

      <footer className="absolute bottom-4 text-center w-full text-neutral-500 text-sm">
        &copy; {new Date().getFullYear()} AiChat. Tüm hakları saklıdır.
      </footer>
    </div>
  );
};

export default RegisterPage;
