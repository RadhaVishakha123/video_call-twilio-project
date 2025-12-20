import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
// import { IUser } from "..//interfaces/userinterface"

dotenv.config();

/* ================= ENV ================= */
const JWT_SECRET = process.env.SECRET as string;

if (!JWT_SECRET) {
  throw new Error("JWT SECRET is not defined in environment variables");
}

/* ================= TOKEN GENERATORS ================= */
export function generateAccessToken(user:JwtPayload ): string {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
}

export function generateRefreshToken(user: JwtPayload): string {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

/* ================= TOKEN VERIFY ================= */
export function varifyAccessToken(
  token: string
): JwtPayload | null {
  try {
    if (!token || typeof token !== "string") return null;
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (err: any) {
    console.error("JWT ACCESS ERROR:", err.message);
    return null;
  }
}

export function varifyRefreshToken(
  token: string
):JwtPayload | null {
  try {
    if (!token || typeof token !== "string") return null;
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (err: any) {
    console.error("JWT REFRESH ERROR:", err.message);
    return null;
  }
}
