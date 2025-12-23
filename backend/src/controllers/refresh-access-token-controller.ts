import { Request, Response } from 'express';
import { generateAccessToken } from '..//service/auth';
import { varifyRefreshToken } from '..//service/refresh-token';
import User from '..//models/auth';
/* ================= CUSTOM REQUEST WITH COOKIES ================= */
interface RefreshRequest extends Request {
  cookies: {
    refreshToken?: string;
  };
}

export const RefreshAccessTokenController = async (
  req: RefreshRequest,
  res: Response
): Promise<Response> => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({ message: 'No refresh token' });
    }

    const refreshToken = await varifyRefreshToken(token);

    if (!refreshToken) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    // Create new access token
    const user: any = await User.findById(refreshToken.userId);
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
