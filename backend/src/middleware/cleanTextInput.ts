import { type Response, type Request, type NextFunction } from "express";
import { sanitizeText } from "../utils/textCleaner";
import { optimazeForTokenLimit } from "../utils/textOptimizer";

export default function cleanTextInput(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const rawText = req.body.message;
    if (!rawText || typeof rawText !== "string") {
      return res.status(400).json({ error: "Invalid text input" });
    }
    const cleanedText = sanitizeText(rawText);
    req.body.optimizedText = optimazeForTokenLimit(cleanedText);
    next();
  } catch (err) {
    console.error("Error in cleanTextInput middleware:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
