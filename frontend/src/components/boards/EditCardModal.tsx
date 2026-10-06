import { useState } from 'react';
import { createPortal } from 'react-dom';
import type { Card } from '../../types';
import './EditCardModal.css';

interface EditCardModalProps {
  card: Card;
  onSave: (updatedCard: Partial<Card>) => void;
  onClose: () => void;
}

const EditCardModal: React.FC<EditCardModalProps> = ({ card, onSave, onClose }) => {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [priority, setPriority] = useState<1 | 2 | 3>(card.priority || 3);
  const [dueDate, setDueDate] = useState(
    card.dueDate ? new Date(card.dueDate).toISOString().split('T')[0] : ''
  );
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (title.trim().length < 3) {
      setError('Title must contain at least 3 characters');
      return;
    }

    if (!description.trim()) {
      setError('Description is required');
      return;
    }

    const updatedData: Partial<Card> = {
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate: dueDate || card.dueDate,
      listId: card.listId,
      isCompleted: card.isCompleted ?? false,
    };

    onSave(updatedData);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div className="edit-card-modal-overlay" onClick={handleOverlayClick}>
      <div className="edit-card-modal">
        <div className="edit-card-modal-header">
          <h3>Edit card</h3>
          <button 
            className="edit-card-modal-close" 
            onClick={onClose}
            type="button"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-card-form">
          {error && (
            <div className="edit-card-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="card-title">
              Title <span className="required">*</span>
            </label>
            <input
              id="card-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError('');
              }}
              placeholder="Card title"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="card-description">
              Description <span className="required">*</span>
            </label>
            <textarea
              id="card-description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setError('');
              }}
              placeholder="Card description"
              rows={4}
              className="form-textarea"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="card-priority">Priority</label>
              <select
                id="card-priority"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value) as 1 | 2 | 3)}
                className="form-select"
              >
                <option value={1}>🔴 High</option>
                <option value={2}>🟡 Medium</option>
                <option value={3}>🟢 Low</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="card-due-date">Due date</label>
              <input
                id="card-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="edit-card-modal-footer">
            <button 
              type="button" 
              onClick={onClose} 
              className="btn-cancel"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-save"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default EditCardModal;

