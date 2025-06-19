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
    // DÜZELTME: Backend /api/chatSession'dan { data: [...] } şeklinde dönüyor.
    const response = await apiClient.get<{ data: any[] }>("/chatSession");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching all chats:", error);
    throw error;
  }
};

export const getChatById = async (chatId: string): Promise<any> => {
  try {
    // DÜZELTME: Backend /api/chatSession/:id'den { data: {...} } şeklinde dönüyor.
    const response = await apiClient.get<{ data: any }>(
      `/chatSession/${chatId}`
    );
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching chat with ID ${chatId}:`, error);
    throw error;
  }
};

export const deleteChat = async (
  chatId: string
): Promise<{ message: string }> => {
  try {
    // DÜZELTME: Endpoint'in /chatSession olduğundan emin olalım.
    const response = await apiClient.delete<{ message: string }>(
      `/chatSession/${chatId}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error deleting chat with ID ${chatId}:`, error);
    throw error;
  }
};
