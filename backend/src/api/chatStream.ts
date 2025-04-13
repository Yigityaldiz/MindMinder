// src/api/chatStream.ts
import { Router, type Request, type Response } from "express";
import deepseekService from "../services/deepseekService";
import { authenticateToken } from "../middleware/authenticateToken";
import cleanTextInput from "../middleware/cleanTextInput";

const router = Router();

router.post(
  "/",
  authenticateToken,
  cleanTextInput,
  async (req: Request, res: Response) => {
    try {
      const optimizedMessage = req.body.optimizedText;
      const { message } = req.body;

      // Header'ları SSE için ayarla
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.flushHeaders();

      // Stream işlemini başlat
      await deepseekService.streamedChatCompletion(optimizedMessage, {
        systemMessage: "Optimized input: " + optimizedMessage,
        onProgress: (chunk) => {
          res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
        },
      });

      res.end();
    } catch (error) {
      console.error("Stream error:", error);
      res.write(`event: error\ndata: ${JSON.stringify({ error: error })}\n\n`);
      res.end();
    }
  }
);

export default router;
