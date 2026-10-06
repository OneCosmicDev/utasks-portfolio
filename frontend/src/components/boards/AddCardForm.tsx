import { useState, useEffect } from 'react';
import { cardService } from '../../services/api';
import type { Card } from '../../types';
import './AddCardForm.css';

interface AddCardFormProps {
  listId: string;
  onCardAdded: (card: Card) => void;
  onCancel: () => void;
}

const AddCardForm: React.FC<AddCardFormProps> = ({ listId, onCardAdded, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<1 | 2 | 3>(2);
  const [dueDate, setDueDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 7);
    setDueDate(defaultDate.toISOString().split('T')[0]);
  }, []);

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

    if (description.trim().length > 30) {
      setError('Description must contain maximum 30 characters');
      return;
    }

    if (!description.trim()) {
      setError('Description is required');
      return;
    }

    if (!dueDate) {
      setError('Due date is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    const response = await cardService.create({
      title: title.trim(),
      description: description.trim(),
      listId,
      priority,
      dueDate: dueDate,
      isCompleted: false,
    });

    if (response.success && response.data) {
      onCardAdded(response.data);
      setTitle('');
    } else {
      const errorDetails = response.errors 
        ? response.errors.map(e => e.message).join(', ')
        : response.message || 'Error creating card';
      
      setError(errorDetails);
    }

    setIsLoading(false);
  };

  return (
    <div className="add-card-form">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Card title (min. 3 chars)"
          autoFocus
          disabled={isLoading}
          className="card-input"
          required
        />
        
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (max. 30 chars)"
          disabled={isLoading}
          className="card-input"
          maxLength={30}
          required
        />

        <select
          value={priority}
          onChange={(e) => setPriority(Number(e.target.value) as 1 | 2 | 3)}
          disabled={isLoading}
          className="card-select"
        >
          <option value={1}>🔴 High Priority</option>
          <option value={2}>🟡 Medium Priority</option>
          <option value={3}>🟢 Low Priority</option>
        </select>

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          disabled={isLoading}
          className="card-input"
          required
        />

        {error && <div className="form-error">{error}</div>}
        
        <div className="form-actions">
          <button
            type="submit"
            disabled={isLoading}
            className="btn-add-card"
          >
            {isLoading ? 'Adding...' : 'Add'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="btn-cancel-card"
          >
            ✕
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCardForm;

