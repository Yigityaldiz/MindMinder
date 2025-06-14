// src/components/MessageInput.tsx
import React, { useState } from "react";
import { LuSend } from "react-icons/lu";

interface MessageInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSend, disabled }) => {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !disabled) {
      onSend(text);
      setText("");
    }
  };

  return (
    <div className="p-4 bg-gray-900 border-t border-gray-700">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder="Mesajınızı buraya yazın..."
          className="flex-1 bg-gray-700 rounded-lg p-3 resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
          rows={1}
          disabled={disabled}
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
          disabled={disabled}
        >
          <LuSend size={20} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
