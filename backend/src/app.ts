import { connectDB } from "./services/db";
import express from "express";
import dotenv from "dotenv";
import signupRouter from "./api/auth/signup";
import signinRouter from "./api/auth/signin";
import contentRouter from "./api/content";
import chatSessionRouter from "./api/chatSession";
import recommendationsRouter from "./api/recommendations";
import chatRouter from "./api/chat";

import adminRouter from "./api/admin";

dotenv.config();

connectDB();

const app = express();

app.use(express.json());

app.use("/api/auth/signup", signupRouter);
app.use("/api/auth/signin", signinRouter);
app.use("/api/content", contentRouter);
app.use("/api/chatSession", chatSessionRouter);
app.use("/api/recommendations", recommendationsRouter);
// app.use("/api/analyze", analyzeRouter);
app.use("/api/admin", adminRouter);
app.use("/api/chat", chatRouter);

app.get("/api/hello", (req, res) => {
  res.json({ message: "hello word" });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} ustunde calisiyor... `);
});
