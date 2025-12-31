import { Router } from 'express';
import { generateToken } from '../controllers/token-controller';
const router = Router();
router.post('/', generateToken);
export default router;
