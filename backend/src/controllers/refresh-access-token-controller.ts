import { Request, Response } from 'express';
import { GenerateAccessToken } from '..//service/auth';
import { VerifyRefreshToken } from '..//service/refresh-token';
import { pool } from '../config/db';
import { JwtPayload } from '..//interfaces/jwt-interface';
export const RefreshAccessTokenController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const token: string = req.body.refreshToken;
    if (!token) {
      return res.status(401).json({ message: 'No refresh token' });
    }

    const refreshToken = await VerifyRefreshToken(token);

    if (!refreshToken) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    // Create new access token
    const result = await pool.query('SELECT * FROM users WHERE id=$1', [
      refreshToken.user.id,
    ]);
    if (!result.rowCount) {
      return res.status(404).json({ message: 'User not found' });
    }
    const user: JwtPayload = result.rows[0];
    const accessToken = GenerateAccessToken({
      id: user.id,
      email: user.email,
      username: user.username,
    });

    return res.json({ accessToken, user });
  } catch (err: any) {
    console.error('REFRESH ERROR:', err.message || err);
    return res.status(500).json({ message: 'Server error' });
  }
};
