import { Router } from "express";
import { RefreshAccessTokenController } from "..//controllers/refresh-access-token-controller";

const router = Router();

router.post("/", RefreshAccessTokenController);

export default router;
