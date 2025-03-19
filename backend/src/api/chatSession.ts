// src/api/chatSession.ts

import { Router, type Request, type Response } from "express";
import ChatSession from "../models/ChatSession";
import {
  authenticateToken,
  type AuthenticatedRequest,
} from "../middleware/authenticateToken";

const router = Router();

/**
 * Yeni sohbet oturumu oluşturma (Create)
 * POST /api/chatSession
 */
router.post(
  "/",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      // authenticateToken middleware sayesinde req.user içerisine kullanıcı bilgisi ekleniyor.
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // İstekten konuyla ilgili veriler alınır.
      const { topic, conversation } = req.body;
      // conversation: [{ question: string, answer: string, timestamp: Date }, ...] şeklinde olmalı.

      // Yeni ChatSession nesnesi oluşturuluyor.
      const newSession = new ChatSession({
        userId, // İçeriği oluşturan kullanıcının id'si
        topic,
        conversation,
        startedAt: new Date(),
      });

      await newSession.save();
      return res
        .status(201)
        .json({ message: "Chat session created", chatSession: newSession });
    } catch (error) {
      console.error("Chat session creation error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * Kullanıcının tüm sohbet oturumlarını listeleme (Read All)
 * GET /api/chatSession
 */
router.get(
  "/",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const sessions = await ChatSession.find({ userId });
      return res.status(200).json({ chatSessions: sessions });
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * Belirli bir sohbet oturumunu getirme (Read One)
 * GET /api/chatSession/:id
 */
router.get(
  "/:id",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      const session = await ChatSession.findOne({ _id: req.params.id, userId });
      if (!session) {
        return res.status(404).json({ message: "Chat session not found" });
      }
      return res.status(200).json({ chatSession: session });
    } catch (error) {
      console.error("Error fetching chat session:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * Sohbet oturumunu güncelleme (Update)
 * PUT /api/chatSession/:id
 */
router.put(
  "/:id",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      const { conversation } = req.body; // örneğin conversation dizisini güncelliyoruz
      const session = await ChatSession.findOneAndUpdate(
        { _id: req.params.id, userId },
        { conversation },
        { new: true }
      );
      if (!session) {
        return res.status(404).json({ message: "Chat session not found" });
      }
      return res
        .status(200)
        .json({ message: "Chat session updated", chatSession: session });
    } catch (error) {
      console.error("Error updating chat session:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * Sohbet oturumunu silme (Delete)
 * DELETE /api/chatSession/:id
 */
router.delete(
  "/:id",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      const session = await ChatSession.findOneAndDelete({
        _id: req.params.id,
        userId,
      });
      if (!session) {
        return res.status(404).json({ message: "Chat session not found" });
      }
      return res.status(200).json({ message: "Chat session deleted" });
    } catch (error) {
      console.error("Error deleting chat session:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
