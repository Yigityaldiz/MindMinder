// src/api/content.ts

import { Router, type Request, type Response } from "express";
import Content from "../models/Content";
import {
  authenticateToken,
  type AuthenticatedRequest,
} from "../middleware/authenticateToken";

const router = Router();

/**
 * Yeni içerik oluşturma (Create)
 * POST /api/content
 * Bu endpoint, doğrulanmış kullanıcının (req.user) kimliğini alarak içeriği o kullanıcı ile ilişkilendirir.
 */
router.post(
  "/",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      // Authenticate middleware sayesinde req.user içerisine token'dan alınan kullanıcı bilgisi eklendi.
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Diğer içerik bilgilerini request'ten alıyoruz.
      const {
        title,
        description,
        contentType,
        fileUrl,
        categories,
        tags,
        learningStyle,
      } = req.body;

      const newContent = new Content({
        title,
        description,
        contentType,
        fileUrl,
        categories,
        tags,
        learningStyle,
        user: userId, // Kullanıcı kimliği doğrudan buradan ekleniyor.
      });

      await newContent.save();
      return res
        .status(201)
        .json({ message: "Content created successfully", content: newContent });
    } catch (error) {
      console.error("Content creation error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * Tüm içerikleri listeleme (Read All)
 * GET /api/content
 * Opsiyonel olarak, sadece belirli bir kullanıcıya ait içerikler de listelenebilir.
 */
router.get(
  "/",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      // İsteğe bağlı: Eğer sadece doğrulanmış kullanıcıya ait içerikleri getirmek isterseniz:
      const userId = req.user?.id;
      // Örneğin, tüm içerikleri getirmek için:
      const contents = await Content.find({}).populate("user", "name email");
      // Veya sadece belirli bir kullanıcı için:
      // const contents = await Content.find({ user: userId }).populate("user", "name email");

      return res.status(200).json({ contents });
    } catch (error) {
      console.error("Content fetch error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * Belirli bir içeriği ID ile getirme (Read One)
 * GET /api/content/:id
 */
router.get(
  "/:id",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      // İsteğe bağlı: Sadece içerik sahibi ise detay getirebiliriz.
      const userId = req.user?.id;
      const content = await Content.findOne({
        _id: req.params.id,
        user: userId,
      }).populate("user", "name email");
      if (!content) {
        return res.status(404).json({ message: "Content not found" });
      }
      return res.status(200).json({ content });
    } catch (error) {
      console.error("Content fetch error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * İçeriği güncelleme (Update)
 * PUT /api/content/:id
 */
router.put(
  "/:id",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      const updatedContent = await Content.findOneAndUpdate(
        { _id: req.params.id, user: userId },
        req.body,
        { new: true }
      );
      if (!updatedContent) {
        return res.status(404).json({ message: "Content not found" });
      }
      return res.status(200).json({
        message: "Content updated successfully",
        content: updatedContent,
      });
    } catch (error) {
      console.error("Content update error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

/**
 * İçeriği silme (Delete)
 * DELETE /api/content/:id
 */
router.delete(
  "/:id",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
    try {
      const userId = req.user?.id;
      const deletedContent = await Content.findOneAndDelete({
        _id: req.params.id,
        user: userId,
      });
      if (!deletedContent) {
        return res.status(404).json({ message: "Content not found" });
      }
      return res.status(200).json({ message: "Content deleted successfully" });
    } catch (error) {
      console.error("Content deletion error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
