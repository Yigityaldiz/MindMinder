import React, { forwardRef, useState, InputHTMLAttributes } from "react";
import { LuEye, LuEyeOff } from "react-icons/lu";

interface FormInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  id: string;
  label: string;
  type: "text" | "email" | "password";
  errorMessage?: string;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      id,
      label,
      type,
      placeholder,
      errorMessage,
      className,
      required,
      autoFocus = false,
      value, // Dışarıdan gelen value
      onFocus: propOnFocus,
      onBlur: propOnBlur,
      onChange: propOnChange, // Dışarıdan gelen onChange
      ...rest
    },
    ref
  ) => {
    const [focused, setFocused] = useState(autoFocus || false);
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(true);
      if (propOnFocus) propOnFocus(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false);
      if (propOnBlur) propOnBlur(e);
    };

    const currentInputType =
      type === "password" && showPassword ? "text" : type;
    const hasError = !!errorMessage;
    const inputValue = value || ""; // Dışarıdan gelen value'yu doğrudan kullan

    const labelBgClass = "bg-neutral-800";

    return (
      <div className={`mb-5 ${className || ""}`}>
        <div
          className={`relative border rounded-lg transition-all duration-200
          ${
            hasError
              ? "border-error-500 shadow-sm shadow-error-500/20"
              : focused
              ? "border-blue-500 shadow-sm shadow-blue-500/20"
              : "border-neutral-700 hover:border-neutral-500"
          }`}
        >
          <label
            htmlFor={id}
            className={`absolute transition-all duration-200 pointer-events-none
              ${
                focused || inputValue
                  ? `-top-2.5 left-2 text-xs ${labelBgClass} px-1`
                  : "top-[0.8rem] left-3 text-base"
              }
              ${
                hasError
                  ? "text-error-600"
                  : focused
                  ? "text-blue-500"
                  : "text-neutral-400"
              }`}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>

          <input
            ref={ref}
            id={id}
            type={currentInputType}
            placeholder={focused || !inputValue ? placeholder : ""}
            autoFocus={autoFocus}
            value={inputValue}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={propOnChange} // Doğrudan dışarıdan gelen onChange'i kullan
            className="w-full bg-transparent py-3 px-3 text-neutral-100 outline-none appearance-none"
            {...rest}
          />

          {type === "password" && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-300 transition-colors"
              aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
            >
              {showPassword ? <LuEyeOff size={20} /> : <LuEye size={20} />}
            </button>
          )}
        </div>
        {errorMessage && (
          <p className="mt-1 text-xs text-error-600">{errorMessage}</p>
        )}
      </div>
    );
  }
);

export default FormInput;
