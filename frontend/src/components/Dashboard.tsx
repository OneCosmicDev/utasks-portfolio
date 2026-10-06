import { useState } from 'react';
import { BoardList, CreateBoardModal } from './boards';
import type { Board } from '../types';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [boards, setBoards] = useState<Board[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleBoardCreated = (newBoard: Board) => {
    setBoards([...boards, newBoard]);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-content">
        <BoardList 
          key={refreshKey}
          onCreateBoard={() => setShowCreateModal(true)} 
        />
      </div>

      {showCreateModal && (
        <CreateBoardModal
          onClose={() => setShowCreateModal(false)}
          onBoardCreated={handleBoardCreated}
        />
      )}
    </div>
  );
};

export default Dashboard;

