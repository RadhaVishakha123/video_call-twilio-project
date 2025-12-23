import dotenv from "dotenv";
dotenv.config();
import jwt, { JwtPayload } from "jsonwebtoken";

/* ================= ENV ================= */
const JWT_SECRET = process.env.JWT_SECRET as string;

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


