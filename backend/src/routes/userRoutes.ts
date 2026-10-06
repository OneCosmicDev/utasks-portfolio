import { Router } from 'express';
import {
  legacyRegister,
  legacyGetUserById,
  legacyDeleteUser,
} from '../controllers/authController';

const router = Router();

router.post('/register', legacyRegister);

router.get('/:id', legacyGetUserById);

router.delete('/:id', legacyDeleteUser);

export default router;
