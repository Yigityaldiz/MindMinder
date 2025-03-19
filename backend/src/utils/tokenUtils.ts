// src/utils/tokenUtils.ts - JWT işlemleri için yardımcı fonksiyonlar

// Gerekli kütüphanelerin içe aktarılması
import { SignJWT, jwtVerify } from "jose"; // JWT işlemleri için modern bir kütüphane
import dotenv from "dotenv"; // Ortam değişkenlerini yüklemek için

// .env dosyasından ortam değişkenlerinin yüklenmesi
dotenv.config();

/**
 * JWT token oluşturur.
 * @param payload - JWT payload'ı, örneğin { id: string, email: string, role?: string }
 * @param expiresIn - Token geçerlilik süresi, örneğin "1h", "30m" gibi.
 * @returns Oluşturulan JWT token'ı.
 */
export async function createToken(
  payload: Record<string, any>,
  expiresIn: string = "1h"
): Promise<string> {
  // JWT_SECRET çevre değişkenini byte dizisine dönüştürme (imzalama için gerekli)
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

  // JWT oluşturma ve yapılandırma
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" }) // HS256 algoritması kullanılıyor
    .setExpirationTime(expiresIn) // Token'ın ne zaman geçersiz olacağını belirler
    .sign(secret); // Gizli anahtar ile imzalama işlemi
}

/**
 * JWT token'ı doğrular ve payload'ı döndürür.
 * @param token - Doğrulanacak JWT token'ı.
 * @returns Token içerisindeki payload.
 * @throws Hata durumunda, token geçersizse hata fırlatır.
 */
export async function verifyToken(token: string): Promise<any> {
  // JWT_SECRET çevre değişkenini byte dizisine dönüştürme (doğrulama için gerekli)
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

  // Token doğrulama işlemi
  const { payload } = await jwtVerify(token, secret);

  // Doğrulanmış payload'ı döndürme
  return payload;
}
