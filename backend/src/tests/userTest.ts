import mongoose from "mongoose";

import User, { type ILearningProfile, type IUser } from "../models/User";

async function runTest() {
  try {
    await mongoose.connect("mongodb://localhost:27017/my-local-db");
    console.log("veritabanina baglanildi ");

    const newUser: Partial<IUser> = {
      name: "Test Kullanıcı",
      email: "test@example.com",
      password: "plainPassword123",
      learningProfile: <ILearningProfile>{
        learningStyle: "visual",
        preferences: ["video", "interactive"],
        surveyResults: {},
      },
    };

    const user = new User(newUser);
    await user.save();
    console.log("kullanici olusturuldu", user);

    const foundUser = (await User.findOne({
      email: "test@example.com",
    })) as IUser;
    if (foundUser) {
      console.log("kullanici bulurdu ", foundUser);
      if (foundUser.password !== "plainPassword123") {
        console.log("sifre hashlenmis ");
      } else {
        console.log("sifre hashlanmamis ");
      }
    }
  } catch (error) {
    console.log("test sirasinda hata olustu", error);
  } finally {
    await mongoose.connection.close();
    console.log("db baglantisi kesildi");
  }
}

runTest();
