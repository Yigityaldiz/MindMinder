import { connectDB } from "./services/db";
import express from "express";
import dotenv from "dotenv";
import signupRouter from "./api/auth/signup";

dotenv.config();

connectDB();

const app = express();

app.use(express.json());

app.use("/api/auth/signup", signupRouter);
app.get("/api/hello", (req, res) => {
  res.json({ message: "hello word" });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} ustunde calisiyor... `);
});
