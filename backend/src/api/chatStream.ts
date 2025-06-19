// src/api/chatStream.ts (NİHAİ VE DOĞRU VERSİYON)

import { Router, type Request, type Response } from "express";
import { authenticateToken } from "../middleware/authenticateToken";
import cleanTextInput from "../middleware/cleanTextInput";
import ChatSession from "../models/ChatSession";
import { generateSessionTitle } from "../utils/sessionTitleGenerator";
import deepseekService from "../services/deepseekService";
import EmbeddingService from "../services/embeddingService";
import QdrantService from "../services/qdrantService";
// Bu importun projenizde doğru bir yolda olduğunu varsayıyoruz
import mongoIdToUUID from "../utils/idConverter";

const router = Router();

router.post(
  "/",
  authenticateToken,
  cleanTextInput,
  async (req: Request, res: Response) => {
    try {
      // 1. Gerekli tüm bilgileri isteğin başından al.
      const { message, optimizedText, chatId } = req.body;
      const userId = req.user.id;

      // 2. 'session' değişkenini SADECE BİR KEZ en başta tanımla.
      let session;

      // 3. Oturum Yönetimini TEK BİR BLOK içinde, en başta hallet.
      if (chatId) {
        // MEVCUT SOHBET: ID ile bulunur ve 'session' değişkenine atanır.
        session = await ChatSession.findOne({ _id: chatId, userId });
        if (!session) {
          return res
            .status(404)
            .json({ message: "Sohbet oturumu bulunamadı." });
        }
      } else {
        // YENİ SOHBET: Diğerleri pasif yapılır ve yeni bir session oluşturulup 'session' değişkenine atanır.
        await ChatSession.updateMany(
          { userId: userId, isActive: true },
          { $set: { isActive: false, endedAt: new Date() } }
        );
        const autoTitle = await generateSessionTitle(optimizedText);
        session = new ChatSession({
          userId,
          topic: autoTitle || "Yeni Sohbet",
          conversation: [],
          isActive: true,
        });
      }

      // 4. RAG: Hafızadan ilgili geçmiş konuşmaları çekilir.
      const qdrant = await QdrantService.getInstance();
      const embedder = await EmbeddingService.getInstance();
      const queryVector = await embedder.generateEmbedding(optimizedText);
      const searchResults = await qdrant.search(queryVector, 3, {
        must: [{ key: "userId", match: { value: userId } }],
      });
      const contextText = searchResults
        .map((p) => p.payload?.text)
        .filter(Boolean)
        .join("\n\n---\n\n");

      // 5. Prompt Zenginleştirilir.
      const augmentedPrompt = `Use the following conversation history as context... [PAST CONVERSATIONS]\n${
        contextText || "No history."
      }\n\n[NEW QUESTION]\n${optimizedText}`;

      // 6. Yapay Zekadan Cevap Alınır.
      let fullAnswer = "";
      res.setHeader("Content-Type", "text/event-stream");
      res.flushHeaders();

      await deepseekService.streamedChatCompletion(augmentedPrompt, {
        onProgress: (chunk) => {
          res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
          fullAnswer += chunk;
        },
      });

      // 7. Kaydetme ve Indexleme (Doğru 'session' objesi üzerinden)
      session.conversation.push({
        question: message,
        answer: fullAnswer,
        timestamp: new Date(),
      });
      await session.save();

      const lastConversation =
        session.conversation[session.conversation.length - 1];
      if (lastConversation?._id) {
        const pointId = mongoIdToUUID(lastConversation._id.toString());
        const textToEmbed = `Soru: ${message}\nCevap: ${fullAnswer}`;
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

      // 8. Stream Sonlandırılır.
      res.end();
    } catch (error) {
      console.error("Ana sohbet akışı hatası:", error);
      res.status(500).end("Sunucu hatası.");
    }
  }
);

export default router;
