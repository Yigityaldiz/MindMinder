// src/utils/textCleaner.ts
import xss from "xss";
import he from "he";

export function sanitizeText(rawText: string): string {
  // 1. HTML/XSS Temizliği
  const sanitized = xss(rawText, {
    whiteList: {}, // Tüm HTML etiketlerini kaldır
    stripIgnoreTag: true,
  });

  // 2. HTML Entity Decode
  const decoded = he.decode(sanitized);

  // 3. Fazla Boşlukları Temizle
  return decoded.replace(/\s+/g, " ").trim();
}
