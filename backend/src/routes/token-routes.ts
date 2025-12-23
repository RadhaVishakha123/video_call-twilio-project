import { Router } from 'express';
import { generateToken } from '../controllers/token-controller';
import { authenticate } from '../middleware/auth-middleware';
const router = Router();
router.get('/token', authenticate, generateToken);
export default router;
