import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
} from "../controllers/auth-controller";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.delete("/logout", logoutUser);

export default router;
