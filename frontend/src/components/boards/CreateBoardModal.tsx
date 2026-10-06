import { useState } from 'react';
import { boardService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import type { Board } from '../../types';
import './CreateBoardModal.css';

interface CreateBoardModalProps {
  onClose: () => void;
  onBoardCreated: (board: Board) => void;
}

const CreateBoardModal: React.FC<CreateBoardModalProps> = ({ onClose, onBoardCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (title.trim().length < 3) {
      setError('Title must contain at least 3 characters');
      return;
    }

    if (!user?.id) {
      setError('User not logged in');
      return;
    }

    setIsLoading(true);
    setError(null);

    const response = await boardService.create({
      name: title.trim(), 
      description: description.trim() || undefined,
      userId: user.id,
    });

    if (response.success && response.data) {
      onBoardCreated(response.data);
      onClose();
    } else {
      
      const errorDetails = response.errors 
        ? response.errors.map(e => e.message).join(', ')
        : response.message || 'Error creating board';
      
      setError(errorDetails);
    }

    setIsLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create a new board</h3>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="board-title">Board title *</label>
              <input
                type="text"
                id="board-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Personal project, Work... (min. 3 characters)"
                disabled={isLoading}
                autoFocus
                required
                minLength={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="board-description">Description (optional)</label>
              <textarea
                id="board-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your board..."
                rows={3}
                disabled={isLoading}
              />
            </div>

            {error && <div className="error-message">{error}</div>}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create board'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBoardModal;

