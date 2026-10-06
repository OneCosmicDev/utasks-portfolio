import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { boardService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { ConfirmModal } from '../common';
import type { Board } from '../../types';
import './BoardList.css';

interface BoardListProps {
  onCreateBoard: () => void;
}

const BoardList: React.FC<BoardListProps> = ({ onCreateBoard }) => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [renameError, setRenameError] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadBoards();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  const loadBoards = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    const response = await boardService.getByUserId(user.id);

    if (response.success && response.data) {
      setBoards(response.data);
    } else {
      setError(response.message || 'Error loading boards');
    }

    setIsLoading(false);
  };

  const handleBoardClick = (boardId: string) => {
    if (editingBoardId === boardId) return;
    navigate(`/board/${boardId}`);
  };

  const handleMenuToggle = (boardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === boardId ? null : boardId);
  };

  const handleRenameClick = (board: Board, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingBoardId(board.id);
    setEditTitle(board.title);
    setRenameError(null);
    setOpenMenuId(null);
  };

  const handleTitleChange = (value: string) => {
    setEditTitle(value);
    setRenameError(null);
  };

  const handleCancelEdit = () => {
    setEditingBoardId(null);
    setEditTitle('');
    setRenameError(null);
  };

  const handleRenameSubmit = async (board: Board) => {
    if (!editTitle.trim() || editTitle.trim() === board.title) {
      handleCancelEdit();
      return;
    }

    if (editTitle.trim().length < 3) {
      setRenameError('Title must contain at least 3 characters');
      return;
    }

    if (!user?.id) {
      setRenameError('User not logged in');
      return;
    }

    const updateData = {
      name: editTitle.trim(),
      description: board.description,
      userId: user.id,
    };

    const response = await boardService.update(board.id, updateData);

    if (response.success && response.data) {
      setBoards(prevBoards => {
        const updatedBoards = prevBoards.map(b => b.id === board.id ? response.data! : b);
        return updatedBoards;
      });
      handleCancelEdit();
    } else {
      const errorDetails = response.errors 
        ? response.errors.map(e => e.message).join(', ')
        : response.message || 'Error updating board';
      
      console.error('❌ Update error:', errorDetails);
      setRenameError(errorDetails);
    }
  };

  const handleDeleteClick = (boardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDeleteId(boardId);
    setOpenMenuId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDeleteId) return;

    const response = await boardService.delete(confirmDeleteId);
    
    if (response.success) {
      setBoards(boards.filter(b => b.id !== confirmDeleteId));
      setConfirmDeleteId(null);
    } else {
      alert(response.message || 'Error deleting board');
      setConfirmDeleteId(null);
    }
  };

  if (isLoading) {
    return <div className="boards-loading">Loading boards...</div>;
  }

  if (error) {
    return (
      <div className="boards-error">
        <p>{error}</p>
        <button onClick={loadBoards} className="btn-retry">Retry</button>
      </div>
    );
  }

  return (
    <div className="boards-container">
      <div className="boards-header">
        <h2>My Boards</h2>
        <button onClick={onCreateBoard} className="btn-create-board">
          + New board
        </button>
      </div>

      {boards.length === 0 ? (
        <div className="boards-empty">
          <p>No boards yet.</p>
          <p className="boards-empty-hint">Create your first board to get started!</p>
        </div>
      ) : (
        <div className="boards-grid">
          {boards.map(board => (
            <div
              key={board.id}
              className={`board-card ${editingBoardId === board.id ? 'editing' : ''}`}
              onClick={() => handleBoardClick(board.id)}
            >
              <div className="board-card-content">
                {editingBoardId === board.id ? (
                  <div className="board-edit-form" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => {
                        handleTitleChange(e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleRenameSubmit(board);
                        } else if (e.key === 'Escape') {
                          handleCancelEdit();
                        }
                      }}
                      className={`board-title-edit ${renameError ? 'error' : ''}`}
                      autoFocus
                    />
                    {renameError && (
                      <div className="board-rename-error">{renameError}</div>
                    )}
                    <div className="board-edit-actions">
                      <button
                        type="button"
                        onClick={() => handleRenameSubmit(board)}
                        className="btn-save-edit"
                      >
                        ✓
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="btn-cancel-edit"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ) : (
                  <h3 className="board-title">{board.title}</h3>
                )}
                {board.description && editingBoardId !== board.id && (
                  <p className="board-description">{board.description}</p>
                )}
              </div>
              
              <div className="board-menu" ref={openMenuId === board.id ? menuRef : null}>
                <button
                  className="btn-board-menu"
                  onClick={(e) => handleMenuToggle(board.id, e)}
                  title="Options"
                >
                  ⋮
                </button>
                {openMenuId === board.id && (
                  <div className="board-menu-dropdown">
                    <button onClick={(e) => handleRenameClick(board, e)}>
                      ✏️ Rename
                    </button>
                    <button 
                      className="btn-delete" 
                      onClick={(e) => handleDeleteClick(board.id, e)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmDeleteId && (
        <ConfirmModal
          isOpen={true}
          title="Delete board"
          message="Are you sure you want to delete this board? All lists and cards will also be deleted."
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmDeleteId(null)}
          confirmText="Delete"
          cancelText="Cancel"
          isDangerous
        />
      )}
    </div>
  );
};

export default BoardList;

