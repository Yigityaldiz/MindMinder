// src/api/chatStream.ts (FAZ 2 - RAG RETRIEVAL ENTEGRE EDİLDİ)

import { Router, type Request, type Response } from "express";
import { authenticateToken } from "../middleware/authenticateToken";
import cleanTextInput from "../middleware/cleanTextInput";
import ChatSession from "../models/ChatSession";
import { generateSessionTitle } from "../utils/sessionTitleGenerator";
import deepseekService from "../services/deepseekService";
import EmbeddingService from "../services/embeddingService";
import QdrantService from "../services/qdrantService";

// MongoDB ID'sini UUID'ye çeviren yardımcı fonksiyonumuz
function mongoIdToUUID(id: string): string {
  const paddedId = id.padEnd(32, "0");
  return `${paddedId.substring(0, 8)}-${paddedId.substring(
    8,
    12
  )}-${paddedId.substring(12, 16)}-${paddedId.substring(
    16,
    20
  )}-${paddedId.substring(20, 32)}`;
}

const router = Router();

router.post(
  "/",
  authenticateToken,
  cleanTextInput,
  async (req: Request, res: Response) => {
    try {
      const optimizedMessage = req.body.optimizedText;
      const userId = req.user.id;

      // ==========================================================
      // ADIM 2.1: HAFIZADAN BİLGİ ÇEKME (RETRIEVAL)
      // ==========================================================
      console.log("RAG Retrieval başlıyor...");
      const qdrant = await QdrantService.getInstance();
      const embedder = await EmbeddingService.getInstance();

      // 1. Gelen yeni soruyu vektöre çevir.
      const queryVector = await embedder.generateEmbedding(optimizedMessage);

      // 2. Bu vektörü kullanarak Qdrant'ta anlamsal arama yap.
      const searchResults = await qdrant.search(queryVector);

      // 3. Arama sonuçlarını (geçmiş konuşmaları) okunabilir bir metne dönüştür.
      const contextText = searchResults
        .map((result) => result.payload?.text)
        .filter(Boolean) // Boş veya undefined metinleri filtrele
        .join("\n\n---\n\n");

      console.log("Bulunan Alakalı Geçmiş Konuşmalar:", contextText);

      // ==========================================================
      // ADIM 2.2: PROMPT'U ZENGİNLEŞTİRME (AUGMENTATION)
      // ==========================================================
      const augmentedPrompt = `
        Sen, geçmiş konuşmaları hatırlayarak cevap veren yardımsever bir asistansın.
        Aşağıda, kullanıcının sorusuyla en alakalı geçmiş konuşma parçaları verilmiştir.
        Bu bilgileri kullanarak kullanıcının YENİ SORUSUNA tutarlı bir cevap ver.
        Eğer geçmiş konuşmalar sorusuyla alakalı değilse, onları dikkate alma.

        [GEÇMİŞ KONUŞMALAR]
        ${contextText}

        [YENİ SORU]
        ${optimizedMessage}
      `;

      // Oturum bulma veya yaratma mantığı...
      let session = await ChatSession.findOne({ userId, isActive: true });
      if (!session) {
        const autoTitle = await generateSessionTitle(optimizedMessage);
        session = new ChatSession({
          userId,
          topic: autoTitle || "Yeni Sohbet",
          conversation: [],
          isActive: true,
        });
        await session.save();
      }

      let fullAnswer = "";
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();

      // ADIM 2.3: ZENGİNLEŞTİRİLMİŞ PROMPT'U YAPAY ZEKAYA GÖNDER
      await deepseekService.streamedChatCompletion(augmentedPrompt, {
        // <-- Değişiklik burada
        systemMessage: "Yardımcı bir asistansın.",
        onProgress: (chunk) => {
          res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
          fullAnswer += chunk;
        },
      });

      // ... (Geri kalan kod aynı: MongoDB ve Qdrant'a KAYDETME) ...
      session.conversation.push({
        question: optimizedMessage,
        answer: fullAnswer,
        timestamp: new Date(),
      });
      await session.save();

      const lastConversation =
        session.conversation[session.conversation.length - 1];
      if (lastConversation?._id) {
        const pointId = mongoIdToUUID(lastConversation._id.toString());
        const textToEmbed = `Soru: ${optimizedMessage}\nCevap: ${fullAnswer}`;
        const vector = await embedder.generateEmbedding(textToEmbed);
        const payload = {
          userId: userId.toString(),
          sessionId: session.id.toString(),
          text: textToEmbed,
          timestamp: new Date().toISOString(),
        };
        await qdrant.upsertPoint(pointId, vector, payload);
        console.log(
          `Sohbet parçası başarıyla Qdrant'a indexlendi. UUID: ${pointId}`
        );
      }

      res.end();
    } catch (error) {
      console.error("Ana sohbet akışı hatası:", error);
      res.status(500).end("Sunucu hatası."); // Hata durumunda stream'i düzgün sonlandır
    }
  }
);

export default router;
