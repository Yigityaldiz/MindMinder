import { connectDB } from "./services/db";
import express from "express";
import dotenv from "dotenv";
import signupRouter from "./api/auth/signup";
import signinRouter from "./api/auth/signin";
import contentRouter from "./api/content";
import chatSessionRouter from "./api/chatSession";
import recommendationsRouter from "./api/recommendations";
import chatRouter from "./api/chat";
import streamRouter from "./api/chatStream";
import resetPasswordRouter from "./api/auth/resetPassword";
import requestPasswordRouter from "./api/auth/requestPasswordReset";
import cors from "cors";

import adminRouter from "./api/admin";

dotenv.config();

connectDB();

const app = express();
const corsOptions = {
  origin: "http://localhost:5173", // Frontend'inin adresi
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS", // İzin verilen metodlar
  allowedHeaders: "Content-Type,Authorization", // İzin verilen başlıklar
  credentials: true, // Eğer cookie veya authorization header'ları gibi bilgiler gönderiyorsan
  optionsSuccessStatus: 200, // Bazı eski tarayıcılar için OPTIONS isteğine 204 yerine 200 döner
};

// CORS middleware'ini seçeneklerle birlikte kullan
// TÜM ROUTE'LARDAN ÖNCE GELMELİ!
app.use(cors(corsOptions));

app.use(express.json());

app.use("/api/auth/signup", signupRouter);
app.use("/api/auth/signin", signinRouter);
app.use("/api/content", contentRouter);
app.use("/api/chatSession", chatSessionRouter);
app.use("/api/recommendations", recommendationsRouter);
// app.use("/api/analyze", analyzeRouter);
app.use("/api/admin", adminRouter);
app.use("/api/chat", chatRouter);
app.use("/api/chatStream", streamRouter);
app.use("/api/auth/resetPassword", resetPasswordRouter);
app.use("/api/auth/requestPassword", requestPasswordRouter);

app.get("/api/hello", (req, res) => {
  res.json({ message: "hello word" });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} ustunde calisiyor... `);
});
