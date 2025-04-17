import deepseekService from "../services/deepseekService";

export async function generateSessionTitle(promt: string): Promise<string> {
  try {
    const response = await deepseekService.streamedChatCompletion(
      `Konu başlığı oluştur: ${promt}`,
      {
        systemMessage: "Sen yardımcı bir asistansın.",
        temperature: 0.7,
      }
    );
    return response.replace(/["']/g, "").replace(/\.$/, "").trim();
  } catch (error) {
    console.error("Error generating session title:", error);
    throw new Error("Başlık oluşturulamadı");
  }
}
