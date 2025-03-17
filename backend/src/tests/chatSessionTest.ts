// src/tests/chatSessionTest.ts

import mongoose from "mongoose";
import ChatSession, { type IChatSession } from "../models/ChatSession";
import User, { type ILearningProfile, type IUser } from "../models/User";

async function runChatSessionTest() {
  try {
    // MongoDB'ye bağlanma (bağlantı URI'nizi .env üzerinden yönetebilirsiniz)
    await mongoose.connect("mongodb://localhost:27017/my-local-db", {});
    console.log("Veritabanına bağlanıldı.");

    // Test amaçlı yeni bir kullanıcı oluşturma
    const newUser: Partial<IUser> = {
      name: "Test User 1",
      email: "testuser3@example.com",
      password: "plainPassword123",
      learningProfile: <ILearningProfile>{
        learningStyle: "visual",
        preferences: ["video", "audio"],
        surveyResults: {},
      },
    };
    const user = new User(newUser);
    await user.save();
    console.log("Test kullanıcı oluşturuldu:", user);

    // Yeni bir ChatSession oluşturma
    const newChatSession: Partial<IChatSession> = {
      userId: user._id as mongoose.Types.ObjectId,
      topic: "Node.js ve Mongoose",
      conversation: [
        {
          question: "Node.js nedir?",
          answer:
            "Node.js, Chrome’un V8 motoru üzerine kurulmuş bir JavaScript çalışma zamanıdır.",
          timestamp: new Date(),
        },
        {
          question: "Mongoose nedir?",
          answer:
            "Mongoose, MongoDB ile çalışmayı kolaylaştıran bir ODM kütüphanesidir.",
          timestamp: new Date(),
        },
      ],
      startedAt: new Date(),
      endedAt: undefined,
    };

    const chatSession = new ChatSession(newChatSession);
    await chatSession.save();
    console.log("Sohbet oturumu oluşturuldu:", chatSession);

    // Oluşturulan sohbet oturumunu veritabanından çekme ve görüntüleme
    const foundSession = await ChatSession.findOne({
      _id: chatSession._id,
    }).populate("userId");
    console.log("Sohbet oturumu bulundu:", foundSession);
  } catch (error) {
    console.error("ChatSession testi sırasında hata:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Veritabanı bağlantısı kapatıldı.");
  }
}

runChatSessionTest();
