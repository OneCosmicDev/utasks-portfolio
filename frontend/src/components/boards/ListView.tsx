import { useState, useEffect, useMemo, useRef } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { listService } from '../../services/api';
import { ConfirmModal } from '../common';
import SortableCardItem from './SortableCardItem';
import AddCardForm from './AddCardForm';
import type { List, Card } from '../../types';
import './ListView.css';

interface ListViewProps {
  list: List;
  cards: Card[];
  isCardsLoading: boolean;
  onListDeleted: (listId: string) => void;
  onListUpdated: (list: List) => void;
  onCardAdded: (listId: string, card: Card) => void;
  onCardUpdated: (listId: string, card: Card) => void;
  onCardDeleted: (listId: string, cardId: string) => void;
  dragHandleProps?: any;
  isDragging?: boolean;
}

type SortOption = 'position' | 'priority' | 'dueDate';

const ListView: React.FC<ListViewProps> = ({
  list,
  cards,
  isCardsLoading,
  onListDeleted,
  onListUpdated,
  onCardAdded,
  onCardUpdated,
  onCardDeleted,
  dragHandleProps,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(list.name);
  const [showMenu, setShowMenu] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  
  const [sortBy, setSortBy] = useState<SortOption>(() => {
    const savedSort = localStorage.getItem(`utasks_sort_${list.id}`);
    return (savedSort as SortOption) || 'position';
  });
  
  const menuRef = useRef<HTMLDivElement>(null);
  const { setNodeRef, isOver } = useDroppable({
    id: `droppable-cards-${list.id}`,
    data: { type: 'list', listId: list.id },
  });

  useEffect(() => {
    localStorage.setItem(`utasks_sort_${list.id}`, sortBy);
  }, [sortBy, list.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
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

  const sortCards = (cardsToSort: Card[], sortOption: SortOption): Card[] => {
    const sorted = [...cardsToSort];
    
    switch (sortOption) {
      case 'priority':
        return sorted.sort((a, b) => {
          const priorityA = a.priority || 999;
          const priorityB = b.priority || 999;
          return priorityA - priorityB;
        });
      
      case 'dueDate':
        return sorted.sort((a, b) => {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        });
      
      case 'position':
      default:
        return sorted.sort((a, b) => (a.position || 0) - (b.position || 0));
    }
  };

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
  };


  const sortedCards = useMemo(() => sortCards(cards, sortBy), [cards, sortBy]);

  const handleRename = async () => {
    if (!editName.trim() || editName.trim() === list.name) {
      setIsEditing(false);
      setEditName(list.name);
      return;
    }

    if (editName.trim().length < 3) {
      alert('Name must contain at least 3 characters');
      return;
    }

    const updateData = {
      name: editName.trim(),
      boardId: list.boardId,
    };

    const response = await listService.update(list.id, updateData);

    if (response.success && response.data) {
      onListUpdated(response.data);
      setIsEditing(false);
    } else {
      const errorDetails = response.errors 
        ? response.errors.map(e => e.message).join(', ')
        : response.message || 'Error updating list';
      
      alert(errorDetails);
      setEditName(list.name);
      setIsEditing(false);
    }
  };

  const handleDeleteConfirm = async () => {
    const response = await listService.delete(list.id);

    if (response.success) {
      onListDeleted(list.id);
      setIsConfirmOpen(false);
    } else {
      alert(response.message || 'Error deleting list');
      setIsConfirmOpen(false);
    }
  };

  const handleDeleteClick = () => {
    setShowMenu(false);
    setIsConfirmOpen(true);
  };

  const handleCardAdded = (newCard: Card) => {
    onCardAdded(list.id, newCard);
    setShowAddCard(false);
  };

  const handleCardDeleted = (cardId: string) => {
    onCardDeleted(list.id, cardId);
  };

  const handleCardUpdated = (updatedCard: Card) => {
    onCardUpdated(list.id, updatedCard);
  };


  return (
    <div className="list-view">
      <div className="list-header">
        {dragHandleProps && (
          <div {...dragHandleProps} className="list-drag-handle">
            <div className="drag-indicator">⋮⋮</div>
          </div>
        )}
        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') {
                setIsEditing(false);
                setEditName(list.name);
              }
            }}
            autoFocus
            className="list-name-edit"
          />
        ) : (
          <h3 className="list-title">
            {list.name}
          </h3>
        )}
        <div className="list-menu" ref={menuRef}>
          <button
            className="btn-menu"
            onClick={() => setShowMenu(!showMenu)}
            title="Menu"
          >
            ⋮
          </button>
          {showMenu && (
            <div className="menu-dropdown">
              <button onClick={() => {
                setIsEditing(true);
                setShowMenu(false);
              }}>
                Rename
              </button>
              <button onClick={handleDeleteClick} className="btn-delete">
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="list-sort-bar">
        <label htmlFor={`sort-${list.id}`} className="sort-label">Sort by:</label>
        <select 
          id={`sort-${list.id}`}
          value={sortBy} 
          onChange={(e) => handleSortChange(e.target.value as SortOption)}
          className="sort-select"
        >
          <option value="position">Position</option>
          <option value="priority">Priority</option>
          <option value="dueDate">Due date</option>
        </select>
      </div>

      <div
        className={`list-cards${isOver ? ' list-cards-droppable' : ''}`}
        ref={setNodeRef}
      >
        {isCardsLoading ? (
          <div className="list-loading">Loading...</div>
        ) : (
          <>
            <SortableContext
              items={sortedCards.map((card) => card.id)}
              strategy={verticalListSortingStrategy}
            >
              {sortedCards.map((card, index) => (
                <SortableCardItem
                  key={card.id}
                  card={card}
                  listId={list.id}
                  index={index}
                  onCardDeleted={handleCardDeleted}
                  onCardUpdated={handleCardUpdated}
                />
              ))}
            </SortableContext>

            {showAddCard ? (
              <AddCardForm
                listId={list.id}
                onCardAdded={handleCardAdded}
                onCancel={() => setShowAddCard(false)}
              />
            ) : (
              <button
                className="btn-add-card"
                onClick={() => setShowAddCard(true)}
              >
                + Add a card
              </button>
            )}

            {cards.length === 0 && !showAddCard && (
              <div className="list-empty">
                <p>No cards yet</p>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Delete list"
        message={`Are you sure you want to delete the list "${list.name}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsConfirmOpen(false)}
        isDangerous={true}
      />
    </div>
  );
};

export default ListView;

