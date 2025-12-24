import { Request, Response } from 'express';
import { generateAccessToken } from '..//service/auth';
import { verifyRefreshToken } from '..//service/refresh-token';
import { pool } from '../config/db';


export const RefreshAccessTokenController = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const token = req.body.refreshToken;
    if (!token) {
      return res.status(401).json({ message: 'No refresh token' });
    }

    const refreshToken = await verifyRefreshToken(token);

    if (!refreshToken) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    // Create new access token
    const user: any = await pool.query('SELECT * FROM users WHERE id=$1', [
      refreshToken.user_id,
    ]);
    if (!user.rowCount) {
      return res.status(404).json({ message: 'User not found' });
    }

    const accessToken = generateAccessToken({
      _id: user._id,
      email: user.email,
      username: user.username,
    });

    return res.json({ accessToken, user });
  } catch (err: any) {
    console.error('REFRESH ERROR:', err.message || err);
    return res.status(500).json({ message: 'Server error' });
  }
};
