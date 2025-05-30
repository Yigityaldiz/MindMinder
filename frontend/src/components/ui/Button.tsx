import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "text";
  fullWidth?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  fullWidth = false,
  type = "button",
  onClick,
  disabled = false,
  size = "md",
}) => {
  const baseClasses =
    "rounded-lg font-medium transition-all duration-200 flex items-center justify-center";

  const sizeClasses = {
    sm: "text-sm py-1.5 px-3",
    md: "py-2.5 px-4",
    lg: "text-lg py-3 px-5",
  };

  const variantClasses = {
    primary:
      "bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-600/30",
    secondary:
      "bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-700",
    text: "text-blue-500 hover:text-blue-400 hover:bg-blue-500/10",
  };

  const disabledClasses = disabled
    ? "opacity-50 cursor-not-allowed"
    : "cursor-pointer";

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabledClasses} ${widthClass}`}
    >
      {children}
    </button>
  );
};

export default Button;
