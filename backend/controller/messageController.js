import { Message } from "../models/messageSchema.js";
import mongoose from "mongoose";

// Find or create chat between two users
export const findOrCreateChat = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { merchantId } = req.body;
    
    console.log(`=== FIND OR CREATE CHAT ===`);
    console.log(`User ID: ${userId}`);
    console.log(`Merchant ID: ${merchantId}`);
    
    if (!merchantId) {
      return res.status(400).json({
        success: false,
        message: "Merchant ID is required"
      });
    }
    
    // Validate that merchant exists (optional, you can remove this check)
    const User = mongoose.model('User');
    const merchant = await User.findById(merchantId);
    
    if (!merchant) {
      return res.status(404).json({
        success: false,
        message: "Merchant not found"
      });
    }
    
    // Create chatId (sorted combination of both user IDs for consistency)
    const chatId = [userId, merchantId].sort().join('_');
    
    console.log(`Chat ID: ${chatId}`);
    
    // Check if chat already exists by looking for any messages with this chatId
    const existingMessage = await Message.findOne({ chatId }).sort({ createdAt: 1 });
    
    if (existingMessage) {
      console.log(`Existing chat found: ${chatId}`);
      return res.status(200).json({
        success: true,
        chatId,
        exists: true,
        message: "Chat retrieved successfully"
      });
    }
    
    console.log(`New chat created: ${chatId}`);
    return res.status(201).json({
      success: true,
      chatId,
      exists: false,
      message: "Chat created successfully"
    });
    
  } catch (error) {
    console.error("Find or create chat error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to find or create chat",
      error: error.message
    });
  }
};

// Get unread message count for user
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    console.log(`=== GET UNREAD COUNT ===`);
    console.log(`User ID: ${userId}`);
    
    // Count unread messages where user is receiver
    const unreadCount = await Message.countDocuments({
      receiverId: new mongoose.Types.ObjectId(userId),
      read: false
    });
    
    console.log(`Unread count: ${unreadCount}`);
    
    return res.status(200).json({
      success: true,
      count: unreadCount
    });
    
  } catch (error) {
    console.error("Get unread count error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get unread count",
      error: error.message
    });
  }
};

// Get all chats for a user (user or merchant)
export const getChats = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    console.log(`=== GET CHATS ===`);
    console.log(`User ID: ${userId}`);
    
    // Find all unique chatIds where user is involved
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: new mongoose.Types.ObjectId(userId) },
            { receiverId: new mongoose.Types.ObjectId(userId) }
          ],
          deletedBy: { $ne: new mongoose.Types.ObjectId(userId) }
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: "$chatId",
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ["$receiverId", new mongoose.Types.ObjectId(userId)] },
                  { $eq: ["$read", false] }
                ]},
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "lastMessage.senderId",
          foreignField: "_id",
          as: "sender"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "lastMessage.receiverId",
          foreignField: "_id",
          as: "receiver"
        }
      },
      {
        $addFields: {
          otherUser: {
            $cond: [
              { $eq: ["$lastMessage.senderId", new mongoose.Types.ObjectId(userId)] },
              { $arrayElemAt: ["$receiver", 0] },
              { $arrayElemAt: ["$sender", 0] }
            ]
          }
        }
      },
      {
        $project: {
          chatId: "$_id",
          otherUser: {
            _id: 1,
            name: 1,
            email: 1,
            profileImage: 1
          },
          lastMessage: {
            _id: 1,
            content: 1,
            createdAt: 1,
            senderId: 1
          },
          unreadCount: 1
        }
      },
      {
        $sort: { "lastMessage.createdAt": -1 }
      }
    ]);
    
    return res.status(200).json({
      success: true,
      chats: messages,
      count: messages.length
    });
    
  } catch (error) {
    console.error("Get chats error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch chats",
      error: error.message
    });
  }
};

// Get messages for a specific chat
export const getMessages = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { chatId } = req.params;
    
    console.log(`=== GET MESSAGES ===`);
    console.log(`Chat ID: ${chatId}`);
    console.log(`User ID: ${userId}`);
    
    // Mark messages as read
    await Message.updateMany(
      {
        chatId,
        receiverId: new mongoose.Types.ObjectId(userId),
        read: false
      },
      { $set: { read: true } }
    );
    
    // Get messages
    const messages = await Message.find({
      chatId,
      deletedBy: { $ne: new mongoose.Types.ObjectId(userId) }
    })
    .sort({ createdAt: 1 })
    .populate('senderId', 'name email profileImage')
    .populate('receiverId', 'name email profileImage');
    
    return res.status(200).json({
      success: true,
      messages,
      count: messages.length
    });
    
  } catch (error) {
    console.error("Get messages error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: error.message
    });
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.userId;
    const { receiverId, content } = req.body;
    
    console.log(`=== SEND MESSAGE ===`);
    console.log(`Sender ID: ${senderId}`);
    console.log(`Receiver ID: ${receiverId}`);
    console.log(`Content: ${content?.substring(0, 50)}...`);
    
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message content is required"
      });
    }
    
    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID is required"
      });
    }
    
    // Create chatId (sorted combination of both user IDs)
    const chatId = [senderId, receiverId].sort().join('_');
    
    // Create message
    const message = await Message.create({
      senderId,
      receiverId,
      content: content.trim(),
      chatId,
      read: false
    });
    
    // Populate sender info
    await message.populate('senderId', 'name email profileImage');
    
    console.log(`Message created: ${message._id}`);
    
    // Emit socket event for new message
    if (req.io) {
      // Send to specific chat room
      req.io.to(chatId).emit('newMessage', {
        _id: message._id,
        senderId: message.senderId,
        receiverId: message.receiverId,
        content: message.content,
        chatId: message.chatId,
        createdAt: message.createdAt,
        read: false,
        sender: message.senderId
      });
      
      // Emit notification badge update to receiver
      req.io.to(`user_${receiverId}`).emit('notificationBadge', {
        type: 'message',
        count: 1,
        from: senderId
      });
    }
    
    return res.status(201).json({
      success: true,
      message,
      chatId
    });
    
  } catch (error) {
    console.error("Send message error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message
    });
  }
};

// Mark messages as read
export const markAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { chatId } = req.body;
    
    console.log(`=== MARK AS READ ===`);
    console.log(`Chat ID: ${chatId}`);
    
    const result = await Message.updateMany(
      {
        chatId,
        receiverId: new mongoose.Types.ObjectId(userId),
        read: false
      },
      { $set: { read: true } }
    );
    
    // Emit socket event to update badge in real-time
    if (req.io) {
      req.io.to(`user_${userId}`).emit('badgeUpdate', {
        type: 'message',
        count: -result.modifiedCount // Negative to decrement
      });
    }
    
    return res.status(200).json({
      success: true,
      message: "Messages marked as read",
      modifiedCount: result.modifiedCount
    });
    
  } catch (error) {
    console.error("Mark as read error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to mark messages as read",
      error: error.message
    });
  }
};

// Delete a message (soft delete)
export const deleteMessage = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { messageId } = req.params;
    
    console.log(`=== DELETE MESSAGE ===`);
    console.log(`Message ID: ${messageId}`);
    
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found"
      });
    }
    
    // Check if user is sender or receiver
    if (message.senderId.toString() !== userId && message.receiverId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to delete this message"
      });
    }
    
    // Add user to deletedBy array
    if (!message.deletedBy.includes(userId)) {
      message.deletedBy.push(userId);
      await message.save();
    }
    
    return res.status(200).json({
      success: true,
      message: "Message deleted successfully"
    });
    
  } catch (error) {
    console.error("Delete message error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete message",
      error: error.message
    });
  }
};
