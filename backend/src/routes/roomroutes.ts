import { Router } from "express";
import { createRoom } from "../controllers/roomcontroller";
import { authenticate } from "../middleware/authmiddleware";

const router = Router();

router.post("/room", authenticate, createRoom);

export default router;
