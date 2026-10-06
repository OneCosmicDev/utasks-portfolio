import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ListView from './ListView';
import type { Card, List } from '../../types';
import './SortableListView.css';

interface SortableListViewProps {
  list: List;
  cards: Card[];
  isCardsLoading: boolean;
  onListDeleted: (listId: string) => void;
  onListUpdated: (list: List) => void;
  onCardAdded: (listId: string, card: Card) => void;
  onCardUpdated: (listId: string, card: Card) => void;
  onCardDeleted: (listId: string, cardId: string) => void;
}

const SortableListView: React.FC<SortableListViewProps> = ({
  list,
  cards,
  isCardsLoading,
  onListDeleted,
  onListUpdated,
  onCardAdded,
  onCardUpdated,
  onCardDeleted,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: list.id,
    data: {
      type: 'list',
      listId: list.id,
    },
    animateLayoutChanges: () => false,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'default',
    willChange: isDragging ? 'transform' : 'auto',
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`sortable-list-wrapper ${isDragging ? 'is-dragging' : ''}`}
      data-list-id={list.id}
    >
      <ListView
        list={list}
        cards={cards}
        isCardsLoading={isCardsLoading}
        onListDeleted={onListDeleted}
        onListUpdated={onListUpdated}
        onCardAdded={onCardAdded}
        onCardUpdated={onCardUpdated}
        onCardDeleted={onCardDeleted}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging}
      />
    </div>
  );
};

export default SortableListView;

