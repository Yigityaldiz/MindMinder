// src/components/Sidebar.tsx

import React from "react";
import { LuPlus, LuMessageSquare, LuTrash2 } from "react-icons/lu";
import { Chat } from "../../types/chat.types"; // types/chat.ts dosyasından Chat arayüzünü içe aktar

interface SidebarProps {
  chats: Chat[];
  activeChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  chats,
  activeChat,
  onSelectChat,
  onNewChat,
  onDeleteChat,
}) => {
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Bugün";
    if (days === 1) return "Dün";
    if (days < 7) return `${days} gün önce`;

    return date.toLocaleDateString("tr-TR");
  };

  return (
    <div className="w-80 bg-gray-900 border-r border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
        >
          <LuPlus size={20} />
          <span className="font-medium">Yeni Sohbet</span>
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {chats.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <LuMessageSquare size={48} className="mx-auto mb-4 opacity-50" />
              <p>Henüz sohbet yok.</p>
              <p className="text-sm mt-1">Yeni bir sohbet başlatın.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`group relative flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    activeChat?.id === chat.id
                      ? "bg-gray-700"
                      : "hover:bg-gray-800"
                  }`}
                  onClick={() => onSelectChat(chat)}
                >
                  <LuMessageSquare
                    size={16}
                    className="text-gray-400 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-100 text-sm font-medium truncate">
                      {chat.title}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      {formatDate(chat.updatedAt)}
                    </p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Düzenle butonuna basınca sohbetin seçilmesini engelle
                        // Düzenleme fonksiyonu eklenebilir
                      }}
                      className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-600 rounded"
                    >
                      <LuTrash2 size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Silme butonuna basınca sohbetin seçilmesini engelle
                        if (
                          window.confirm(
                            "Bu sohbeti silmek istediğinizden emin misiniz?"
                          )
                        ) {
                          onDeleteChat(chat.id);
                        }
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-600 rounded"
                    >
                      <LuTrash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer (İsteğe bağlı, kullanıcı bilgisi eklenebilir) */}
      <div className="p-4 border-t border-gray-700">
        {/* Kullanıcı profili alanı buraya gelebilir */}
      </div>
    </div>
  );
};

export default Sidebar;
