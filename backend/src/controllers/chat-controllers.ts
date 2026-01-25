import { Response } from "express";
import mongoose from "mongoose";
import { AuthedRequest } from "../middleware/auth.js";
import { User } from "../models/user-model.js";
import { getGroqClient } from "../configs/groq.js";
import { extractTextFromFile } from "../utils/file-extract.js";

function makeTitleFromMessage(msg: string) {
  const cleaned = msg.trim().replace(/\s+/g, " ");
  return cleaned.length > 40 ? cleaned.slice(0, 40) + "..." : cleaned || "New chat";
}

export async function listConversations(req: AuthedRequest, res: Response) {
  try {
    const user = await User.findById(req.userId).select("conversations");
    if (!user) return res.status(404).json({ message: "User not found" });

    const conversations = user.conversations
      .map((c) => ({
        id: c._id.toString(),
        title: c.title,
        updatedAt: c.updatedAt,
        createdAt: c.createdAt
      }))
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return res.status(200).json({ conversations });
  } catch {
    return res.status(500).json({ message: "Failed to list conversations" });
  }
}

export async function createConversation(req: AuthedRequest, res: Response) {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const convoId = new mongoose.Types.ObjectId();
    user.conversations.unshift({
      _id: convoId,
      title: "New chat",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    } as any);

    await user.save();

    return res.status(201).json({
      conversation: {
        id: convoId.toString(),
        title: "New chat",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  } catch {
    return res.status(500).json({ message: "Failed to create conversation" });
  }
}

export async function getConversation(req: AuthedRequest, res: Response) {
  try {
    const { conversationId } = req.params;

    const user = await User.findById(req.userId).select("conversations");
    if (!user) return res.status(404).json({ message: "User not found" });

    const convo = user.conversations.find((c) => c._id.toString() === conversationId);
    if (!convo) return res.status(404).json({ message: "Conversation not found" });

    return res.status(200).json({
      conversation: {
        id: convo._id.toString(),
        title: convo.title,
        messages: convo.messages
      }
    });
  } catch {
    return res.status(500).json({ message: "Failed to fetch conversation" });
  }
}

/**
 * NEW: upload file, extract text, return fileText to frontend
 * req.file comes from multer
 */
export async function uploadFileToConversation(req: AuthedRequest, res: Response) {
  try {
    const { conversationId } = req.params;

    const user = await User.findById(req.userId).select("conversations");
    if (!user) return res.status(404).json({ message: "User not found" });

    const convo = user.conversations.find((c) => c._id.toString() === conversationId);
    if (!convo) return res.status(404).json({ message: "Conversation not found" });

    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file) return res.status(400).json({ message: "No file uploaded" });

    const text = await extractTextFromFile(file);

    // return extracted text (frontend decides how to use it)
    return res.status(200).json({
      fileName: file.originalname,
      fileText: text
    });
  } catch (err: any) {
    return res.status(400).json({ message: err?.message || "Failed to process file" });
  }
}

export async function sendMessageToConversation(req: AuthedRequest, res: Response) {
  try {
    const { conversationId } = req.params;
    const { message, fileText } = req.body as { message: string; fileText?: string };

    if (!message || !message.trim()) return res.status(400).json({ message: "Message is required" });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const convo = user.conversations.find((c) => c._id.toString() === conversationId);
    if (!convo) return res.status(404).json({ message: "Conversation not found" });

    if (convo.messages.length === 0) {
      convo.title = makeTitleFromMessage(message);
    }

    // If fileText is provided, prepend it as context into user's message (safe + simple)
    const combinedUserContent = fileText?.trim()
      ? `Use the following document content as context:\n\n---\n${fileText.trim().slice(0, 12000)}\n---\n\nUser question: ${message.trim()}`
      : message.trim();

    convo.messages.push({ role: "user", content: combinedUserContent, createdAt: new Date() });

    const systemPrompt = "You are a helpful assistant.";
    const groqMessages = [
      { role: "system", content: systemPrompt },
      ...convo.messages.map((m) => ({ role: m.role, content: m.content }))
    ];

    const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
    const groqClient = getGroqClient();

    const response = await groqClient.post("/chat/completions", {
      model,
      messages: groqMessages,
      temperature: 0.7
    });

    const assistantText: string =
      response.data?.choices?.[0]?.message?.content?.trim() || "Sorry, I couldn't generate a response.";

    convo.messages.push({ role: "assistant", content: assistantText, createdAt: new Date() });
    convo.updatedAt = new Date();

    await user.save();

    return res.status(200).json({
      conversation: { id: convo._id.toString(), title: convo.title, messages: convo.messages }
    });
  } catch (err: any) {
    const msg = err?.response?.data?.error?.message || err?.response?.data?.message || "Groq request failed";
    return res.status(500).json({ message: msg });
  }
}

export async function deleteConversation(req: AuthedRequest, res: Response) {
  try {
    const { conversationId } = req.params;

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.conversations = user.conversations.filter((c) => c._id.toString() !== conversationId);
    await user.save();

    return res.status(200).json({ message: "Deleted" });
  } catch {
    return res.status(500).json({ message: "Failed to delete conversation" });
  }
}

export async function deleteAllChats(req: AuthedRequest, res: Response) {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.conversations = [];
    await user.save();

    return res.status(200).json({ conversations: [] });
  } catch {
    return res.status(500).json({ message: "Failed to delete all chats" });
  }
}
