// src/services/chatService.ts (DÜZELTİLMİŞ HALİ)

import apiClient from "../lib/axios";
import { Chat } from "../types/chat.types";

// Bu arayüzler şimdilik aynı kalıyor.
export interface NewMessagePayload {
  message: string;
  optimizedText: string;
}

export interface SendMessageResponse {
  sessionId: string;
  response: string;
  // ... backend'den gelen diğer alanlar
}

/**
 * DEĞİŞİKLİK 1: Endpoint /chatSession olarak güncellendi.
 * DEĞİŞİKLİK 2: Backend'den gelen yanıt { data: [...] } şeklinde olduğu için response.data.data kullandık.
 */
export const getAllChats = async (): Promise<Chat[]> => {
  try {
    const response = await apiClient.get<{ data: Chat[] }>("/chatSession");
    return response.data.data; // Veri, 'data' anahtarı altında geliyor.
  } catch (error) {
    console.error("Error fetching all chats:", error);
    throw error;
  }
};

/**
 * DEĞİŞİKLİK 1: Endpoint /chatSession/:id olarak güncellendi.
 * DEĞİŞİKLİK 2: Backend'den gelen yanıt { data: {...} } şeklinde olduğu için response.data.data kullandık.
 */
export const getChatById = async (chatId: string): Promise<Chat> => {
  try {
    const response = await apiClient.get<{ data: Chat }>(
      `/chatSession/${chatId}`
    );
    return response.data.data; // Veri, 'data' anahtarı altında geliyor.
  } catch (error) {
    console.error(`Error fetching chat with ID ${chatId}:`, error);
    throw error;
  }
};

/**
 * DEĞİŞİKLİK: Endpoint /chatSession/:id olarak güncellendi.
 */
export const deleteChat = async (
  chatId: string
): Promise<{ message: string }> => {
  try {
    const response = await apiClient.delete<{ message: string }>(
      `/chatSession/${chatId}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error deleting chat with ID ${chatId}:`, error);
    throw error;
  }
};

// --- ŞİMDİLİK DOKUNMUYORUZ ---
// Bu fonksiyonu bir sonraki adımda streaming kullanacak şekilde güncelleyeceğiz.
export const sendMessage = async (
  payload: NewMessagePayload
): Promise<SendMessageResponse> => {
  try {
    const response = await apiClient.post<SendMessageResponse>(
      "/chat",
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};
