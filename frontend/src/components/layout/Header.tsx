import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import './Header.css';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { totalUnreadCount } = useChat();
  const navigate = useNavigate();
  const [showUserIdModal, setShowUserIdModal] = useState(false);

  const handleCopyId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      alert('ID copied to clipboard!');
    }
  };

  return (
    <>
      <header className="header">
        <div className="header-content">
          <h1 
            className="header-title" 
            onClick={() => navigate('/')}
            title="Back to home"
          >
            UTasks
          </h1>
          {user && (
            <div className="header-user">
              <button 
                onClick={() => navigate('/chat')} 
                className="btn-chat"
                title="Open chat"
              >
                💬 Chat
                {totalUnreadCount > 0 && (
                  <span className="header-unread-badge">{totalUnreadCount}</span>
                )}
              </button>
              <button 
                onClick={() => setShowUserIdModal(true)} 
                className="btn-user-id"
                title="View my user ID"
              >
                View my ID
              </button>
              <button onClick={logout} className="btn-logout">
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {showUserIdModal && user && (
        <div className="modal-overlay" onClick={() => setShowUserIdModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Your User ID</h3>
              <button 
                className="modal-close" 
                onClick={() => setShowUserIdModal(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="id-warning">
                <strong>⚠️ Important:</strong> Keep this ID safe! You'll need it to log back in if you change browsers or lose your session.
              </div>
              <div className="user-id-display">
                <label>Your ID:</label>
                <div className="id-container">
                  <code className="user-id-code">{user.id}</code>
                  <button onClick={handleCopyId} className="btn-copy">
                    📋 Copy
                  </button>
                </div>
              </div>
              <div className="id-info">
                <p><strong>How to use this ID:</strong></p>
                <ul>
                  <li>Save it in a safe place</li>
                  <li>Use it to log back in if needed</li>
                </ul>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowUserIdModal(false)} className="btn-primary">
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;

