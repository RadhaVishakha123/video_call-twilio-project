import { Router } from 'express';
import { GenerateToken } from '../controllers/token-controller';
const router = Router();
router.get('/token', GenerateToken);
export default router;
