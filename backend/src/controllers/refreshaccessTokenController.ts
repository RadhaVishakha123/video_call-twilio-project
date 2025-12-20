import { Request, Response } from "express";
import RefreshToken from "..//models/refreshToken";
import {
  varifyRefreshToken,
  generateAccessToken,
} from "..//service/auth";
import { JwtPayloadCustom } from "../interfaces/jwtinterface";
import { IUser } from "..//interfaces/userinterface"
import { JwtPayload } from "../interfaces/jwtinterface";
/* ================= CUSTOM REQUEST WITH COOKIES ================= */
interface RefreshRequest extends Request {
  cookies: {
    refreshToken?: string;
  };
}

export const refreshaccessTokenController = async (
  req: RefreshRequest,
  res: Response
): Promise<Response> => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({ message: "No refresh token" });
    }

    const user = varifyRefreshToken(token) as JwtPayload | null;

    if (!user) {
      return res.status(403).json({ message: "Invalid token" });
    }

    // Check DB token exists
    const savedToken = await RefreshToken.findOne({ userId: user.id, token });
    if (!savedToken) {
      return res.status(403).json({ message: "Invalid token" });
    }

    // Create new access token
    const accessToken = generateAccessToken(user as JwtPayload);

    return res.json({ accessToken, user });
  } catch (err: any) {
    console.error("REFRESH ERROR:", err.message || err);
    return res.status(500).json({ message: "Server error" });
  }
};
