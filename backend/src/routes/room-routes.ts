import { Router } from 'express';
import { CreateRoom } from '../controllers/room-controller';

const router = Router();

router.post('/room', CreateRoom);

export default router;
