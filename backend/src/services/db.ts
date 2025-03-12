import mongoose from "mongoose";
import { config } from "dotenv";
config();

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/my-local-db";

export async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("Yerel MongoDB'ye bağlandı!");
  } catch (error) {
    console.error("MongoDB bağlantı hatası:", error);
  }
}
