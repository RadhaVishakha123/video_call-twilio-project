// utils/refresh-token.util.ts
import crypto from 'crypto';
import RefreshToken from '..//models/refresh-token';
import mongoose from 'mongoose';
const REFRESH_TOKEN_EXPIRES_IN_DAYS = 7;
export function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex'); // secure random string
}

// services/refresh-token.service.ts
export async function varifyRefreshToken(token: string) {
  if (!token) return null;

  const refreshToken = await RefreshToken.findOne({ token });

  if (!refreshToken) return null;

  if (refreshToken.expiresAt < new Date()) {
    await RefreshToken.deleteOne({ _id: refreshToken._id });
    return null;
  }

  return refreshToken;
}
export async function createRefreshToken(
  userId: mongoose.Types.ObjectId
): Promise<string> {
  const token = generateRefreshToken();

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_IN_DAYS);

  await RefreshToken.create({
    userId,
    token,
    expiresAt,
  });

  return token;
}
