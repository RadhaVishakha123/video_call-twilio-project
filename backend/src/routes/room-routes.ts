import { Router } from 'express';
import { createRoom } from '../controllers/room-controller';
import { authenticate } from '../middleware/auth-middleware';

const router = Router();

router.post('/room', authenticate, createRoom);

export default router;
