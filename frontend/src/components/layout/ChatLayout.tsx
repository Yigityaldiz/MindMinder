// src/components/layout/ChatLayout.tsx (NİHAİ VE EN KARARLI VERSİYON)

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import Sidebar from "../ui/SideBar";
import ChatWindow from "../ui/ChatWindow";
import { Chat } from "../../types/chat.types";
import {
  getAllChats,
  getChatById,
  deleteChat,
} from "../../services/chatService";

// YENİ: Backend verisini frontend tipimize çeviren tek bir yardımcı fonksiyon
const formatChatFromBackend = (backendChat: any): Chat => {
  return {
    _id: backendChat._id,
    title: backendChat.topic || "Başlıksız Sohbet",
    updatedAt: backendChat.updatedAt,
    conversation: backendChat.conversation || [],
  };
};

const ChatLayout: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // DÜZELTME: fetchChats artık bu yardımcı fonksiyonu kullanıyor.
  const fetchChats = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllChats();
      const formattedChats = data.map(formatChatFromBackend);
      setChats(formattedChats);
      return formattedChats; // DÜZELTME: Güncel listeyi geri döndür.
    } catch (error) {
      console.error("Failed to fetch chats:", error);
      toast.error("Sohbet listesi yüklenemedi.");
      return []; // Hata durumunda boş dizi döndür.
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // DÜZELTME: handleSelectChat de artık bu yardımcı fonksiyonu kullanıyor.
  const handleSelectChat = async (chat: Chat) => {
    if (activeChat?._id === chat._id && !isLoading) return;

    setIsLoading(true);
    try {
      const responseData = await getChatById(chat._id);
      const formattedChat = formatChatFromBackend(responseData);
      setActiveChat(formattedChat);
    } catch (error) {
      console.error("Failed to fetch chat details:", error);
      toast.error("Sohbet detayları yüklenemedi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setActiveChat(null);
  };

  const handleDeleteChat = async (chatId: string) => {
    await deleteChat(chatId);
    toast.success("Sohbet silindi.");
    if (activeChat?._id === chatId) setActiveChat(null);
    fetchChats();
  };

  // NİHAİ DÜZELTME: handleMessageSent fonksiyonunun en basit ve en kararlı hali.
  const handleMessageSent = async () => {
    const wasNewChat = !activeChat;
    const updatedChats = await fetchChats(); // 1. Kenar çubuğu listesini yenile ve güncel listeyi al.

    if (wasNewChat && updatedChats.length > 0) {
      // 2. Eğer bu yeni bir sohbet idiyse, listenin en başındaki yeni sohbeti seç.
      handleSelectChat(updatedChats[0]);
    } else if (activeChat) {
      // 3. Eğer mevcut bir sohbetse, onun güncel halini tekrar seçerek ana pencereyi yenile.
      handleSelectChat(activeChat);
    }
  };

  return (
    <div className="flex h-screen bg-gray-800 text-white font-sans overflow-hidden">
      <Sidebar
        chats={chats}
        activeChat={activeChat}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
      />
      <main className="flex-1 flex flex-col min-w-0">
        <ChatWindow
          key={activeChat?._id || "new"}
          activeChat={activeChat}
          onMessageSent={handleMessageSent}
        />
      </main>
    </div>
  );
};

export default ChatLayout;
