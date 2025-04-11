// src/api/chat.ts
import { Router, type Request, type Response } from "express";
import deepseekChat from "../services/deepseekService";
import { authenticateToken } from "../middleware/authenticateToken";
import cleanTextInput from "../middleware/cleanTextInput";

const router = Router();

router.post(
  "/",
  authenticateToken,
  cleanTextInput,
  async (req: Request, res: Response) => {
    try {
      const optimazeMessage = req.body.optimizedText;
      const { message } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      // DeepSeek Chat API'yi çağır
      const chatResponse = await deepseekChat.chatCompletion(optimazeMessage, {
        systemMessage:
          "Kullanıcı mesajı optimize edilmiş versiyon:" + optimazeMessage,
      });

      res.json({
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
