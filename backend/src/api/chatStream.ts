import { Router, type Request, type Response } from "express";
import deepseekService from "../services/deepseekService";
import { authenticateToken } from "../middleware/authenticateToken";
import cleanTextInput from "../middleware/cleanTextInput";
import ChatSession from "../models/ChatSession";
import { generateSessionTitle } from "../utils/sessionTitleGenerator";

const router = Router();

router.post(
  "/",
  authenticateToken,
  cleanTextInput,
  async (req: Request, res: Response) => {
    const optimizedMessage = req.body.optimizedText;

    const userId = req.user.id;
    console.log("userId:", userId);

    let autoTitle = "Yeni Sohbet";
    try {
      autoTitle = await generateSessionTitle(optimizedMessage);
      console.log("Otomatik başlık:", autoTitle);
    } catch (error) {
      console.error("Başlık oluşturma hatası:", error);
    }

    // 1) Oturumu bul ya da yarat
    let session = await ChatSession.findOne({ userId, isActive: true });
    if (!session) {
      const finalTopic =
        autoTitle && typeof autoTitle === "string" && autoTitle.trim() !== ""
          ? autoTitle
          : "Başlıksız Sohbet";
      session = new ChatSession({
        userId,
        topic: finalTopic,
        conversation: [],
        isActive: true,
        startedAt: new Date(),
        updatedAt: new Date(),
      });
      console.log("Yeni oturum oluşturuldu:", session.toObject());
      await session.save();
      console.log("Yeni oturum kaydedildi:");
    }

    // 2) Tamamlanmış cevabı tutacak değişken
    let fullAnswer = "";

    // 3) SSE başlıklarını ayarla
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();
    console.log("Stream başlamadan önceki oturum durumu:", session?.toObject());
    try {
      await deepseekService.streamedChatCompletion(optimizedMessage, {
        systemMessage: "Optimized: " + optimizedMessage,
        onProgress: (chunk) => {
          // SSE ile UI’a gönder
          res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
          // Parçayı fullAnswer’a ekle
          fullAnswer += chunk;
        },
      });

      // 4) Stream tamamlandıktan sonra tek kayıt olarak kaydet
      session.conversation.push({
        question: optimizedMessage,
        answer: fullAnswer,
        timestamp: new Date(),
      });
      session.updatedAt = new Date();
      await session.save();

      // 5) SSE bağlantısını kapat
      res.end();
    } catch (error) {
      console.error("Stream error:", error);
      res.write(
        `event: error\ndata: ${JSON.stringify({
          error: error || error,
        })}\n\n`
      );
      res.end();
    }
  }
);

export default router;
