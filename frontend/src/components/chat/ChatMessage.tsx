import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Chat.css';

interface ChatMessageProps {
  message: {
    id: string;
    sender: string | { _id: string; username: string };
    receiver: string | { _id: string; username: string };
    content: string;
    read: boolean;
    createdAt: string;
  };
  senderName?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, senderName }) => {
  const { user } = useAuth();


  const getSenderId = (sender: any) => {
    if (typeof sender === 'object' && sender !== null) {
      return sender._id || sender.id;
    }
    return sender;
  };


  const getCurrentUserId = (u: any) => {
    if (!u) return null;
    return u.id || u._id;
  };

  const senderId = getSenderId(message.sender);
  const currentUserId = getCurrentUserId(user);


  console.log('Chat Message Debug:', {
    msgId: message.id,
    senderRaw: message.sender,
    extractedSenderId: senderId,
    currentUserRaw: user,
    extractedUserId: currentUserId,
    match: String(senderId) === String(currentUserId)
  });

  const isOwnMessage = String(senderId) === String(currentUserId);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const initial = senderName ? senderName.charAt(0).toUpperCase() : '?';

  return (
    <div className={`chat-message ${isOwnMessage ? 'own' : 'other'}`}>
      {!isOwnMessage && (
        <div className="chat-message-avatar">
          {initial}
        </div>
      )}
      <div className="chat-message-content">
        {/* TEMPORARY DEBUG: Remove after fixing */}
        {/* <div style={{ fontSize: '9px', color: 'red' }}>
          {String(senderId).slice(-4)} vs {String(currentUserId).slice(-4)}
        </div> */}
        <p>{message.content}</p>
        <div className="chat-message-meta">
          <span className="chat-message-time">{formatTime(message.createdAt)}</span>
          {isOwnMessage && (
            <span className={`chat-message-status ${message.read ? 'read' : 'sent'}`}>
              {message.read ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
