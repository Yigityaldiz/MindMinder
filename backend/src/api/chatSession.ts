// src/api/chatSession.ts
import { Router, type Request, type Response } from "express";
import ChatSession from "../models/ChatSession";
import {
  authenticateToken,
  type AuthenticatedRequest,
} from "../middleware/authenticateToken";
import { generateSessionTitle } from "../utils/sessionTitleGenerator"; // Yeni eklenen fonksiyon
import { logInfo } from "../utils/logger"; // Loglama için

const router = Router();

// 1. Yeni Oturum Oluşturma (Create) - Güncellendi
router.post(
  "/",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      // Önceki aktif oturumları kapat
      await ChatSession.updateMany(
        { userId, isActive: true },
        { isActive: false, endedAt: new Date() }
      );

      // Otomatik başlık oluştur
      const firstMessage = req.body.conversation?.[0]?.question || "";
      const topic = await generateSessionTitle(firstMessage);

      const newSession = new ChatSession({
        userId,
        topic,
        conversation: req.body.conversation || [],
        isActive: true,
        startedAt: new Date(),
        updatedAt: new Date(), // Yeni alan
      });

      await newSession.save();

      logInfo("Yeni oturum oluşturuldu", {
        userId,
        sessionId: newSession._id,
      });

      return res.status(201).json({
        success: true,
        message: "Chat session created",
        chatSession: newSession,
      });
    } catch (error) {
      logInfo("Oturum oluşturma hatası", {
        error: error,
        userId: req.user?.id,
        body: req.body,
      });
      return res.status(500).json({
        success: false,
        message: "Server error",
        errorCode: "SESSION_CREATE_FAILED",
      });
    }
  }
);

// 2. Gelişmiş Listeleme (Read All) - Pagination eklendi
router.get(
  "/",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const [sessions, total] = await Promise.all([
        ChatSession.find({ userId })
          .sort({ updatedAt: -1 })
          .skip(skip)
          .limit(limit),
        ChatSession.countDocuments({ userId }),
      ]);

      return res.status(200).json({
        success: true,
        data: sessions,
        meta: {
          total,
          page,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      logInfo("Oturum listeleme hatası", {
        error: error,
        userId: req.user?.id,
      });
      return res.status(500).json({
        success: false,
        message: "Server error",
        errorCode: "SESSION_FETCH_FAILED",
      });
    }
  }
);

// 3. Gelişmiş Arama Endpoint'i - Yeni eklendi
router.get(
  "/search",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      const query = req.query.q as string;

      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      if (!query)
        return res.status(400).json({ message: "Query parameter required" });

      const results = await ChatSession.find({
        userId,
        $or: [
          { topic: { $regex: query, $options: "i" } },
          { "conversation.question": { $regex: query, $options: "i" } },
          { "conversation.answer": { $regex: query, $options: "i" } },
        ],
      });

      return res.status(200).json({
        success: true,
        results,
        count: results.length,
      });
    } catch (error) {
      logInfo("Arama hatası", {
        error: error,
        userId: req.user?.id,
        query: req.query.q,
      });
      return res.status(500).json({
        success: false,
        message: "Server error",
        errorCode: "SEARCH_FAILED",
      });
    }
  }
);

// 4. Oturum Başlık Güncelleme - Yeni eklendi
router.patch(
  "/:id/title",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      const { title } = req.body;

      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      if (!title) return res.status(400).json({ message: "Title required" });

      const updatedSession = await ChatSession.findOneAndUpdate(
        { _id: req.params.id, userId },
        { topic: title, updatedAt: new Date() },
        { new: true }
      );

      if (!updatedSession) {
        return res.status(404).json({ message: "Session not found" });
      }

      return res.status(200).json({
        success: true,
        updatedSession,
      });
    } catch (error) {
      logInfo("Başlık güncelleme hatası", {
        error: error,
        sessionId: req.params.id,
        userId: req.user?.id,
      });
      return res.status(500).json({
        success: false,
        message: "Server error",
        errorCode: "TITLE_UPDATE_FAILED",
      });
    }
  }
);

export default router;
