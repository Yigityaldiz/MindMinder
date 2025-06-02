// src/components/ui/FormInput.tsx
import React, { useState, InputHTMLAttributes } from "react";
import { LuEye, LuEyeOff } from "react-icons/lu"; // veya react-icons'dan eşdeğer ikonlar

// InputHTMLAttributes, <input> elementinin alabileceği tüm standart propları içerir.
// 'type' prop'unu kendi özel tiplerimizle değiştirmek için Omit kullandık.
interface FormInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  id: string; // Label için htmlFor ile eşleşmeli
  label: string;
  type: "text" | "email" | "password"; // Kendi kısıtlı tiplerimiz
  errorMessage?: string; // react-hook-form'dan gelen hata mesajı
  // required prop'u InputHTMLAttributes içinde zaten var, etiketteki * için kullanılabilir.
}

const FormInput: React.FC<FormInputProps> = ({
  id,
  label,
  type,
  placeholder,
  errorMessage,
  className, // Dışarıdan ek class'lar alabilmek için
  required, // Etikette * göstermek için
  autoFocus = false,
  value: propValue, // react-hook-form'dan gelen value
  onFocus: propOnFocus,
  onBlur: propOnBlur,
  ...rest // name, onChange, ref gibi react-hook-form'dan gelen diğer proplar
}) => {
  const [focused, setFocused] = useState(autoFocus || false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(true);
    if (propOnFocus) {
      propOnFocus(e); // react-hook-form'un onFocus'unu çağır
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(false);
    if (propOnBlur) {
      propOnBlur(e); // react-hook-form'un onBlur'unu çağır
    }
  };

  const currentInputType = type === "password" && showPassword ? "text" : type;
  const hasError = !!errorMessage;
  const inputValue = propValue || rest.defaultValue || ""; // react-hook-form'dan gelen değeri kullan

  // Renkler için Tailwind config'inizdeki tanımlamaları kullanın.
  // Örnek: 'border-neutral-700', 'text-neutral-400', 'focus:border-primary-500'
  // Şimdilik mevcut renklerinize yakın genel isimler kullanıyorum, bunları kendi paletinize göre güncelleyin.
  // Eğer `tailwind.config.js`'de `neutral` gibi bir renk paletiniz yoksa,
  // Tailwind'in varsayılan `gray` tonlarını veya kendi `blue`, `green` vb. renklerinizi kullanabilirsiniz.
  // Etiketin `bg-input-background` sınıfı, input'un bulunduğu container'ın arka plan rengiyle eşleşmelidir.
  // Bu örnekte koyu bir tema varsayıyorum.
  const labelBgClass = "bg-neutral-900"; // VEYA 'bg-white dark:bg-neutral-900' (Sayfanızın arka planına göre ayarlayın)

  return (
    <div className={`mb-5 ${className || ""}`}>
      <div
        className={`relative border rounded-lg transition-all duration-200
          ${
            hasError
              ? "border-error-500 shadow-sm shadow-error-500/20" // Hata durumu için renk (error-500 sizin paletinizde var)
              : focused
              ? "border-blue-500 shadow-sm shadow-blue-500/20" // Odaklanma durumu için renk (blue-500 sizin paletinizde var)
              : "border-neutral-700 hover:border-neutral-500" // Varsayılan ve hover durumu (neutral-X kendi paletinize göre)
          }`}
      >
        <label
          htmlFor={id}
          className={`absolute transition-all duration-200 pointer-events-none
            ${
              focused || inputValue
                ? `-top-2.5 left-2 text-xs ${labelBgClass} px-1` // Dinamik arka plan
                : "top-[0.8rem] left-3 text-base" // text-base veya input ile aynı hizada olması için py-3'e göre ayarlanmalı
            }
            ${
              hasError
                ? "text-error-600" // Hata durumu etiket rengi
                : focused
                ? "text-blue-500" // Odaklanma etiket rengi
                : "text-neutral-400" // Varsayılan etiket rengi (neutral-X kendi paletinize göre)
            }`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>

        <input
          id={id}
          type={currentInputType}
          // placeholder'ı sadece odaklanıldığında göstermek yerine her zaman gösterip,
          // etiketin üzerine çıkmamasını sağlamak daha yaygın bir pratiktir.
          // Şimdilik sizin mantığınızla devam ediyorum:
          placeholder={focused || !inputValue ? placeholder : ""}
          autoFocus={autoFocus}
          value={inputValue} // react-hook-form'dan gelen değer
          onFocus={handleFocus}
          onBlur={handleBlur}
          // className içindeki text-neutral-100 gibi renkleri kendi paletinize göre ayarlayın.
          className="w-full bg-transparent py-3 px-3 text-neutral-100 outline-none appearance-none"
          {...rest} // react-hook-form'dan name, onChange, ref vb. buraya gelir
        />

        {type === "password" && ( // Sadece şifre inputu ve içinde değer varsa göster
          <button
            type="button"
            onClick={togglePasswordVisibility}
            // text-neutral-400 hover:text-neutral-300 renklerini paletinize göre ayarlayın
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-300 transition-colors"
            aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
          >
            {showPassword ? <LuEyeOff size={20} /> : <LuEye size={20} />}
          </button>
        )}
      </div>
      {errorMessage && (
        <p className="mt-1 text-xs text-error-600">{errorMessage}</p> // Hata mesajı için renk (error-600 paletinizde var)
      )}
    </div>
  );
};

export default FormInput;
