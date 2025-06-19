// src/routes/index.tsx
import React from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  Link,
  useNavigate,
} from "react-router-dom"; // useNavigate ve Link eklendi
import useAuthStore from "../store/authStore";
import LoginPage from "../pages/Auth/LoginPage";
import ChatPage from "../pages/ChatPage";
import RegisterPage from "../pages/Auth/RegisterPage";
import ForgotPasswordPage from "../pages/Auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/Auth/ResetPasswordPage";

// Geçici Dashboard mesajı için basit bir bileşen
const TempDashboard: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate(); // useNavigate hook'u burada tanımlanıyor

  const handleLogout = () => {
    logout();
    navigate("/login"); // Çıkış yapınca login'e yönlendir
    // toast.info("Başarıyla çıkış yapıldı."); // Toastify eklendiğinde bu satır açılabilir
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-slate-800 mb-4">Ana Panel</h1>
        <p className="text-lg text-slate-700 mb-2">
          Hoş geldin,{" "}
          <span className="font-semibold">{user?.name || user?.email}</span>!
        </p>
        <p className="text-md text-slate-600 mb-6">
          Bu sayfa, başarılı giriş sonrası yönlendirildiğin geçici ana paneldir.
        </p>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-md transition duration-150 ease-in-out"
        >
          Çıkış Yap
        </button>
      </div>
    </div>
  );
};

// Korumalı Route Bileşeni (Sadece giriş yapmış kullanıcılar için)
const ProtectedRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore(); // isLoading'e şimdilik gerek yok, persist hydration'ı bekler
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

// Sadece Giriş Yapmamış Kullanıcıların Erişebileceği Route Bileşeni
const PublicOnlyRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

// Ana Yönlendirme Yapısı
export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicOnlyRoute>
            <ForgotPasswordPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="reset-password/:token"
        element={
          <PublicOnlyRoute>
            <ResetPasswordPage />
          </PublicOnlyRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<NavigateToHomeOrLogin />} />
      {/* Bulunamayan diğer tüm yollar için */}
      <Route
        path="*"
        element={
          <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4 text-center">
            <h1 className="text-4xl font-bold text-slate-700 mb-4">404</h1>
            <p className="text-xl text-slate-600 mb-6">
              Aradığınız sayfa bulunamadı.
            </p>
            <Link
              to="/"
              className="px-6 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors"
            >
              Ana Sayfaya Dön
            </Link>
          </div>
        }
      />
    </Routes>
  );
};

// Ana sayfaya veya login'e yönlendirme için yardımcı bileşen
const NavigateToHomeOrLogin: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  // Persist middleware'i hydration (localStorage'dan veri yükleme) işlemini
  // store hook'u çağrılmadan önce tamamlar, bu yüzden ek bir isLoading kontrolüne genellikle gerek kalmaz.
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
};
