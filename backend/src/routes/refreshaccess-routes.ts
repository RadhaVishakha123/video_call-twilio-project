import { Router } from "express";
import { refreshaccessTokenController } from "..//controllers/refresh-access-token-controller";

const router = Router();

router.post("/", refreshaccessTokenController);

export default router;
