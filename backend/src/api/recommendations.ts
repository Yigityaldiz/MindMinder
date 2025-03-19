// src/services/recommendationService.ts

import Content, { type IContent } from "../models/Content";
import User, { type IUser } from "../models/User";
import { Router, type Request, type Response } from "express";

const router = Router();

/**
 * Kullanıcının öğrenme stiline göre içerik önerileri getirir.
 * 1. Kullanıcının profilini veritabanından çek.
 * 2. Kullanıcının learningStyle bilgisini elde et.
 * 3. Content modelinde, learningStyle alanı ile eşleşen içerikleri sorgula.
 * 4. Önerilen içerikleri döndür.
 *
 * Basit rule-based filtreleme uygulanıyor; daha gelişmiş NLP/embedding yöntemleri ileride eklenebilir.
 */
export async function getRecommendationsForUser(
  userId: string
): Promise<IContent[]> {
  // 1. Kullanıcıyı çek
  const user: IUser | null = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  // 2. Kullanıcının learningStyle bilgisini al
  // Örneğin, user.learningProfile.learningStyle
  const userLearningStyle = user.learningProfile?.learningStyle;
  if (!userLearningStyle) {
    // Eğer kullanıcı profili eksikse, varsayılan öneri veya hata verebilirsiniz.
    throw new Error("User learning style is not defined");
  }

  // 3. Content modelinde, learningStyle alanı ile eşleşen içerikleri sorgula
  // Burada, basit bir filtreleme yapıyoruz.
  const recommendedContents = await Content.find({
    learningStyle: userLearningStyle,
  });

  // 4. Öneri listesini döndür
  return recommendedContents;
}

export default router;
