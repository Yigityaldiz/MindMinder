// src/middleware/validateTextInput.ts
import { type Request, type Response, type NextFunction } from "express";
import { logError } from "../utils/logger";
import xss from "xss";

export default function validateTextInput(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const MIN_TEXT_LENGTH = parseInt(process.env.MIN_TEXT_LENGTH || "50");
    const MAX_TEXT_LENGTH = parseInt(process.env.MAX_TEXT_LENGTH || "5000");

    // 1. Metin varlığını kontrol et
    if (!req.body.text) {
      throw new Error("Lütfen analiz için metin giriniz");
    }

    // 2. XSS temizliği yap
    const sanitizedText = xss(req.body.text.trim());

    // 3. Uzunluk validasyonu
    if (sanitizedText.length < MIN_TEXT_LENGTH) {
      throw new Error(
        `Metin en az ${MIN_TEXT_LENGTH} karakter olmalıdır (Şu anki: ${sanitizedText.length})`
      );
    }

    if (sanitizedText.length > MAX_TEXT_LENGTH) {
      throw new Error(
        `Metin en fazla ${MAX_TEXT_LENGTH} karakter olabilir (Şu anki: ${sanitizedText.length})`
      );
    }

    // 4. Temizlenmiş metni request'e ekle
    req.body.sanitizedText = sanitizedText;
    next();
  } catch (error) {
    logError("Metin validasyon hatası:", {
      error: error,
      originalText: req.body.text?.substring(0, 100), // Loglamada kısalt
    });

    res.status(400).json({
      success: false,
      error: {
        code: "INVALID_TEXT_INPUT",
        message: error,
        limits: {
          min: process.env.MIN_TEXT_LENGTH,
          max: process.env.MAX_TEXT_LENGTH,
        },
      },
    });
  }
}
