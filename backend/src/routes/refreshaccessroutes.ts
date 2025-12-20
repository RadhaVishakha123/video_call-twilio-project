import { Router } from "express";
import { refreshaccessTokenController } from "..//controllers/refreshaccessTokenController";

const router = Router();

router.post("/", refreshaccessTokenController);

export default router;
