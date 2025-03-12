import mongoose from "mongoose";

import Content, { type IContent } from "../models/Content";

async function runContentTest() {
  try {
    await mongoose.connect("mongodb://localhost:27017/my-local-db");

    console.log("veri tabanina baglanildi");

    const newContent: Partial<IContent> = {
      title: "Örnek Doküman",
      description: "Bu, örnek bir doküman içeriğidir.",
      contentType: "document",
      fileUrl: "https://example.com/document.pdf",
      categories: ["Eğitim", "Doküman"],
      tags: ["örnek", "eğitim"],
      learningStyle: "visual",
    };

    const content = new Content(newContent);

    await content.save();

    console.log("icerik olusturuldu", content);

    const foundContent = await Content.findOne({ title: "Örnek Doküman" });
    console.log("content bulundu", foundContent);
  } catch (error) {
    console.log("content bulunamadi", error);
  } finally {
    await mongoose.connection.close();
    console.log("db baglantisi kesildi ");
  }
}

runContentTest();
