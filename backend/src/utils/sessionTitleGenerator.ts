// src/utils/sessionTitleGenerator.ts (GÜNCELLENMİŞ HALİ)

import deepseekService from "../services/deepseekService";

// 'promt' yazım hatasını 'prompt' olarak düzeltmek iyi bir pratiktir.
export async function generateSessionTitle(prompt: string): Promise<string> {
  try {
    const titlePrompt = `Bu sohbet için maksimum 5 kelimelik bir başlık öner: "${prompt}"`;

    const response = await deepseekService.chatCompletion(titlePrompt, {
      systemMessage: "Sen kısa ve öz başlıklar üreten bir asistansın.",
      temperature: 0.5,
      // DEĞİŞİKLİK BURADA: max_tokens değerini açıkça belirtiyoruz.
      max_tokens: 30, // Başlık için 30 token fazlasıyla yeterli.
    });
    // Başlıktaki tırnak işaretleri gibi istenmeyen karakterleri temizle
    return response.replace(/["']/g, "").replace(/\.$/, "").trim();
  } catch (error) {
    console.error("Error generating session title:", error);
    // Hata durumunda bile uygulamanın çökmemesi için varsayılan bir başlık dön
    return "Yeni Sohbet";
  }
}
