// src/components/ui/ChatWindow.tsx (KARMAŞIK MESAJ SORUNU ÇÖZÜLDÜ)

import React, { useState, useEffect, useRef } from "react";
import { Chat } from "../../types/chat.types";
import MessageInput from "./MessageInput";
import { LuBot, LuUser, LuLoader as LuLoader } from "react-icons/lu";
import useAuthStore from "../../store/authStore";

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
    const botMessagePlaceholder: DisplayMessage = { type: "bot", text: "" };
    setMessages((prev) => [...prev, userMessage, botMessagePlaceholder]);

    try {
      const token = useAuthStore.getState().token;
      const response = await fetch("http://localhost:3000/api/chatStream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: text }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error(`API hatası: ${response.statusText}`);

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Stream reader alınamadı.");

      const decoder = new TextDecoder();
      let buffer = ""; // <--- Gelen parçaları biriktireceğimiz TAMPON

      while (true) {
        const { done, value } = await reader.read();
        buffer += decoder.decode(value, { stream: true });
        if (done) break;

        // Gelen yeni parçayı tampona ekle

        // Tamponda tam bir mesaj var mı diye kontrol et (`\n\n` ile biter)
        while (buffer.includes("\n\n")) {
          const messageEndIndex = buffer.indexOf("\n\n");
          // Tam mesajı tampondan al
          const message = buffer.substring(0, messageEndIndex);
          // Tampondan işlediğimiz mesajı çıkar
          buffer = buffer.substring(messageEndIndex + 2);

          if (message.startsWith("data: ")) {
            const jsonStr = message.replace(/^data: /, "");
            if (jsonStr === "[DONE]") continue;

            try {
              const parsed = JSON.parse(jsonStr);
              if (parsed.content) {
                // ============ ANA DEĞİŞİKLİK BURADA ============
                // State'i doğrudan değiştirmek yerine, her seferinde yepyeni bir
                // dizi ve obje oluşturarak React'e en doğru şekilde güncelliyoruz.
                setMessages((prev) => {
                  // Son mesaj dışındaki tüm mesajları al
                  const allButLast = prev.slice(0, -1);
                  // Son mesajı al
                  const lastMessage = prev[prev.length - 1];

                  // Son mesajın güncellenmiş yeni bir kopyasını oluştur
                  const updatedLastMessage = {
                    ...lastMessage,
                    text: lastMessage.text + parsed.content,
                  };

                  // Yepyeni bir dizi olarak state'i geri döndür
                  return [...allButLast, updatedLastMessage];
                });
                // ===============================================
              }
            } catch (e) {
              console.error("Stream verisi ayrıştırılamadı:", jsonStr);
            }
          }
        }
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Stream hatası:", error);
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg && lastMsg.type === "bot") {
            lastMsg.text = "Bir hata oluştu. Lütfen tekrar deneyin.";
          }
          return newMessages;
        });
      }
    } finally {
      setIsResponding(false);
      abortControllerRef.current = null;
      onMessageSent();
    }
  };

  // ... JSX render kısmı aynı kalıyor ...
  return (
    <div className="flex-1 flex flex-col bg-gray-800 h-full overflow-hidden">
      <div className="flex-1 p-6 overflow-y-auto">
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
                className={`max-w-xl p-4 rounded-2xl ${
                  msg.type === "user"
                    ? "bg-blue-600 text-white rounded-br-lg"
                    : "bg-gray-700 text-gray-200 rounded-bl-lg"
                }`}
              >
                {msg.isLoading ? (
                  <LuLoader className="animate-spin" size={20} />
                ) : (
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {msg.text}
                  </p>
                )}
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
      </div>
      <MessageInput onSend={handleSendMessage} disabled={isResponding} />
    </div>
  );
};

export default ChatWindow;
