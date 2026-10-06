import { Router } from 'express';
import {
  createCard,
  getCardById,
  updateCard,
  deleteCard,
  getCardsByListId,
} from '../controllers/cardController';

const router = Router();

router.post('/', createCard);

router.get('/list/:listId', getCardsByListId);

router.get('/:id', getCardById);

router.put('/:id', updateCard);

router.delete('/:id', deleteCard);

export default router;

