import { useState, useEffect, useRef } from "react";
import axios from "axios";
import UserLayout from "../../components/user/UserLayout";
import useAuth from "../../context/useAuth";
import { API_BASE, authHeaders } from "../../lib/http";
import { FaPaperPlane, FaSearch, FaArrowLeft } from "react-icons/fa";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { useSearchParams, useNavigate } from "react-router-dom";

const UserMessages = () => {
  const { token, user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const merchantIdFromQuery = searchParams.get('merchantId');
  const merchantNameFromQuery = searchParams.get('merchantName');
  
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const initializedRef = useRef(false);

  // Initialize socket connection
  useEffect(() => {
    socketRef.current = io(API_BASE, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    // Join user's personal room for notifications
    if (user?.userId) {
      socketRef.current.emit('joinUserRoom', user.userId);
    }

    // Listen for new message events
    socketRef.current.on('newMessage', (message) => {
      // Add new message to current chat if open
      if (selectedChat && selectedChat.chatId === message.chatId) {
        setMessages((prev) => [...prev, message]);
      }
      
      // Update chat list and badge count
      setChats((prev) => {
        const existingChatIndex = prev.findIndex(c => c.chatId === message.chatId);
        if (existingChatIndex > -1) {
          const updatedChats = [...prev];
          updatedChats[existingChatIndex] = {
            ...updatedChats[existingChatIndex],
            lastMessage: message,
            unreadCount: message.receiverId._id === user.userId ? (updatedChats[existingChatIndex].unreadCount || 0) + 1 : updatedChats[existingChatIndex].unreadCount
          };
          return [updatedChats[existingChatIndex], ...prev.filter((_, i) => i !== existingChatIndex)];
        }
        return prev;
      });
      
      // Increment badge count if not in current chat
      if (!selectedChat || selectedChat.chatId !== message.chatId) {
        // Badge will be updated via sidebar polling
      }
    });

    // Listen for notification badge updates
    socketRef.current.on('notificationBadge', (data) => {
      console.log('Notification badge update:', data);
      // Reload unread count
      loadUnreadCount();
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [selectedChat, user.userId]);

  // Fetch chats on load
  useEffect(() => {
    fetchChats();
  }, []);

  // Handle merchant chat initiation from query params
  useEffect(() => {
    if (merchantIdFromQuery && !initializedRef.current) {
      initializedRef.current = true;
      
      // Check if we already have a chat with this merchant
      const existingChat = chats.find(chat => chat.otherUser._id === merchantIdFromQuery);
      
      if (existingChat) {
        // Chat exists, select it
        setSelectedChat(existingChat);
      } else {
        // No existing chat, create one
        startNewChat(merchantIdFromQuery);
      }
    }
  }, [merchantIdFromQuery, chats]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Join chat room when chat is selected
  useEffect(() => {
    if (selectedChat && socketRef.current) {
      socketRef.current.emit('joinChat', selectedChat.chatId);
      fetchMessages(selectedChat.chatId);
      
      // Mark messages as read when opening chat
      markMessagesAsRead(selectedChat.chatId);
    }
    
    return () => {
      if (selectedChat && socketRef.current) {
        socketRef.current.emit('leaveChat', selectedChat.chatId);
      }
    };
  }, [selectedChat]);

  const fetchChats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/message/chats`, {
        headers: authHeaders(token)
      });
      
      if (response.data.success) {
        setChats(response.data.chats);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
      toast.error("Failed to load chats");
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await axios.get(`${API_BASE}/message/unread-count`, {
        headers: authHeaders(token)
      });
      
      if (response.data.success) {
        // Badge is managed in sidebar, but we can log it
        console.log('Unread messages:', response.data.count);
      }
    } catch (error) {
      console.error("Error loading unread count:", error);
    }
  };

  const markMessagesAsRead = async (chatId) => {
    try {
      await axios.put(
        `${API_BASE}/message/mark-as-read`,
        { chatId },
        {
          headers: authHeaders(token)
        }
      );
      
      // Update local state to remove unread badge from this chat
      setChats((prev) => 
        prev.map((chat) => 
          chat.chatId === chatId ? { ...chat, unreadCount: 0 } : chat
        )
      );
      
      // Reload unread count
      loadUnreadCount();
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const startNewChat = async (merchantId) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE}/message/find-or-create`, {
        merchantId
      }, {
        headers: authHeaders(token)
      });

      if (response.data.success) {
        const { chatId } = response.data;
        
        // Show success message
        toast.success(`Starting conversation with ${merchantNameFromQuery || 'merchant'}`);
        
        // Create a temporary chat object to select immediately
        const tempChat = {
          chatId,
          otherUser: {
            _id: merchantId,
            name: merchantNameFromQuery || 'Merchant',
            email: '',
            profileImage: null
          },
          lastMessage: null,
          unreadCount: 0
        };
        
        // Select the chat immediately
        setSelectedChat(tempChat);
        
        // Refresh chats in background to get the actual data
        await fetchChats();
      }
    } catch (error) {
      console.error("Error starting chat:", error);
      toast.error(error.response?.data?.message || "Failed to start chat");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/message/messages/${chatId}`, {
        headers: authHeaders(token)
      });
      
      if (response.data.success) {
        console.log('=== FETCHED MESSAGES ===');
        console.log('User ID from context:', user.userId);
        console.log('First message structure:', response.data.messages[0]);
        console.log('Current user check:', response.data.messages[0]?.senderId);
        
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const response = await axios.post(`${API_BASE}/message/send`, {
        receiverId: selectedChat.otherUser._id,
        content: newMessage.trim()
      }, {
        headers: authHeaders(token)
      });

      if (response.data.success) {
        setNewMessage("");
        // Message will be added via socket event
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  };

  const filteredChats = chats.filter(chat => 
    chat.otherUser?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <UserLayout>
      <div className="h-[calc(100vh-80px)] bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="flex h-full">
          {/* Left Sidebar - Chat List */}
          <div className={`${selectedChat ? 'hidden md:block' : 'block'} w-full md:w-80 border-r border-gray-200 flex flex-col`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-3">Messages</h2>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
              {filteredChats.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <p>No chats yet</p>
                  <p className="text-sm mt-2">Start a conversation with a merchant!</p>
                </div>
              ) : (
                filteredChats.map((chat) => (
                  <div
                    key={chat.chatId}
                    onClick={() => setSelectedChat(chat)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition ${
                      selectedChat?.chatId === chat.chatId ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={chat.otherUser?.profileImage || `https://ui-avatars.com/api/?name=${chat.otherUser?.name}&background=random`}
                        alt={chat.otherUser?.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <h3 className="font-semibold text-gray-800 truncate">{chat.otherUser?.name}</h3>
                          {chat.unreadCount > 0 && (
                            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                              {chat.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">{chat.lastMessage?.content}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {chat.lastMessage?.createdAt ? new Date(chat.lastMessage.createdAt).toLocaleString() : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Side - Chat Conversation */}
          <div className={`${!selectedChat ? 'hidden' : 'block'} flex-1 flex flex-col`}>
            {selectedChat ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex items-center gap-3 bg-white shadow-sm">
                  <button
                    onClick={() => setSelectedChat(null)}
                    className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <FaArrowLeft />
                  </button>
                  <img
                    src={selectedChat.otherUser?.profileImage || `https://ui-avatars.com/api/?name=${selectedChat.otherUser?.name}&background=random`}
                    alt={selectedChat.otherUser?.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800">{selectedChat.otherUser?.name}</h3>
                    <p className="text-xs text-gray-500">
                      {selectedChat.otherUser?.email}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
                  {loading ? (
                    <div className="text-center text-gray-500 py-8">Loading messages...</div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <p>No messages yet</p>
                      <p className="text-sm mt-2">Say hello to start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      // Handle both populated and non-populated senderId
                      const senderId = msg.senderId?._id || msg.senderId;
                      const currentUserId = user?.userId;
                      const isCurrentUser = String(senderId) === String(currentUserId);
                      
                      // Debug first 3 messages only
                      if (index < 3) {
                        console.log(`Message ${index}:`, {
                          msgId: msg._id,
                          senderId: senderId,
                          currentUserId: currentUserId,
                          isCurrentUser: isCurrentUser,
                          content: msg.content.substring(0, 30)
                        });
                      }
                      
                      return (
                        <div
                          key={msg._id}
                          className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] px-4 py-2.5 rounded-2xl shadow-md ${
                              isCurrentUser
                                ? 'bg-blue-100 text-gray-800 rounded-br-none border border-blue-200'
                                : 'bg-gray-200 text-gray-800 rounded-bl-none border border-gray-300'
                            }`}
                          >
                            <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                            <p className={`text-xs mt-1 ${
                              isCurrentUser ? 'text-blue-600 font-medium' : 'text-gray-500 font-medium'
                            }`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <FaPaperPlane />
                      <span className="hidden sm:inline">Send</span>
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center text-gray-500">
                  <p className="text-lg">Select a chat to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default UserMessages;
