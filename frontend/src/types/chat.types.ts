// src/types/chat.ts

// Backend'deki IConversation arayüzüne karşılık gelir.
// Bir sohbet içindeki tek bir soru-cevap döngüsünü temsil eder.
export interface Message {
  question: string;
  answer: string;
  timestamp: Date;
}

// Backend'deki IChatSession arayüzüne karşılık gelir.
// Sidebar'da ve aktif sohbet başlığında kullanılır.
export interface Chat {
  id: string; // veya _id
  title: string; // veya topic
  updatedAt: Date;
  conversation?: Message[]; // Sohbet detayları yüklendiğinde bu alan dolu olacak
}
