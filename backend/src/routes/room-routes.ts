import { Router } from 'express';
import { JoinOrCreateRoom,getActiveAndRecentRooms } from '../controllers/room-controller';
const router = Router();
router.post('/', JoinOrCreateRoom);
router.get('/', getActiveAndRecentRooms);
export default router;
