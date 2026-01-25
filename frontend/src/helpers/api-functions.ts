import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
axios.defaults.withCredentials = true;

export type User = { id: string; name: string; email: string };

export type ChatRole = "user" | "assistant";
export type ChatItem = { role: ChatRole; content: string; createdAt: string };

export type ConversationSummary = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export type Conversation = {
  id: string;
  title: string;
  messages: ChatItem[];
};

export async function userSignup(data: { name: string; email: string; password: string }) {
  const res = await axios.post("/user/signup", data);
  return res.data as { user: User };
}

export async function userLogin(data: { email: string; password: string }) {
  const res = await axios.post("/user/login", data);
  return res.data as { user: User };
}

export async function logoutUser() {
  const res = await axios.post("/user/logout");
  return res.data as { message: string };
}

export async function getAuthStatus() {
  const res = await axios.get("/user/auth-status");
  return res.data as { user: User };
}

export async function listConversations() {
  const res = await axios.get("/chat/conversations");
  return res.data as { conversations: ConversationSummary[] };
}

export async function createConversation() {
  const res = await axios.post("/chat/conversation");
  return res.data as { conversation: ConversationSummary };
}

export async function getConversation(conversationId: string) {
  const res = await axios.get(`/chat/${conversationId}`);
  return res.data as { conversation: Conversation };
}

export async function sendMessage(conversationId: string, message: string, fileText?: string) {
  const res = await axios.post(`/chat/${conversationId}/message`, { message, fileText });
  return res.data as { conversation: Conversation };
}

export async function uploadConversationFile(conversationId: string, file: File) {
  const form = new FormData();
  form.append("file", file);

  const res = await axios.post(`/chat/${conversationId}/upload`, form, {
    headers: { "Content-Type": "multipart/form-data" }
  });

  return res.data as { fileName: string; fileText: string };
}

export async function deleteConversation(conversationId: string) {
  const res = await axios.delete(`/chat/${conversationId}`);
  return res.data as { message: string };
}

export async function deleteAllChats() {
  const res = await axios.delete("/chat/delete-all-chats");
  return res.data as { conversations: ConversationSummary[] };
}
