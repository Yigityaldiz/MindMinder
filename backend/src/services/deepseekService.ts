import axios from "axios";
import { logError } from "../utils/logger";

// API Konfigürasyonları
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY!;
const CHAT_API_URL = "https://api.deepseek.com/v1/chat/completions";

interface StreamChunk {
  choices: Array<{
    delta: {
      content?: string;
    };
  }>;
}

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

  async streamedChatCompletion(
    prompt: string,
    options: {
      temperature?: number;
      systemMessage?: string;
      onProgress?: (chunk: string) => void;
    } = {}
  ): Promise<string> {
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
          stream: true,
        },
        {
          headers: {
            Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
            "Content-Type": "application/json",
          },
          responseType: "stream",
          timeout: 30000,
        }
      );

      return new Promise<string>((resolve, reject) => {
        let fullResponse = "";
        const stream = response.data;

        stream.on("data", (chunk: Buffer) => {
          try {
            const lines = chunk
              .toString()
              .split("\n")
              .filter((line) => line.trim());

            for (const line of lines) {
              const message = line.replace(/^data: /, "");
              if (message === "[DONE]") return;

              const parsed: StreamChunk = JSON.parse(message);
              const content = parsed.choices[0]?.delta?.content || "";

              fullResponse += content;
              options.onProgress?.(content);
            }
          } catch (error) {
            reject(new Error("Stream parsing error"));
          }
        });

        stream.on("end", () => resolve(fullResponse));
        stream.on("error", (error: Error) => {
          this.handleStreamError(error, reject);
        });
      });
    } catch (error: any) {
      this.handleApiError(error);
      throw error;
    }
  }

  private handleStreamError(error: Error, reject: (reason: any) => void) {
    logError("Stream error:", error);
    reject(new Error("Stream kesildi"));
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
