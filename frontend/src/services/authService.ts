// src/services/authService.ts
import apiClient from "../lib/axios";
import {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
} from "../types/api.types"; // api.types.ts dosyanızda ResetPasswordPayload tipini de ekleyebilirsiniz.
import { User } from "../types/user.types";

// /api/auth/reset-password/:token endpoint'i için istek gövdesi tipi (api.types.ts'e eklenebilir)
interface ResetPasswordPayload {
  newPassword: string;
  confirmPassword?: string; // Backend'iniz istiyorsa ekleyin
}

export const loginUser = async (
  credentials: LoginPayload
): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post<LoginResponse>(
      "/auth/signin", // /api zaten apiClient içinde baseURL olarak var
      credentials
    );
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    // Hata nesnesini veya spesifik bir hata mesajını fırlatmak daha iyi olabilir.
    // Örneğin: if (axios.isAxiosError(error) && error.response) throw error.response.data;
    throw error;
  }
};

export const registerUser = async (
  userData: RegisterPayload
): Promise<User> => {
  // Backend /signup yanıtı User ise doğru
  try {
    const response = await apiClient.post<User>("/auth/signup", userData);
    return response.data;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

export const requestPasswordReset = async (
  email: string
): Promise<{ message: string }> => {
  // Dönüş tipini güncelledik
  try {
    // Endpoint'i projenizin başlangıcındaki tanıma göre güncelledik
    const response = await apiClient.post<{ message: string }>(
      "/auth/requestPassword",
      { email }
    );
    return response.data;
  } catch (error) {
    console.error("Password reset request error:", error);
    throw error;
  }
};

export const resetPassword = async (
  token: string,
  payload: ResetPasswordPayload // newPassword ve opsiyonel confirmPassword için
): Promise<{ message: string }> => {
  // Dönüş tipini güncelledik
  try {
    // Endpoint'i güncelledik, token URL'ye eklendi.
    // Payload sadece { newPassword, confirmPassword? } içerecek.
    const response = await apiClient.post<{ message: string }>(
      `/auth/resetpassword/${token}`, // Token'ı URL'ye ekledik
      payload // { newPassword, confirmPassword? }
    );
    return response.data;
  } catch (error) {
    console.error("Password reset error:", error);
    throw error;
  }
};
