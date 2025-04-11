import xss from "xss";

// HTML Entity Decode için yerel çözüm
function decodeHTMLEntities(text: string): string {
  const entityMap: { [key: string]: string } = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&#x2F;": "/",
  };

  return text.replace(
    /&(amp|lt|gt|quot|#39|#x2F);/g,
    (match) => entityMap[match] || match
  );
}

export function sanitizeText(rawText: string): string {
  // 1. XSS Temizliği
  const sanitized = xss(rawText, {
    whiteList: {},
    stripIgnoreTag: true,
    stripIgnoreTagBody: ["script"],
  });

  // 2. HTML Entity Decode (he kütüphanesi olmadan)
  const decoded = decodeHTMLEntities(sanitized);

  // 3. Fazla boşlukları temizle
  return decoded
    .replace(/\s+/g, " ")
    .replace(/[\u200B-\u200D\uFEFF]/g, "") // Görünmez karakterleri temizle
    .trim();
}
