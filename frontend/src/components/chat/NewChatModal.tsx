import React, { useState, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Chat.css';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewChatModal: React.FC<NewChatModalProps> = ({ isOpen, onClose }) => {
  const { allUsers, loadAllUsers, conversations } = useChat();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadAllUsers();
    }
  }, [isOpen, loadAllUsers]);


  const existingConversationUserIds = new Set(conversations.map(c => c.userId));
  const filteredUsers = allUsers.filter(u => {
    const matchesSearch = u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const notCurrentUser = u.id !== user?.id;
    return matchesSearch && notCurrentUser && !existingConversationUserIds.has(u.id);
  });

  const handleUserSelect = (userId: string) => {
    navigate(`/chat/${userId}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="chat-modal-overlay" onClick={onClose}>
      <div className="chat-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="chat-modal-header">
          <h3>Nouveau message</h3>
          <button className="chat-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="chat-modal-body">
          <input
            type="text"
            className="chat-modal-search"
            placeholder="Rechercher un utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
          <div className="chat-modal-users">
            {filteredUsers.length === 0 ? (
              <div className="chat-modal-empty">
                <p>Aucun utilisateur trouvé</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="chat-modal-user-item"
                  onClick={() => handleUserSelect(user.id)}
                >
                  <div className="chat-avatar-circle">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="chat-modal-user-info">
                    <span className="chat-modal-username">{user.username}</span>
                    <span className="chat-modal-email">{user.email}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;

