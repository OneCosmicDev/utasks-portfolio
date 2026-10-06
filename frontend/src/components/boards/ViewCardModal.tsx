import { createPortal } from 'react-dom';
import type { Card } from '../../types';
import './ViewCardModal.css';

interface ViewCardModalProps {
  card: Card;
  onClose: () => void;
}

const ViewCardModal: React.FC<ViewCardModalProps> = ({ card, onClose }) => {
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getPriorityDisplay = (priority?: 1 | 2 | 3) => {
    switch (priority) {
      case 1:
        return { label: 'High', emoji: '🔴', class: 'priority-high' };
      case 2:
        return { label: 'Medium', emoji: '🟡', class: 'priority-medium' };
      case 3:
        return { label: 'Low', emoji: '🟢', class: 'priority-low' };
      default:
        return { label: 'Not set', emoji: '⚪', class: 'priority-none' };
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('T')[0].split('-');
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
  };

  const priority = getPriorityDisplay(card.priority);

  const modalContent = (
    <div className="view-card-modal-overlay" onClick={handleOverlayClick}>
      <div className="view-card-modal">
        <div className="view-card-modal-header">
          <h2 className="view-card-title">{card.title}</h2>
          <button 
            className="view-card-modal-close" 
            onClick={onClose}
            aria-label="Close"
            title="Close"
          >
            ×
          </button>
        </div>

        <div className="view-card-modal-body">
          <div className="view-card-section">
            <h3 className="view-card-section-title">📝 Description</h3>
            <div className="view-card-description">
              {card.description || <em className="view-card-empty">No description</em>}
            </div>
          </div>

          <div className="view-card-metadata">
            <div className="view-card-section">
              <h3 className="view-card-section-title">🎯 Priority</h3>
              <div className={`view-card-priority ${priority.class}`}>
                <span className="priority-emoji">{priority.emoji}</span>
                <span className="priority-label">{priority.label}</span>
              </div>
            </div>

            <div className="view-card-section">
              <h3 className="view-card-section-title">📅 Due date</h3>
              <div className="view-card-due-date">
                {card.dueDate ? (
                  <span>{formatDate(card.dueDate)}</span>
                ) : (
                  <em className="view-card-empty">Not set</em>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ViewCardModal;

