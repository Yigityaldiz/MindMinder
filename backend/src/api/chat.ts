import { Router, type Request, type Response } from "express";
import {
  authenticateToken,
  type AuthenticatedRequest,
} from "../middleware/authenticateToken";
import ChatSession from "../models/ChatSession";

// Gerekli diğer import'larınız (deepseek, cleanTextInput, vb.)
import deepseekChat from "../services/deepseekService";
import cleanTextInput from "../middleware/cleanTextInput";
import { generateSessionTitle } from "../utils/sessionTitleGenerator";

const router = Router();

// --- YENİ EKLENECEK ENDPOINT'LER ---

/**
 * GÖREV: Sidebar'ı Doldurmak
 * Kullanıcının tüm sohbet oturumlarının bir listesini getirir.
 * GET /api/chat
 */
router.get(
  "/",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      // Kullanıcıya ait tüm sohbetleri bul, en yeniden eskiye doğru sırala.
      // select() ile sadece Sidebar için gerekli olan az miktarda veri çekeriz, bu daha verimlidir.
      const chats = await ChatSession.find({ userId })
        .sort({ updatedAt: -1 })
        .select("id topic updatedAt");

      return res.status(200).json(chats);
    } catch (error) {
      console.error("Error fetching chat list:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * GÖREV: Bir Sohbete Tıklandığında Mesajları Yüklemek
 * Belirli bir sohbetin tüm detaylarını (tüm mesaj geçmişi dahil) getirir.
 * GET /api/chat/:id
 */
router.get(
  "/:id",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      // Kullanıcıya ait olan, ID'si eşleşen sohbeti bul.
      const chat = await ChatSession.findOne({ _id: id, userId });

      if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
      }

      return res.status(200).json(chat);
    } catch (error) {
      console.error("Error fetching chat details:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * GÖREV: Bir Sohbeti Silmek
 * Belirli bir sohbet oturumunu siler.
 * DELETE /api/chat/:id
 */
router.delete(
  "/:id",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      const deletedChat = await ChatSession.findOneAndDelete({
        _id: id,
        userId,
      });

      if (!deletedChat) {
        return res.status(404).json({ message: "Chat not found" });
      }

      return res.status(200).json({ message: "Chat deleted successfully" });
    } catch (error) {
      console.error("Error deleting chat:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

// --- SİZİN MEVCUT ENDPOINT'İNİZ ---
/**
 * GÖREV: Yeni Mesaj Göndermek
 * Bir sohbete yeni bir mesaj ekler veya yeni bir sohbet başlatır.
 * POST /api/chat
 */
router.post(
  "/",
  authenticateToken,
  cleanTextInput, // Bu middleware'leri ve diğerlerini kendi yapınıza göre ekleyin
  async (req: AuthenticatedRequest, res: Response) => {
    // ... sizin mevcut POST isteği kodunuz buraya gelecek ...
    // Sadece userId'yi req.user.id olarak almanız daha doğru olabilir.
    try {
      const optimazeMessage = req.body.optimizedText;
      const { message } = req.body;
      const userId = req.user.id; // Değişiklik burada

      // Backend'de chatId kullanmak yerine isActive:true olan son oturumu bulmak daha mantıklı
      let session = await ChatSession.findOne({ userId, isActive: true });

      if (!session) {
        session = new ChatSession({
          userId,
          topic: await generateSessionTitle(optimazeMessage),
          conversation: [],
          isActive: true,
        });
      }
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const chatResponse = await deepseekChat.chatCompletion(optimazeMessage, {
        systemMessage:
          "Kullanıcı mesajı optimize edilmiş versiyon:" + optimazeMessage,
      });

      session.conversation.push({
        question: message,
        answer: chatResponse,
        timestamp: new Date(),
      });

      await session.save(); // save() asenkron olduğu için await kullanın

      res.json({
        sessionId: session._id,
        orginal: message,
        optimized: optimazeMessage,
        success: true,
        response: chatResponse,
      });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ success: false, error: "Chat failed" });
    }
  }
);

export default router;
