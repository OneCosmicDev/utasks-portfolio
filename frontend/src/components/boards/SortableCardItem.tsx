import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import CardItem from './CardItem';
import type { Card } from '../../types';

interface SortableCardItemProps {
  card: Card;
  listId: string;
  index: number;
  onCardDeleted: (cardId: string) => void;
  onCardUpdated: (card: Card) => void;
  disabled?: boolean;
}

const SortableCardItem: React.FC<SortableCardItemProps> = ({
  card,
  listId,
  index,
  onCardDeleted,
  onCardUpdated,
  disabled = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: 'card',
      listId,
      index,
    },
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={isDragging ? 'is-dragging' : ''}
      data-card-id={card.id}
    >
      <CardItem
        card={card}
        onCardDeleted={onCardDeleted}
        onCardUpdated={onCardUpdated}
        dragHandleProps={disabled ? undefined : { ...attributes, ...listeners }}
        isDragging={isDragging}
      />
    </div>
  );
};

export default SortableCardItem;

