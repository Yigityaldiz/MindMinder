// src/components/ChatLayout.tsx
import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "../ui/SideBar";
import ChatWindow from "../ui/ChatWindow";
import { Chat } from "../../types/chat.types";
import {
  getAllChats,
  getChatById,
  deleteChat,
} from "../../services/chatService";

const ChatLayout: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null); // Silme işlemi için ayrı bir state

  const fetchChats = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllChats(); // <-- SERVİS KULLANILIYOR
      const formattedChats = data.map((chat: any) => ({
        ...chat,
        id: chat._id || chat.id, // Backend'den _id veya id gelebilir
        title: chat.topic || "Başlıksız Sohbet",
      }));
      setChats(formattedChats);
    } catch (error) {
      console.error("Failed to fetch chats:", error);
      // Burada kullanıcıya bir hata mesajı gösterilebilir (Toast notification vb.)
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const handleSelectChat = async (chat: Chat) => {
    // Zaten aktif olan sohbete tekrar tıklanırsa bir şey yapma
    if (activeChat?.id === chat.id) return;

    setIsLoading(true);
    setActiveChat(null); // Önceki sohbeti temizle, daha akıcı bir geçiş için
    try {
      const fullChatData = await getChatById(chat.id); // <-- SERVİS KULLANILIYOR
      console.log("Fetched chat details:", fullChatData);
      setActiveChat({
        ...fullChatData,
        id: fullChatData.id,
        title: fullChatData.title,
      });
    } catch (error) {
      console.error("Failed to fetch chat details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setActiveChat(null);
  };

  const handleDeleteChat = async (chatId: string) => {
    setIsDeleting(chatId);
    try {
      await deleteChat(chatId); // <-- SERVİS KULLANILIYOR
      if (activeChat?.id === chatId) {
        setActiveChat(null);
      }
      // Silme sonrası listeyi anında güncelle
      setChats((prevChats) => prevChats.filter((c) => c.id !== chatId));
    } catch (error) {
      console.error("Failed to delete chat:", error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleMessageSent = () => {
    fetchChats();
    if (activeChat) {
      // Aktif sohbetin mesajlarını yenilemek için tekrar çağır
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
        {" "}
        {/* min-w-0 flexbox taşmalarını önler */}
        <ChatWindow
          key={activeChat?.id || "new"}
          activeChat={activeChat}
          onMessageSent={handleMessageSent}
        />
      </main>
    </div>
  );
};

export default ChatLayout;
