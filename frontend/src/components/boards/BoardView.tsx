import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  UniqueIdentifier,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { boardService, cardService, listService } from '../../services/api';
import type { Board, Card, List } from '../../types';
import CreateListForm from './CreateListForm';
import SortableListView from './SortableListView';
import './BoardView.css';
import './DragAnimations.css';

const normalizeCards = (cards: Card[], listId: string): Card[] =>
  cards.map((card, index) => ({
    ...card,
    listId,
    position: index,
  }));

const findContainerInState = (
  state: Record<string, Card[]>,
  id: UniqueIdentifier | null | undefined
): string | null => {
  if (!id) return null;
  const key = String(id);

  if (Object.prototype.hasOwnProperty.call(state, key)) {
    return key;
  }

  for (const [listId, cards] of Object.entries(state)) {
    if (cards.some((card) => card.id === key)) {
      return listId;
    }
  }

  return null;
};

const BoardView: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const [board, setBoard] = useState<Board | null>(null);
  const [lists, setLists] = useState<List[]>([]);
  const [cardsByList, setCardsByList] = useState<Record<string, Card[]>>({});
  const cardsStateRef = useRef<Record<string, Card[]>>({});
  const previousCardsStateRef = useRef<Record<string, Card[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCards, setIsLoadingCards] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateList, setShowCreateList] = useState(false);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, 
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    cardsStateRef.current = cardsByList;
  }, [cardsByList]);

  useEffect(() => {
    if (boardId) {
      loadBoard();
      loadListsAndCards();
    }
  }, [boardId]);

  const loadBoard = async () => {
    if (!boardId) return;

    const response = await boardService.getById(boardId);

    if (response.success && response.data) {
      setBoard(response.data);
    } else {
      setError(response.message || 'Board non trouve');
    }
  };

  const loadListsAndCards = async () => {
    if (!boardId) return;

    setIsLoading(true);
    setIsLoadingCards(true);
    setError(null);

    const response = await listService.getByBoardId(boardId);

    if (response.success && response.data) {
      const savedOrder = localStorage.getItem(`utasks_lists_order_${boardId}`);
      let sortedLists: List[];
      
      if (savedOrder) {
        try {
          const orderMap: string[] = JSON.parse(savedOrder);
          
          const listsById = new Map(response.data.map(list => [list.id, list]));
          
          const orderedLists: List[] = [];
          const processedIds = new Set<string>();
          
          orderMap.forEach((id) => {
            const list = listsById.get(id);
            if (list) {
              orderedLists.push({ ...list, position: orderedLists.length });
              processedIds.add(id);
            }
          });
          
          response.data.forEach((list) => {
            if (!processedIds.has(list.id)) {
              orderedLists.push({ ...list, position: orderedLists.length });
            }
          });
          
          sortedLists = orderedLists;
        } catch (error) {
          console.error('Error parsing list order:', error);
          sortedLists = response.data.map((list, index) => ({
            ...list,
            position: list.position ?? index,
          }));
        }
      } else {
        sortedLists = response.data.map((list, index) => ({
          ...list,
          position: list.position ?? index,
        }));
      }
      
      setLists(sortedLists);

      const cardsEntries: Array<[string, Card[]]> = await Promise.all(
        sortedLists.map(async (list) => {
          const cardsResponse = await cardService.getByListId(list.id);

          if (cardsResponse.success && cardsResponse.data) {
            const sortedCards = cardsResponse.data.sort(
              (a, b) => (a.position || 0) - (b.position || 0)
            );
            return [list.id, normalizeCards(sortedCards, list.id)] as [string, Card[]];
          }

          return [list.id, [] as Card[]];
        })
      );

      const nextCards = cardsEntries.reduce<Record<string, Card[]>>((acc, [listKey, cards]) => {
        acc[listKey] = cards;
        return acc;
      }, {});

      setCardsByList(nextCards);
      cardsStateRef.current = nextCards;
    } else {
      setError(response.message || 'Error loading lists');
    }

    setIsLoadingCards(false);
    setIsLoading(false);
  };

  const handleListCreated = (newList: List) => {
    setLists((prev) => {
      const updated = [...prev, { ...newList, position: prev.length }];
      if (boardId) {
        const order = updated.map(l => l.id);
        localStorage.setItem(`utasks_lists_order_${boardId}`, JSON.stringify(order));
      }
      return updated;
    });
    setCardsByList((prev) => {
      const nextState = {
        ...prev,
        [newList.id]: [],
      };
      cardsStateRef.current = nextState;
      return nextState;
    });
    setShowCreateList(false);
  };

  const handleListDeleted = (listId: string) => {
    setLists((prev) => {
      const updated = prev.filter((list) => list.id !== listId);
      if (boardId) {
        const order = updated.map(l => l.id);
        localStorage.setItem(`utasks_lists_order_${boardId}`, JSON.stringify(order));
      }
      return updated;
    });
    setCardsByList((prev) => {
      const { [listId]: _removed, ...rest } = prev;
      cardsStateRef.current = rest;
      return rest;
    });
  };

  const handleListUpdated = (updatedList: List) => {
    setLists((prev) => prev.map((list) => (list.id === updatedList.id ? updatedList : list)));
  };

  const handleCardAdded = (listId: string, card: Card) => {
    setCardsByList((prev) => {
      const currentCards = prev[listId] || [];
      const nextState = {
        ...prev,
        [listId]: normalizeCards([...currentCards, card], listId),
      };
      cardsStateRef.current = nextState;
      return nextState;
    });
  };

  const handleCardUpdated = (previousListId: string, updatedCard: Card) => {
    setCardsByList((prev) => {
      const nextState = { ...prev };
      const sourceCards = (nextState[previousListId] || []).filter(
        (card) => card.id !== updatedCard.id
      );
      nextState[previousListId] = normalizeCards(sourceCards, previousListId);

      const destinationListId = updatedCard.listId;
      const destinationCards =
        destinationListId === previousListId
          ? nextState[previousListId]
          : nextState[destinationListId] || [];

      const insertIndex =
        typeof updatedCard.position === 'number'
          ? Math.min(updatedCard.position, destinationCards.length)
          : destinationCards.length;

      const nextDestination = [...destinationCards];
      nextDestination.splice(insertIndex, 0, updatedCard);
      nextState[destinationListId] = normalizeCards(nextDestination, destinationListId);
      cardsStateRef.current = nextState;
      return nextState;
    });
  };

  const handleCardDeleted = (listId: string, cardId: string) => {
    setCardsByList((prev) => {
      const nextState = {
        ...prev,
        [listId]: normalizeCards((prev[listId] || []).filter((card) => card.id !== cardId), listId),
      };
      cardsStateRef.current = nextState;
      return nextState;
    });
  };

  const buildCardUpdatePayload = (card: Card) => {
    const payload: any = {
      title: card.title,
      description: card.description || '',
      listId: card.listId,
      position: card.position,
      isCompleted: card.isCompleted ?? false,
    };

    if (card.priority !== undefined) {
      payload.priority = card.priority;
    }
    if (card.dueDate !== undefined) {
      payload.dueDate = card.dueDate;
    }

    return payload;
  };

  const syncCardPositions = async (
    listId: string,
    currentSnapshot: Record<string, Card[]>,
    previousSnapshot: Record<string, Card[]>
  ) => {
    const currentCards = currentSnapshot[listId] || [];

    const previousPositions = new Map<string, { listId: string; position: number }>();
    Object.entries(previousSnapshot).forEach(([prevListId, cards]) => {
      cards.forEach((card, index) => {
        previousPositions.set(card.id, { listId: prevListId, position: index });
      });
    });

    const updates: Array<{ promise: Promise<any>; cardId: string; payload: any }> = [];

    currentCards.forEach((card, index) => {
      const previous = previousPositions.get(card.id);
      const hasChanged =
        !previous ||
        previous.listId !== listId ||
        previous.position !== index;

      if (hasChanged) {
        const payload = buildCardUpdatePayload(card);
        updates.push({
          promise: cardService.update(card.id, payload),
          cardId: card.id,
          payload
        });
      }
    });

    if (updates.length === 0) {
      return;
    }

    const results = await Promise.allSettled(updates.map(u => u.promise));

    const failures = results.filter((r) => r.status === 'rejected');
    if (failures.length > 0) {
      console.error('Failed to update some cards:', failures);
      throw new Error(`${failures.length} card(s) could not be updated`);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    
    if (active.data.current?.type === 'card') {
      setActiveCardId(String(active.id));
      previousCardsStateRef.current = JSON.parse(JSON.stringify(cardsStateRef.current));
    }
    
    if (active.data.current?.type === 'list') {
      setActiveListId(String(active.id));
    }
  };

  const handleCardDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    if (active.data.current?.type !== 'card') {
      return;
    }

    setCardsByList((prev) => {
      const activeId = String(active.id);
      const overId = String(over.id);
      const sourceContainer = findContainerInState(prev, activeId);

      const destinationContainer =
        over.data.current?.type === 'card'
          ? over.data.current?.listId
          : over.data.current?.type === 'list'
            ? over.data.current?.listId
            : findContainerInState(prev, overId);

      if (!sourceContainer || !destinationContainer) {
        return prev;
      }

      if (sourceContainer === destinationContainer) {
        const containerCards = prev[sourceContainer] || [];
        const activeIndex = containerCards.findIndex((card) => card.id === activeId);
        const overIndex = containerCards.findIndex((card) => card.id === overId);

        if (activeIndex === -1 || overIndex === -1 || activeIndex === overIndex) {
          return prev;
        }

        const reordered = arrayMove(containerCards, activeIndex, overIndex);

        const nextState = {
          ...prev,
          [sourceContainer]: normalizeCards(reordered, sourceContainer),
        };
        cardsStateRef.current = nextState;
        return nextState;
      }

      const sourceCards = prev[sourceContainer] || [];
      const destinationCards = prev[destinationContainer] || [];
      const activeIndex = sourceCards.findIndex((card) => card.id === activeId);

      if (activeIndex === -1) {
        return prev;
      }

      const overIndex = over.data.current?.type === 'card'
        ? destinationCards.findIndex((card) => card.id === overId)
        : destinationCards.length;
      const targetIndex = overIndex >= 0 ? overIndex : destinationCards.length;

      const nextSource = [...sourceCards];
      const [movedCard] = nextSource.splice(activeIndex, 1);

      const nextDestination = [...destinationCards];
      nextDestination.splice(targetIndex, 0, { ...movedCard, listId: destinationContainer });

      const nextState = {
        ...prev,
        [sourceContainer]: normalizeCards(nextSource, sourceContainer),
        [destinationContainer]: normalizeCards(nextDestination, destinationContainer),
      };
      cardsStateRef.current = nextState;
      return nextState;
    });
  };

  const persistCardMovement = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      await loadListsAndCards();
      return;
    }

    const currentState = cardsByList;
    const previousState = previousCardsStateRef.current;
    const activeId = String(active.id);
    
    const originalListId = 
      (active.data.current?.listId as string | undefined) ||
      findContainerInState(previousState, activeId);
    
    const destinationListId = findContainerInState(currentState, activeId);

    if (!destinationListId || !originalListId) {
      console.error('Missing container info', { destinationListId, originalListId });
      return;
    }

    if (destinationListId === originalListId) {
      const currentCards = currentState[destinationListId] || [];
      const previousCards = previousState[originalListId] || [];
      const currentIndex = currentCards.findIndex((card) => card.id === activeId);
      const previousIndex = previousCards.findIndex((card) => card.id === activeId);
      
      if (currentIndex === previousIndex && currentIndex >= 0) {
        return;
      }
    }

    const listsToSync = new Set([originalListId, destinationListId]);

    try {
      for (const listId of listsToSync) {
        await syncCardPositions(listId, currentState, previousState);
      }
    } catch (error) {
      console.error('Failed to persist card movement', error);
      alert('Error saving card move');
      await loadListsAndCards();
    }
  };

  const handleListDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    if (active.data.current?.type !== 'list') {
      return;
    }

    const oldIndex = lists.findIndex((list) => list.id === active.id);
    
    let targetListId: string;
    
    if (over.data.current?.type === 'card') {
      targetListId = over.data.current.listId;
    } else if (over.data.current?.type === 'list') {
      targetListId = over.data.current.listId;
    } else if (String(over.id).startsWith('droppable-cards-')) {
      targetListId = String(over.id).replace('droppable-cards-', '');
    } else {
      targetListId = String(over.id);
    }
    
    const newIndex = lists.findIndex((list) => list.id === targetListId);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }
    
    if (oldIndex === newIndex) {
      return;
    }

    const reorderedLists = arrayMove(lists, oldIndex, newIndex).map((list, index) => ({
      ...list,
      position: index,
    }));

    setLists(reorderedLists);

    if (boardId) {
      const order = reorderedLists.map(l => l.id);
      localStorage.setItem(`utasks_lists_order_${boardId}`, JSON.stringify(order));
    }

    try {
      const movedList = reorderedLists[newIndex];
      await listService.update(movedList.id, {
        name: movedList.name,
        boardId: movedList.boardId,
        position: newIndex, 
      });
    } catch (error) {
      console.error('Failed to update list:', error);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveListId(null);
    setActiveCardId(null);
    
    if (event.active.data.current?.type === 'card') {
      await persistCardMovement(event);
      return;
    }

    await handleListDragEnd(event);
  };

  if (!boardId) {
    return <div className="board-error">Missing board ID</div>;
  }

  if (isLoading && !board) {
    return <div className="board-loading">Loading board...</div>;
  }

  if (error && !board) {
    return (
      <div className="board-error">
        <p>{error}</p>
        <button onClick={() => navigate('/boards')} className="btn-back">
          Back to boards
        </button>
      </div>
    );
  }

  return (
    <div className="board-view">
      <div className="board-view-header">
        <button onClick={() => navigate('/boards')} className="btn-back-arrow">
          {'<< Back'}
        </button>
        <div className="board-info">
          <h2>{board?.title || 'Board'}</h2>
          {board?.description && (
            <p className="board-description-text">{board.description}</p>
          )}
        </div>
      </div>

      <div className="board-content">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleCardDragOver}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={lists.map((list) => list.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="lists-container">
              {lists.map((list) => (
                <SortableListView
                  key={list.id}
                  list={list}
                  cards={cardsByList[list.id] || []}
                  isCardsLoading={isLoadingCards}
                  onListDeleted={handleListDeleted}
                  onListUpdated={handleListUpdated}
                  onCardAdded={handleCardAdded}
                  onCardUpdated={handleCardUpdated}
                  onCardDeleted={handleCardDeleted}
                />
              ))}

              {showCreateList ? (
                <div className="create-list-wrapper">
                  <CreateListForm
                    boardId={boardId}
                    onListCreated={handleListCreated}
                    onCancel={() => setShowCreateList(false)}
                  />
                </div>
              ) : (
                <button
                  className="btn-add-list"
                  onClick={() => setShowCreateList(true)}
                >
                  + Add a list
                </button>
              )}
              </div>
            </SortableContext>
          
          <DragOverlay 
            dropAnimation={{
              duration: 250,
              easing: 'cubic-bezier(0.2, 0, 0, 1)',
            }}
          >
            {activeListId ? (
              <div className="drag-overlay drag-overlay-list">
                {(() => {
                  const activeList = lists.find(l => l.id === activeListId);
                  if (!activeList) return null;
                  return (
                    <div className="list-view">
                      <div className="list-header">
                        <div className="list-drag-handle">
                          <div className="drag-indicator">⋮⋮</div>
                        </div>
                        <h3 className="list-title">{activeList.name}</h3>
                        <div className="list-menu">
                          <button className="btn-menu">⋮</button>
                        </div>
                      </div>
                      <div className="list-sort-bar">
                        <label className="sort-label">Sort by:</label>
                        <select className="sort-select" disabled>
                          <option>Position</option>
                        </select>
                      </div>
                      <div className="list-cards" style={{ minHeight: '80px' }}>
                        {(cardsByList[activeListId] || []).length === 0 ? (
                          <div className="list-empty">
                            <p>No cards yet</p>
                          </div>
                        ) : (
                          <div style={{ opacity: 0.7 }}>
                            {(cardsByList[activeListId] || []).slice(0, 3).map(card => (
                              <div key={card.id} style={{ 
                                padding: '0.65rem', 
                                background: 'var(--cosmic-bg-tertiary)', 
                                borderRadius: 'var(--cosmic-radius-md)',
                                marginBottom: '0.5rem',
                                boxShadow: 'var(--cosmic-shadow-sm)',
                                border: '1px solid var(--cosmic-border-color)'
                              }}>
                                <div style={{ 
                                  fontSize: 'var(--cosmic-font-size-sm)', 
                                  fontWeight: 600,
                                  color: 'var(--cosmic-text-primary)'
                                }}>
                                  {card.title}
                                </div>
                              </div>
                            ))}
                            {(cardsByList[activeListId] || []).length > 3 && (
                              <div style={{ 
                                padding: '0.5rem', 
                                textAlign: 'center',
                                color: 'var(--cosmic-text-secondary)',
                                fontSize: 'var(--cosmic-font-size-xs)',
                                fontWeight: 600
                              }}>
                                +{(cardsByList[activeListId] || []).length - 3} more cards
                              </div>
                            )}
                          </div>
                        )}
                        <button className="btn-add-card" disabled>+ Add a card</button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : activeCardId ? (
              <div className="drag-overlay drag-overlay-card">
                {(() => {
                  let activeCard: Card | undefined;
                  for (const cards of Object.values(cardsByList)) {
                    activeCard = cards.find(c => c.id === activeCardId);
                    if (activeCard) break;
                  }
                  
                  if (!activeCard) return null;
                  
                  return (
                    <div style={{ 
                      background: 'var(--cosmic-bg-tertiary)', 
                      padding: '1rem',
                      borderRadius: 'var(--cosmic-radius-md)',
                      minHeight: '60px',
                      border: '1px solid var(--cosmic-border-color)'
                    }}>
                      <div style={{ 
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem'
                      }}>
                        <div className="card-drag-handle" style={{ pointerEvents: 'none' }}>
                          <div className="drag-indicator">⋮⋮</div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ 
                            margin: '0 0 0.35rem 0',
                            fontSize: 'var(--cosmic-font-size-sm)',
                            fontWeight: 600,
                            color: 'var(--cosmic-text-primary)',
                            fontFamily: 'var(--cosmic-font-body)'
                          }}>
                            {activeCard.title}
                          </p>
                          {activeCard.description && (
                            <p style={{ 
                              margin: '0.25rem 0',
                              fontSize: 'var(--cosmic-font-size-xs)',
                              color: 'var(--cosmic-text-secondary)',
                              lineHeight: 1.4
                            }}>
                              {activeCard.description.slice(0, 100)}
                              {activeCard.description.length > 100 && '...'}
                            </p>
                          )}
                          {(activeCard.priority || activeCard.dueDate) && (
                            <div style={{ 
                              display: 'flex',
                              gap: '0.5rem',
                              marginTop: '0.65rem',
                              flexWrap: 'wrap'
                            }}>
                              {activeCard.priority && (
                                <span style={{
                                  fontSize: 'var(--cosmic-font-size-xs)',
                                  padding: '0.25rem 0.65rem',
                                  borderRadius: 'var(--cosmic-radius-md)',
                                  fontWeight: 700,
                                  background: activeCard.priority === 1 ? 'var(--priority-high-bg)' : 
                                             activeCard.priority === 2 ? 'var(--priority-medium-bg)' : 'var(--priority-low-bg)',
                                  color: activeCard.priority === 1 ? 'var(--priority-high-color)' : 
                                         activeCard.priority === 2 ? 'var(--priority-medium-color)' : 'var(--priority-low-color)',
                                  boxShadow: activeCard.priority === 1 ? 'var(--priority-high-glow)' : 
                                            activeCard.priority === 2 ? 'var(--priority-medium-glow)' : 'var(--priority-low-glow)',
                                  border: '1px solid',
                                  borderColor: activeCard.priority === 1 ? 'rgba(255, 93, 143, 0.2)' : 
                                              activeCard.priority === 2 ? 'rgba(255, 200, 87, 0.2)' : 'rgba(53, 227, 255, 0.2)'
                                }}>
                                  {activeCard.priority === 1 ? '🔴 High' : 
                                   activeCard.priority === 2 ? '🟡 Medium' : '🟢 Low'}
                                </span>
                              )}
                              {activeCard.dueDate && (
                                <span style={{
                                  fontSize: 'var(--cosmic-font-size-xs)',
                                  padding: '0.25rem 0.65rem',
                                  borderRadius: 'var(--cosmic-radius-md)',
                                  background: 'rgba(53, 227, 255, 0.1)',
                                  color: 'var(--cosmic-accent-cyan)',
                                  fontWeight: 600,
                                  border: '1px solid rgba(53, 227, 255, 0.2)',
                                  boxShadow: '0 0 12px rgba(53, 227, 255, 0.2)'
                                }}>
                                  📅 {new Date(activeCard.dueDate).toLocaleDateString('en-US', {
                                    day: 'numeric',
                                    month: 'short'
                                  })}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {!isLoading && lists.length === 0 && !showCreateList && (
          <div className="board-empty-state">
            <p>This board contains no lists.</p>
            <p className="board-empty-hint">Add your first list to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoardView;
