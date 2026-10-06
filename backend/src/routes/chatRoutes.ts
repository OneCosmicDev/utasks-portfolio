import { Router } from 'express';
import {
  getAllUsers,
  getConversations,
  getConversation,
  markAsRead,
} from '../controllers/chatController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

router.get('/users', getAllUsers);

router.get('/conversations', getConversations);

router.get('/messages/:userId', getConversation);

router.put('/read/:messageId', markAsRead);

export default router;

