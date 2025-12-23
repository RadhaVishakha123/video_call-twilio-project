import { AccessToken, VideoGrant } from '../config/twilio';
import { Request, Response } from 'express';
export const generateToken = (req: Request, res: Response) => {
  const { identity } = req.body;
  if (!identity) {
    return res.status(400).json({ error: 'Identity is required' });
  }
  const token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_API_KEY!,
    process.env.TWILIO_API_SECRET!,
    {
      identity,
    }
  );
  const videoGrant = new VideoGrant();
  token.addGrant(videoGrant);
  const accessToken = token.toJwt(); //Converts token into a JWT string
  res.status(200).json({ accessToken });
};
