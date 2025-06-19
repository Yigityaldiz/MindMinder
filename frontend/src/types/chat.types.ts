// src/types/chat.ts

// Backend'deki IConversation arayüzüne karşılık gelir.
// Bir sohbet içindeki tek bir soru-cevap döngüsünü temsil eder.
export interface Message {
  _id: string;
  question: string;
  answer: string;
  timestamp: Date;
}

export interface Chat {
  _id: string;
  title: string;
  updatedAt: Date;
  conversation?: Message[];
}
