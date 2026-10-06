import { Router } from 'express';
import {
  createList,
  getListById,
  updateList,
  deleteList,
  getListsByBoardId,
} from '../controllers/listController';

const router = Router();

router.post('/', createList);

router.get('/board/:boardId', getListsByBoardId);

router.get('/:id', getListById);

router.put('/:id', updateList);

router.delete('/:id', deleteList);

export default router;

