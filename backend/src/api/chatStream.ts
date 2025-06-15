// src/api/chatStream.ts (RAG - INDEXING ENTEGRE EDİLDİ)

import { Router, type Request, type Response } from "express";
import { authenticateToken } from "../middleware/authenticateToken";
import cleanTextInput from "../middleware/cleanTextInput";
import ChatSession from "../models/ChatSession";
import { generateSessionTitle } from "../utils/sessionTitleGenerator";
import deepseekService from "../services/deepseekService";

// Adım 1: Yeni servislerimizi import ediyoruz.
import EmbeddingService from "../services/embeddingService";
import QdrantService from "../services/qdrantService";

const router = Router();

function mongoIdToUUID(id: string): string {
  const paddedId = id.padEnd(32, "0");
  // UUID formatına uygun şekilde tireleri ekliyoruz (8-4-4-4-12).
  return `${paddedId.substring(0, 8)}-${paddedId.substring(
    8,
    12
  )}-${paddedId.substring(12, 16)}-${paddedId.substring(
    16,
    20
  )}-${paddedId.substring(20, 32)}`;
}

router.post(
  "/",
  authenticateToken,
  cleanTextInput,
  async (req: Request, res: Response) => {
    const optimizedMessage = req.body.optimizedText;
    const userId = req.user.id;

    // ... (Oturum bulma veya yaratma mantığı aynı kalıyor) ...
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

    try {
      // --- DEEPSEEK STREAM BAŞLANGICI (Bu kısım aynı) ---
      await deepseekService.streamedChatCompletion(optimizedMessage, {
        systemMessage: "Yardımcı bir asistansın.",
        onProgress: (chunk) => {
          res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
          fullAnswer += chunk;
        },
      });
      // --- DEEPSEEK STREAM BİTİŞİ ---

      // MongoDB'ye kaydetme (Bu kısım da aynı)
      session.conversation.push({
        question: optimizedMessage,
        answer: fullAnswer,
        timestamp: new Date(),
      });
      await session.save();

      // =================================================================
      // Adım 2: YENİ EKLENEN RAG INDEXING MANTIĞI
      // =================================================================
      try {
        console.log("RAG Indexing başlıyor...");

        // Servislerimizin başlatılmış örneklerini alıyoruz.
        const qdrant = await QdrantService.getInstance();
        const embedder = await EmbeddingService.getInstance();

        // Vektöre dönüştüreceğimiz metni hazırlıyoruz.
        const textToEmbed = `Soru: ${optimizedMessage}\nCevap: ${fullAnswer}`;

        // Metni vektöre çeviriyoruz.
        const vector = await embedder.generateEmbedding(textToEmbed);

        const lastConversation =
          session.conversation[session.conversation.length - 1];

        // Qdrant'a kaydedilecek noktanın ID'sini ve payload'ını hazırlıyoruz.
        if (lastConversation && lastConversation._id) {
          const pointId = mongoIdToUUID(lastConversation._id.toString());

          const payload = {
            userId: userId.toString(),
            sessionId: session.id.toString(),
            text: textToEmbed,
            timestamp: new Date().toISOString(),
          };

          await qdrant.upsertPoint(pointId, vector, payload);
          console.log(
            `Sohbet parçası başarıyla Qdrant'a indexlendi. ID: ${pointId}`
          );
        } else {
          // Bu durumun normalde olmaması gerekir ama bir sorun olursa loglayalım.
          console.error(
            "RAG Indexing: Son sohbet parçası veya ID'si bulunamadı. Kayıt atlandı."
          );
        }
        // ==========================================================
        // GÜVENLİ ERİŞİM BLOĞUNUN SONU
        // ==========================================================
      } catch (ragError) {
        console.error("RAG Indexing sırasında hata oluştu:", ragError);
      }
      // =================================================================
      // YENİ MANTIĞIN SONU
      // =================================================================

      // Stream'i sonlandırıyoruz.
      res.end();
    } catch (error) {
      console.error("Stream error:", error);
      res.write(
        `event: error\ndata: ${JSON.stringify({
          error: "Stream sırasında bir hata oluştu.",
        })}\n\n`
      );
      res.end();
    }
  }
);

export default router;
