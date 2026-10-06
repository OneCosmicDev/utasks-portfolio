import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import NewChatModal from './NewChatModal';
import './Chat.css';

const ChatSidebar: React.FC = () => {
  const { conversations, onlineUsers, unreadCounts, loadConversations, checkConnection } = useChat();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const formatLastMessage = (content: string, maxLength: number = 30) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const handleConversationClick = (conversationUserId: string) => {
    navigate(`/chat/${conversationUserId}`);
  };

  return (
    <>
      <div className="chat-sidebar">
        <div className="chat-sidebar-header">
          <h2>Messages</h2>
          <div className={`chat-connection-status ${onlineUsers.includes(user?.id || '') ? 'online' : 'offline'}`}>
            <span className="chat-status-dot"></span>
            {onlineUsers.includes(user?.id || '') ? 'Online' : 'Offline'}
            <button
              className="chat-status-refresh"
              onClick={(e) => {
                e.stopPropagation();
                checkConnection();
              }}
              title="Refresh connection status"
              type="button"
            >
              ↻
            </button>
          </div>
        </div>
        <button
          className="chat-new-message-btn"
          onClick={() => setShowNewChatModal(true)}
          title="Nouveau message"
        >
          + Nouveau message
        </button>
        <div className="chat-sidebar-conversations">
          {conversations.length === 0 ? (
            <div className="chat-sidebar-empty">
              <p>No conversations yet</p>
              <p className="chat-sidebar-empty-hint">Start chatting with other users!</p>
            </div>
          ) : (
            conversations.map((conversation) => {
              const isOnline = onlineUsers.includes(conversation.userId);
              const unreadCount = unreadCounts[conversation.userId] || 0;
              const isActive = userId === conversation.userId;

              return (
                <div
                  key={conversation.userId}
                  className={`chat-conversation-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleConversationClick(conversation.userId)}
                >
                  <div className="chat-conversation-avatar">
                    <div className="chat-avatar-circle">
                      {conversation.username.charAt(0).toUpperCase()}
                    </div>
                    {isOnline && <span className="chat-online-badge"></span>}
                  </div>
                  <div className="chat-conversation-info">
                    <div className="chat-conversation-header">
                      <span className="chat-conversation-name">{conversation.username}</span>
                      {conversation.lastMessage && (
                        <span className="chat-conversation-time">
                          {formatTime(conversation.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <div className="chat-conversation-preview">
                      {conversation.lastMessage ? (
                        <span className="chat-conversation-last-message">
                          {conversation.lastMessage.sender === user?.id ? 'You: ' : ''}
                          {formatLastMessage(conversation.lastMessage.content)}
                        </span>
                      ) : (
                        <span className="chat-conversation-last-message">No messages yet</span>
                      )}
                      {unreadCount > 0 && (
                        <span className="chat-unread-badge">{unreadCount}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
      />
    </>
  );
};

export default ChatSidebar;

