import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cardService } from '../../services/api';
import { ConfirmModal } from '../common';
import EditCardModal from './EditCardModal';
import ViewCardModal from './ViewCardModal';
import type { Card } from '../../types';
import './CardItem.css';

interface CardItemProps {
  card: Card;
  onCardDeleted: (cardId: string) => void;
  onCardUpdated: (card: Card) => void;
  dragHandleProps?: any;
  isDragging?: boolean;
}

const CardItem: React.FC<CardItemProps> = ({ card, onCardDeleted, onCardUpdated, dragHandleProps, isDragging = false }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  useEffect(() => {
    if (showMenu && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 4, 
        left: rect.right - 150, 
      });
    }
  }, [showMenu]);

  const handleDeleteConfirm = async () => {
    const response = await cardService.delete(card.id);

    if (response.success) {
      onCardDeleted(card.id);
      setIsConfirmOpen(false);
    } else {
      alert(response.message || 'Error deleting card');
      setIsConfirmOpen(false);
    }
  };

  const handleDeleteClick = () => {
    setShowMenu(false);
    setIsConfirmOpen(true);
  };

  const handleSaveEdit = async (updatedData: Partial<Card>) => {
    const response = await cardService.update(card.id, updatedData);

    if (response.success && response.data) {
      onCardUpdated(response.data);
      setIsEditModalOpen(false);
    } else {
      const errorDetails = response.errors 
        ? response.errors.map(e => e.message).join(', ')
        : response.message || 'Error updating card';
      
      alert(errorDetails);
    }
  };

  const handleCardClick = () => {
    setIsViewModalOpen(true);
  };

  return (
    <>
      <div 
        className={`card-item ${isDragging ? 'is-dragging' : ''}`}
        onClick={handleCardClick}
      >
        {dragHandleProps && (
          <div {...dragHandleProps} className="card-drag-handle" onClick={(e) => e.stopPropagation()}>
            <div className="drag-indicator">⋮⋮</div>
          </div>
        )}
        <div className="card-content">
          <p className="card-title">{card.title}</p>
          {card.description && (
            <p className="card-description">{card.description}</p>
          )}
          <div className="card-meta">
            {card.priority && (
              <span className={`card-priority priority-${card.priority}`}>
                {card.priority === 1 ? '🔴 High' : card.priority === 2 ? '🟡 Medium' : '🟢 Low'}
              </span>
            )}
            {card.dueDate && (
              <span className="card-due-date">
                📅 {(() => {
                  const [year, month, day] = card.dueDate.split('T')[0].split('-');
                  const date = new Date(Number(year), Number(month) - 1, Number(day));
                  return date.toLocaleDateString('en-US', { 
                    day: 'numeric', 
                    month: 'short' 
                  });
                })()}
              </span>
            )}
          </div>
        </div>
        <div className="card-menu">
          <button
            ref={buttonRef}
            className="btn-card-menu"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            title="Menu"
          >
            ⋮
          </button>
        </div>
      </div>

      {showMenu && createPortal(
        <div 
          ref={menuRef}
          className="card-menu-dropdown-portal"
          style={{
            position: 'fixed',
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
            zIndex: 10000,
          }}
        >
          <button onClick={(e) => {
            e.stopPropagation();
            setIsEditModalOpen(true);
            setShowMenu(false);
          }}>
            Edit
          </button>
          <button onClick={(e) => {
            e.stopPropagation();
            handleDeleteClick();
          }} className="btn-delete">
            Delete
          </button>
        </div>,
        document.body
      )}

      {isViewModalOpen && (
        <ViewCardModal
          card={card}
          onClose={() => setIsViewModalOpen(false)}
        />
      )}

      {isEditModalOpen && (
        <EditCardModal
          card={card}
          onSave={handleSaveEdit}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Delete card"
        message={`Are you sure you want to delete the card "${card.title}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsConfirmOpen(false)}
        isDangerous={true}
      />
    </>
  );
};

export default CardItem;

