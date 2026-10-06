import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { getSocket, disconnectSocket, reconnectSocket } from '../services/socket';
import { authService } from '../services/api';
import type { User } from '../types';

interface Message {
  id: string;
  sender: string;
  receiver: string;
  content: string;
  read: boolean;
  createdAt: string;
}

interface Conversation {
  userId: string;
  username: string;
  email: string;
  lastMessage?: {
    id: string;
    content: string;
    sender: string;
    createdAt: string;
  };
  unreadCount: number;
}

interface ChatContextType {
  onlineUsers: string[];
  conversations: Conversation[];
  allUsers: User[];
  messages: Record<string, Message[]>;
  unreadCounts: Record<string, number>;
  totalUnreadCount: number;
  isConnected: boolean;
  loadAllUsers: () => Promise<void>;
  loadConversations: () => Promise<void>;
  loadMessages: (userId: string) => Promise<void>;
  sendMessage: (receiverId: string, content: string) => void;
  markAsRead: (messageId: string) => void;
  sendTyping: (receiverId: string, isTyping: boolean) => void;
  typingUsers: Record<string, boolean>;
  checkConnection: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isAuthenticated) {
      const socket = getSocket();

      if (socket) {
        setIsConnected(socket.connected);

        socket.on('online_users', (userIds: string[]) => {
          setOnlineUsers(userIds);
        });

        socket.on('user_online', (data: { userId: string; username: string }) => {
          setOnlineUsers((prev) => {
            if (!prev.includes(data.userId)) {
              return [...prev, data.userId];
            }
            return prev;
          });
        });

        socket.on('user_offline', (data: { userId: string; username: string }) => {
          setOnlineUsers((prev) => prev.filter((id) => id !== data.userId));
        });

        socket.on('new_message', (message: Message) => {
          setMessages((prev) => {
            const userId = message.sender;
            return {
              ...prev,
              [userId]: [...(prev[userId] || []), message],
            };
          });

          setUnreadCounts((prev) => ({
            ...prev,
            [message.sender]: (prev[message.sender] || 0) + 1,
          }));

          loadConversations();
        });

        socket.on('message_sent', (message: Message) => {
          const userId = message.receiver;
          setMessages((prev) => ({
            ...prev,
            [userId]: [...(prev[userId] || []), message],
          }));
        });

        socket.on('user_typing', (data: { userId: string; username: string; isTyping: boolean }) => {
          setTypingUsers((prev) => ({
            ...prev,
            [data.userId]: data.isTyping,
          }));

          if (data.isTyping) {
            setTimeout(() => {
              setTypingUsers((prev) => ({
                ...prev,
                [data.userId]: false,
              }));
            }, 3000);
          }
        });

        socket.on('message_read_notification', (data: { messageId: string; readBy: string }) => {
          setMessages((prev) => {
            const updated = { ...prev };
            Object.keys(updated).forEach((userId) => {
              updated[userId] = updated[userId].map((msg) =>
                msg.id === data.messageId ? { ...msg, read: true } : msg
              );
            });
            return updated;
          });
        });

        socket.on('connect', () => {
          setIsConnected(true);
        });

        socket.on('disconnect', () => {
          setIsConnected(false);
        });
      }
    }

    return () => {
      if (!authService.isAuthenticated()) {
        disconnectSocket();
      }
    };
  }, [isAuthenticated]);

  const [allUsers, setAllUsers] = useState<User[]>([]);

  const loadAllUsers = async () => {
    try {
      const token = authService.getToken();
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/chat/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAllUsers(data.data || []);
        }
      }
    } catch (error) {
      console.error('Error loading all users:', error);
    }
  };

  const loadConversations = async () => {
    try {
      const token = authService.getToken();
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/chat/conversations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setConversations(data.data || []);

          const counts: Record<string, number> = {};
          data.data?.forEach((conv: Conversation) => {
            counts[conv.userId] = conv.unreadCount;
          });
          setUnreadCounts(counts);
        }
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadMessages = async (userId: string) => {
    try {
      const token = authService.getToken();
      if (!token) return;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/chat/messages/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMessages((prev) => ({
            ...prev,
            [userId]: data.data || [],
          }));

          setUnreadCounts((prev) => ({
            ...prev,
            [userId]: 0,
          }));
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = (receiverId: string, content: string) => {
    const socket = getSocket();
    if (socket && content.trim()) {
      socket.emit('private_message', {
        receiverId,
        content: content.trim(),
      });
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const token = authService.getToken();
      if (!token) return;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/chat/read/${messageId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const socket = getSocket();
        if (socket) {
          socket.emit('message_read', { messageId });
        }
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const sendTyping = (receiverId: string, isTyping: boolean) => {
    const socket = getSocket();
    if (socket) {
      socket.emit('typing', { receiverId, isTyping });
    }
  };

  const totalUnreadCount = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

  useEffect(() => {
    if (isAuthenticated) {
      loadConversations();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadAllUsers();
    }
  }, [isAuthenticated]);

  return (
    <ChatContext.Provider
      value={{
        onlineUsers,
        conversations,
        allUsers,
        messages,
        unreadCounts,
        totalUnreadCount,
        isConnected,
        loadAllUsers,
        loadConversations,
        loadMessages,
        sendMessage,
        markAsRead,
        sendTyping,
        typingUsers,
        checkConnection: reconnectSocket,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

