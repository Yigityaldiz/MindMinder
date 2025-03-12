// src/index.ts
import { serve } from "bun";
import { connectDB } from "./services/db"; // MongoDB bağlantısı için

// MongoDB'ye bağlan
connectDB();

serve({
  port: 3000,
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/api/hello") {
      return new Response(JSON.stringify({ message: "Hello from API!" }), {
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response("Merhaba, dünya!");
  },
});

console.log("Sunucu 3000 portunda çalışıyor...");
