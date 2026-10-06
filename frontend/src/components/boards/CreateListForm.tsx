import { useState } from 'react';
import { listService } from '../../services/api';
import type { List } from '../../types';
import './CreateListForm.css';

interface CreateListFormProps {
  boardId: string;
  onListCreated: (list: List) => void;
  onCancel: () => void;
}

const CreateListForm: React.FC<CreateListFormProps> = ({ boardId, onListCreated, onCancel }) => {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('List name is required');
      return;
    }

    if (name.trim().length < 3) {
      setError('Name must contain at least 3 characters');
      return;
    }

    setIsLoading(true);
    setError(null);

    const response = await listService.create({
      name: name.trim(),
      boardId,
    });

    if (response.success && response.data) {
      onListCreated(response.data);
      setName('');
    } else {
      setError(response.message || 'Error creating list');
    }

    setIsLoading(false);
  };

  return (
    <div className="create-list-form">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="List name (min. 3 characters)..."
          autoFocus
          disabled={isLoading}
          className="list-name-input"
          minLength={3}
        />
        {error && <div className="form-error">{error}</div>}
        <div className="form-actions">
          <button
            type="submit"
            disabled={isLoading}
            className="btn-submit"
          >
            {isLoading ? 'Adding...' : 'Add'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="btn-cancel"
          >
            ✕
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateListForm;

