import React from "react";

import { LuMessageSquare } from "react-icons/lu";

interface LogoProps {
  size?: "sm" | "md" | "lg";
}

const Logo: React.FC<LogoProps> = ({ size = "md" }) => {
  const sizes = {
    sm: {
      icon: 20,
      text: "text-lg",
    },
    md: {
      icon: 28,
      text: "text-2xl",
    },
    lg: {
      icon: 36,
      text: "text-3xl",
    },
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <LuMessageSquare
          size={sizes[size].icon}
          className="text-blue-500"
          strokeWidth={2}
        />

        <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 rounded-full"></div>
      </div>

      <span
        className={`font-bold ${sizes[size].text} bg-gradient-to-r from-blue-500 to-green-400 bg-clip-text text-transparent`}
      >
        AiChat
      </span>
    </div>
  );
};

export default Logo;
