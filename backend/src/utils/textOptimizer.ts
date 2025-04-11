import { encode, decode } from "gpt-tokenizer";

export function optimazeForTokenLimit(
  text: string,
  tokenLimit: number = 3000
): string {
  const tokens = encode(text);
  if (tokens.length <= tokenLimit) {
    return text;
  }
  const optimizedText = tokens.slice(0, tokenLimit - 100);
  return decode(optimizedText);
}
