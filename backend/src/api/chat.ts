// src/api/chat.ts
import { Router, type Request, type Response } from "express";
import deepseekChat from "../services/deepseekService";
import { authenticateToken } from "../middleware/authenticateToken";
import cleanTextInput from "../middleware/cleanTextInput";
import ChatSession from "../models/ChatSession";

const router = Router();

router.post(
  "/",
  authenticateToken,
  cleanTextInput,
  async (req: Request, res: Response) => {
    try {
      const optimazeMessage = req.body.optimizedText;
      const { message } = req.body;
      const userId = req.user;

      let session = await ChatSession.findOne({ userId, isActive: true });

      if (!session) {
        session = new ChatSession({
          userId,
          topic: await generateSessionTitle(optimizedText),
          conversation: [],
          isActive: true,
        });
      }
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      // DeepSeek Chat API'yi çağır
      const chatResponse = await deepseekChat.chatCompletion(optimazeMessage, {
        systemMessage:
          "Kullanıcı mesajı optimize edilmiş versiyon:" + optimazeMessage,
      });

      session.conversation.push({
        question: message,
        answer: chatResponse,
        timestamp: new Date(),
      });

      session.save();

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
