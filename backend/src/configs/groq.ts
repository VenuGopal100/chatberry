import axios, { AxiosInstance } from "axios";

let client: AxiosInstance | null = null;

export function getGroqClient(): AxiosInstance {
  if (client) return client;

  const baseURL = process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1";
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    console.error("❌ GROQ_API_KEY is missing. Check backend/.env and restart server.");
  }

  client = axios.create({
    baseURL,
    timeout: 60000,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    }
  });

  return client;
}
