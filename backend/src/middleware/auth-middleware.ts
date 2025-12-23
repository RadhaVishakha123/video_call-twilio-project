import { Request, Response, NextFunction } from 'express';
import { varifyAccessToken } from '../service/auth';
import { JwtPayload } from '../interfaces/jwt-interface';
import { AuthRequest } from '../interfaces/jwt-interface';

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const token = authHeader.split(' ')[1];

  const decoded = varifyAccessToken(token) as JwtPayload | null;

  if (!decoded) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }

  req.user = decoded; // Type matches now
  next();
};
