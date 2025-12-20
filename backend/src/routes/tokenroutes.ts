import { Router } from "express";
import { generateToken } from "../controllers/tokencontroller";
import { authenticate } from "../middleware/authmiddleware";
const router=Router();
router.get("/token",authenticate,generateToken)
export default router;