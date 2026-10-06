import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChatSidebar, ChatWindow } from './';
import './Chat.css';

const Chat: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleBackToSidebar = () => {
    navigate('/chat');
  };

  return (
    <div className={`chat-container ${isMobile ? 'chat-mobile' : ''} ${isMobile && userId ? 'chat-showing-window' : ''}`}>
      <div className={`chat-sidebar-wrapper ${isMobile && userId ? 'chat-hidden' : ''}`}>
        <ChatSidebar />
      </div>
      <div className={`chat-window-wrapper ${isMobile && !userId ? 'chat-hidden' : ''}`}>
        {isMobile && userId && (
          <button
            className="chat-mobile-back-btn"
            onClick={handleBackToSidebar}
            aria-label="Back to conversations"
          >
            ← Back
          </button>
        )}
        <ChatWindow />
      </div>
    </div>
  );
};

export default Chat;

