// src/services/chatService.ts
import apiClient from "../lib/axios";
import { Chat } from "../types/chat.types";

export interface NewMessagePayload {
  message: string;
  optimizedText: string;
}

export interface SendMessageResponse {
  sessionId: string;
  response: string;
  // ... backend'den gelen diğer alanlar
}

export const getAllChats = async (): Promise<Chat[]> => {
  try {
    const response = await apiClient.get<Chat[]>("/chat");
    return response.data;
  } catch (error) {
    console.error("Error fetching all chats:", error);
    throw error;
  }
};

export const getChatById = async (chatId: string): Promise<Chat> => {
  try {
    const response = await apiClient.get<Chat>(`/chat/${chatId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching chat with ID ${chatId}:`, error);
    throw error;
  }
};

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

export const deleteChat = async (
  chatId: string
): Promise<{ message: string }> => {
  try {
    const response = await apiClient.delete<{ message: string }>(
      `/chat/${chatId}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error deleting chat with ID ${chatId}:`, error);
    throw error;
  }
};
