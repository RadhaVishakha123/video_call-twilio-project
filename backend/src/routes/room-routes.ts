import { Router } from 'express';
import { JoinOrCreateRoom,GetActiveAndRecentRooms ,LeaveRoom,GetRoomUsers,JoinRoomParticipant} from '../controllers/room-controller';
const router = Router();
router.post('/', JoinOrCreateRoom);
router.get('/', GetActiveAndRecentRooms);
router.post('/leave',LeaveRoom)
router.post('/joinuser',GetRoomUsers)
router.post('/participant',JoinRoomParticipant)
export default router;