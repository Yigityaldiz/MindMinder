// // src/services/deepseekService.ts
// import axios from "axios";

// class DeepSeekService {
//   private chatApiKey: string;
//   private chatApiUrl: string;

//   constructor() {
//     this.chatApiKey = process.env.DEEPSEEK_API_KEY!;
//     this.chatApiUrl = process.env.DEEPSEEK_CHAT_API_URL!;
//   }

//   // Yeni metod: Sohbet yanıtı üret
//   async generateResponse(userMessage: string): Promise<string> {
//     const response = await axios.post(
//       this.chatApiUrl,
//       {
//         messages: [
//           {
//             role: "user",
//             content: userMessage,
//           },
//         ],
//         model: "deepseek-chat", // Model adını API dokümantasyonuna göre güncelleyin
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${this.chatApiKey}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     return response.data.choices[0].message.content;
//   }
// }

// export default new DeepSeekService();
// src/services/deepseekService.ts
import axios from "axios";
import { logError } from "../utils/logger";

// API Konfigürasyonları
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY!;
const CHAT_API_URL = "https://api.deepseek.com/v1/chat/completions";

class DeepSeekService {
  // Chat API için optimize edilmiş çağrı
  async chatCompletion(
    prompt: string,
    options: {
      temperature?: number;
      max_tokens?: number;
      systemMessage?: string;
    } = {}
  ) {
    try {
      const response = await axios.post(
        CHAT_API_URL,
        {
          model: "deepseek-reasoner",
          messages: [
            {
              role: "system",
              content: options.systemMessage || "You are a helpful assistant.",
            },
            { role: "user", content: prompt },
          ],

          temperature: options.temperature ?? 0.7,
          max_tokens: options.max_tokens ?? 2000,
        },
        {
          headers: {
            Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: 15000, // 15 saniye timeout
        }
      );

      return response.data.choices[0].message.content;
    } catch (error: any) {
      this.handleApiError(error);
      throw new Error("Sohbet yanıtı alınamadı");
    }
  }

  // Merkezi hata yönetimi
  private handleApiError(error: any) {
    const status = error.response?.status;
    const errorCode = error.response?.data?.error?.code;
    const errorMessage =
      error.response?.data?.error?.message || "Bilinmeyen hata";

    logError(`DeepSeek API Hatası [${status}/${errorCode}]:`, errorMessage);

    // Özel hata mesajları
    switch (status) {
      case 400:
        throw new Error("Geçersiz istek formatı");
      case 401:
        throw new Error("Geçersiz API anahtarı");
      case 429:
        throw new Error("API limiti aşıldı");
      case 500:
        throw new Error("DeepSeek sunucusunda hata");
      default:
        throw new Error(`Beklenmeyen hata: ${errorMessage}`);
    }
  }
}

export default new DeepSeekService();
