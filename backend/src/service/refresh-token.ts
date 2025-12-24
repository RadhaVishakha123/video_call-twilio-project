// utils/refresh-token.util.ts
import crypto from 'crypto';
import {pool} from '..//config/db'
const REFRESH_TOKEN_EXPIRES_IN_DAYS = 7;
export function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex'); // secure random string
}

// services/refresh-token.service.ts
export async function verifyRefreshToken(token: string) {
  if (!token) return null;

  const result = await pool.query(`SELECT user_id, expires_at
     FROM refresh_tokens
     WHERE refresh_token = $1`,
    [token]);

  if (!result.rowCount) return null;
  const refreshToken = result.rows[0];

  if (new Date(refreshToken.expires_at) < new Date()) {
    await pool.query(
      'DELETE FROM refresh_tokens WHERE refresh_token = $1',
      [token]
    );
    return null;
  }

  return refreshToken;
}
export async function createRefreshToken(
  userId: string
): Promise<string> {
  const token = generateRefreshToken();

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_IN_DAYS);

  await pool.query(
    `INSERT INTO refresh_tokens (user_id, refresh_token, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, token, expiresAt]
  );
  return token;

}
