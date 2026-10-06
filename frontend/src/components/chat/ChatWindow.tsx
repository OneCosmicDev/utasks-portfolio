import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import ChatMessage from './ChatMessage';
import './Chat.css';

const ChatWindow: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { messages, sendMessage, loadMessages, sendTyping, typingUsers, conversations } = useChat();
  const { user } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScrolledMessageId = useRef<string | null>(null);


  const getEntityId = (entity: any) => {
    if (!entity) return null;
    if (typeof entity === 'string') return entity;
    return entity._id || entity.id;
  };

  const currentUserId = getEntityId(user);

  const conversationMessages = userId ? messages[userId] || [] : [];

  useEffect(() => {
    if (userId) {
      loadMessages(userId);
    }
  }, [userId, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [userId]);

  useEffect(() => {
    const lastMessage = conversationMessages[conversationMessages.length - 1];

    if (!lastMessage || lastMessage.id === lastScrolledMessageId.current) {
      return;
    }

    const senderId = getEntityId(lastMessage.sender);
    const isMyMessage = senderId && currentUserId && String(senderId) === String(currentUserId);

    if (isMyMessage) {
      lastScrolledMessageId.current = lastMessage.id;
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

  }, [conversationMessages, currentUserId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);

    if (userId && !isTyping) {
      setIsTyping(true);
      sendTyping(userId, true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (userId) {
        setIsTyping(false);
        sendTyping(userId, false);
      }
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId || !inputValue.trim()) {
      return;
    }

    if (isTyping) {
      setIsTyping(false);
      sendTyping(userId, false);
    }

    sendMessage(userId, inputValue.trim());
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!userId) {
    return (
      <div className="chat-window-empty">
        <div className="chat-window-empty-content">
          <div className="chat-window-empty-icon">💬</div>
          <h3>Select a conversation</h3>
          <p>Choose a user from the sidebar to start chatting</p>
        </div>
      </div>
    );
  }

  const otherUserTyping = typingUsers[userId];

  return (
    <div className="chat-window">
      <div className="chat-window-messages">
        {conversationMessages.length === 0 ? (
          <div className="chat-window-empty-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          conversationMessages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              senderName={conversations.find(c => c.userId === userId)?.username}
            />
          ))
        )}
        {otherUserTyping && (
          <div className="chat-typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form className="chat-window-input" onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          autoFocus
        />
        <button type="submit" disabled={!inputValue.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;

