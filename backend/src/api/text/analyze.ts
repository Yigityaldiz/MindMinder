// // src/api/text/analyze.ts
// import { Router } from "express";
// import deepseekAnalyzer from "../../services/deepseekService";
// import validateTextInput from "../../middleware/validateTextInput";
// import { authenticateToken } from "../../middleware/authenticateToken"; // Eksik import'u ekledik
// import Analysis from "../../models/AnalysisResult";
// import { logError } from "../../utils/logger";

// const router = Router();

// // Tüm route'lara authenticateToken middleware'ini ekliyoruz
// router.use(authenticateToken);

// // POST /api/text/analyze
// router.post("/", validateTextInput, async (req, res) => {
//   try {
//     const { text } = req.body;
//     const userId = req.user._id; // Artık authenticateToken sayesinde güvenli

//     // const result = await deepseekAnalyzer.analyzeAndStore(text, userId);

//     res.json({
//       success: true,
//       ...result,
//     });
//   } catch (error) {
//     logError("API Hatası:", error);
//     res.status(500).json({
//       success: false,
//       error: error instanceof Error ? error.message : "Bilinmeyen hata",
//     });
//   }
// });

// // GET /api/text/analyze/history
// router.get("/history", async (req, res) => {
//   try {
//     const analyses = await Analysis.find({ userId: req.user._id })
//       .sort({ createdAt: -1 })
//       .select("summary createdAt");

//     res.json({ success: true, analyses });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       error: error instanceof Error ? error.message : "Geçmiş yüklenemedi",
//     });
//   }
// });

// export default router;
