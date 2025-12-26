import { v4 as uuidv4 } from 'uuid';
import {pool} from '..//config/db'
import { IRefreshToken } from '../interfaces/token-interface';
const REFRESH_TOKEN_EXPIRES_IN_DAYS = 7;
export function GenerateRefreshToken(): string {
  return uuidv4()
}
export async function VerifyRefreshToken(token: string) {
  if (!token) return null;

  const result = await pool.query<IRefreshToken>(`SELECT user_id, expires_at, refresh_token
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
export async function CreateRefreshToken(
  userId: string
): Promise<string> {
  const token = GenerateRefreshToken();
 
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_IN_DAYS);

  await pool.query(
    `INSERT INTO refresh_tokens (user_id, refresh_token, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, token, expiresAt]
  );
  return token;

}

