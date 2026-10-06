import { Router } from 'express';
import {
  createBoard,
  getBoardById,
  updateBoard,
  deleteBoard,
  getBoardsByUserId,
  getMyBoards,
} from '../controllers/boardController';
import { protect, optionalAuth } from '../middleware/authMiddleware';

const router = Router();

router.post('/', optionalAuth, createBoard);

router.get('/my', protect, getMyBoards);

router.get('/user/:userId', optionalAuth, getBoardsByUserId);

router.get('/:id', optionalAuth, getBoardById);

router.put('/:id', optionalAuth, updateBoard);

router.delete('/:id', optionalAuth, deleteBoard);

export default router;
