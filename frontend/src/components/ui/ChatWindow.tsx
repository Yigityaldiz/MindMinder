// src/components/ui/ChatWindow.tsx (NİHAİ VE TAMAMEN DOĞRU VERSİYON)

import React, { useState, useEffect, useRef } from "react";
import { Chat } from "../../types/chat.types";
import MessageInput from "./MessageInput";
import { LuBot, LuUser, LuMessageSquare } from "react-icons/lu";
import useAuthStore from "../../store/authStore";
import { toast } from "react-toastify";

interface ChatWindowProps {
  activeChat: Chat | null;
  onMessageSent: () => void;
}

interface DisplayMessage {
  type: "user" | "bot";
  text: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  activeChat,
  onMessageSent,
}) => {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [isResponding, setIsResponding] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortControllerRef.current?.abort();
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
    if (!text.trim() || isResponding) return;

    setIsResponding(true);
    abortControllerRef.current = new AbortController();

    const userMessage: DisplayMessage = { type: "user", text };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const token = useAuthStore.getState().token;
      // .env dosyasından doğru API adresini alıyoruz

      // Backend'e hem mesajı hem de sohbet ID'sini içeren doğru body'i hazırlıyoruz
      const body = {
        message: text,
        chatId: activeChat?._id || null,
      };

      const response = await fetch(`http://localhost:3000/api/chatStream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: "Sunucuya ulaşılamıyor veya CORS hatası.",
        }));
        throw new Error(
          errorData.message || `API hatası: ${response.statusText}`
        );
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Stream reader alınamadı.");

      setMessages((prev) => [...prev, { type: "bot", text: "" }]);

      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        while (buffer.includes("\n\n")) {
          const messageEndIndex = buffer.indexOf("\n\n");
          const message = buffer.substring(0, messageEndIndex);
          buffer = buffer.substring(messageEndIndex + 2);

          if (message.startsWith("data: ")) {
            const jsonStr = message.replace(/^data: /, "");
            if (jsonStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(jsonStr);
              if (parsed.content) {
                setMessages((prev) => {
                  const allButLast = prev.slice(0, -1);
                  const lastMessage = prev[prev.length - 1];
                  const updatedLastMessage = {
                    ...lastMessage,
                    text: lastMessage.text + parsed.content,
                  };
                  return [...allButLast, updatedLastMessage];
                });
              }
            } catch (e) {
              console.error("Stream verisi ayrıştırılamadı:", jsonStr);
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Stream hatası:", error);
        toast.error(error.message || "Bilinmeyen bir hata oluştu.");
        // Başarısız olan kullanıcı mesajını ve bot placeholder'ını kaldır
        setMessages((prev) => prev.slice(0, -1));
      }
    } finally {
      setIsResponding(false);
      abortControllerRef.current = null;
      onMessageSent();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-800 h-full overflow-hidden">
      <div className="flex-1 p-6 overflow-y-auto">
        {messages.length > 0 ? (
          <div className="space-y-6">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-start gap-4 ${
                  msg.type === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.type === "bot" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                    <LuBot className="text-gray-300" />
                  </div>
                )}
                <div
                  className={`max-w-xl p-4 rounded-2xl shadow-md ${
                    msg.type === "user"
                      ? "bg-blue-600 text-white rounded-br-lg"
                      : "bg-gray-700 text-gray-200 rounded-bl-lg"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {msg.text}
                  </p>
                </div>
                {msg.type === "user" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <LuUser className="text-white" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <LuMessageSquare size={48} className="mb-4" />
            <h2 className="text-xl font-medium text-gray-300">
              Sohbet Asistanı
            </h2>
            <p className="mt-2">Nasıl yardımcı olabilirim?</p>
          </div>
        )}
      </div>
      <MessageInput onSend={handleSendMessage} disabled={isResponding} />
    </div>
  );
};

export default ChatWindow;
