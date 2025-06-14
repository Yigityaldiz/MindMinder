// src/ui/ChatWindow.tsx
import React, { useState, useEffect, useRef } from "react";
import { Chat } from "../../types/chat.types";
import MessageInput from "./MessageInput";
import { LuBot, LuUser, LuLoader } from "react-icons/lu";
import { sendMessage, NewMessagePayload } from "../../services/chatService"; // Servisi import et

interface DisplayMessage {
  type: "user" | "bot";
  text: string;
  isLoading?: boolean;
}

interface ChatWindowProps {
  activeChat: Chat | null;
  onMessageSent: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  activeChat,
  onMessageSent,
}) => {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeChat?.conversation) {
      const formattedMessages: DisplayMessage[] =
        activeChat.conversation.flatMap((conv) => [
          { type: "user", text: conv.question },
          { type: "bot", text: conv.answer },
        ]);
      setMessages(formattedMessages);
    } else {
      setMessages([]);
    }
  }, [activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    setIsLoading(true);

    const userMessage: DisplayMessage = { type: "user", text };
    const botPlaceholder: DisplayMessage = {
      type: "bot",
      text: "",
      isLoading: true,
    };
    setMessages((prev) => [...prev, userMessage, botPlaceholder]);

    try {
      const payload: NewMessagePayload = { message: text, optimizedText: text };
      const data = await sendMessage(payload); // <-- SERVİS FONKSİYONU KULLANILIYOR

      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          type: "bot",
          text: data.response,
          isLoading: false,
        };
        return newMessages;
      });
    } catch (error) {
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          type: "bot",
          text: "Hata oluştu, lütfen tekrar deneyin.",
          isLoading: false,
        };
        return newMessages;
      });
    } finally {
      setIsLoading(false);
      onMessageSent();
    }
  };

  const renderMessageContent = (msg: DisplayMessage) => {
    if (msg.isLoading) return <LuLoader className="animate-spin" size={20} />;
    return <p className="whitespace-pre-wrap">{msg.text}</p>;
  };
  // ... (Geri kalan JSX kodu aynı) ...
  return (
    <div className="flex-1 flex flex-col bg-gray-800">
      <div className="flex-1 p-6 overflow-y-auto">
        {/* JSX içeriği öncekiyle aynı */}
      </div>
      <MessageInput onSend={handleSendMessage} disabled={isLoading} />
    </div>
  );
};

export default ChatWindow;
