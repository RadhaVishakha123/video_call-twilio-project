import { Request, Response } from "express";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

import User from "..//models/auth";
import RefreshToken from "../models/refreshToken";
import {
  generateAccessToken,
  generateRefreshToken,
  varifyRefreshToken,
} from "..//service/auth";

dotenv.config();

/* ================= REGISTER ================= */
export async function registerUser(req: Request, res: Response): Promise<Response> {
  try {
    const { username, email, password } = req.body as {
      username?: string;
      email?: string;
      password?: string;
    };

    if (!email || !password || !username) {
      return res.status(400).json({ message: "Email, username & password required" });
    }

    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashPassword,
    });

    return res.status(201).json({ message: "User registered", user });
  } catch (err: any) {
    return res.status(500).json({
      message: "Error",
      error: err.message,
    });
  }
}

/* ================= LOGIN ================= */
export async function loginUser(req: Request, res: Response): Promise<Response> {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return res.status(400).json({ message: "Email & password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Wrong password" });
    }

    const accessToken = await generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);

    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return res.status(200).json({
      message: "Login success",
      accessToken,
      refreshToken,
      user,
    });
  } catch (err: any) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({
      message: "Error",
      error: err.message,
    });
  }
}

/* ================= LOGOUT ================= */
export async function logoutUser(req: Request, res: Response): Promise<Response> {
  try {
    const refreshToken = req.cookies?.refreshToken as string | undefined;

    if (refreshToken) {
      const user = varifyRefreshToken(refreshToken) as { id: string };
      await RefreshToken.deleteMany({ userId: user.id });
    }

    return res.json({ message: "Logged out" });
  } catch (err: any) {
    console.error("LOGOUT ERROR:", err);
    return res.status(500).json({
      message: "Logout failed",
      error: err.message,
    });
  }
}
