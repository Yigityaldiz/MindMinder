// src/types/api.types.ts
import { User } from "./user.types";

// /api/auth/signin endpoint'i için istek gövdesi tipi
export interface LoginPayload {
  email: string;
  password: string;
}

// /api/auth/signin endpoint'i için başarılı yanıt tipi
export interface LoginResponse {
  token: string;
  user: User; // src/types/user.types.ts dosyasındaki User tipini kullanıyoruz
}

// /api/auth/signup endpoint'i için istek gövdesi tipi (ileride lazım olacak)
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface ResetPasswordPayload {
  newPassword: string;
  confirmPassword?: string; // Backend'iniz bu alanı bekliyorsa ekleyin, beklemiyorsa sadece newPassword yeterli.
}

// Genel bir API hata yanıtı tipi (Backend'iniz böyle bir yapı dönüyorsa)
export interface ApiErrorResponse {
  message: string;
  // backend'den gelen diğer hata detayları varsa eklenebilir
  // statusCode?: number;
  // errors?: { [key: string]: string[] };
}
