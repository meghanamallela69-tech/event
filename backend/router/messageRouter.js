import express from "express";
import { 
  findOrCreateChat,
  getUnreadCount,
  getChats, 
  getMessages, 
  sendMessage, 
  markAsRead, 
  deleteMessage 
} from "../controller/messageController.js";
import { auth } from "../middleware/authMiddleware.js";

const messageRouter = express.Router();

// All routes require authentication
messageRouter.use(auth);

// Find or create chat (must be before /chats to avoid route conflict)
messageRouter.post("/find-or-create", findOrCreateChat);

// Get unread message count
messageRouter.get("/unread-count", getUnreadCount);

// Get all chats for user
messageRouter.get("/chats", getChats);

// Get messages for specific chat
messageRouter.get("/messages/:chatId", getMessages);

// Send a message
messageRouter.post("/send", sendMessage);

// Mark messages as read
messageRouter.put("/mark-as-read", markAsRead);

// Delete a message (soft delete)
messageRouter.delete("/:messageId", deleteMessage);

export default messageRouter;
