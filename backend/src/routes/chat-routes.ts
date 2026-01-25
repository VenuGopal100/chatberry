import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
  listConversations,
  createConversation,
  getConversation,
  sendMessageToConversation,
  deleteConversation,
  deleteAllChats,
  uploadFileToConversation
} from "../controllers/chat-controllers.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.get("/conversations", authMiddleware, listConversations);
router.post("/conversation", authMiddleware, createConversation);

router.get("/:conversationId", authMiddleware, getConversation);

// ✅ NEW: upload a file and get extracted text
router.post("/:conversationId/upload", authMiddleware, upload.single("file"), uploadFileToConversation);

router.post("/:conversationId/message", authMiddleware, sendMessageToConversation);

router.delete("/:conversationId", authMiddleware, deleteConversation);
router.delete("/delete-all-chats", authMiddleware, deleteAllChats);

export default router;
