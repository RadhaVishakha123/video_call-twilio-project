import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { pool } from '..//config/db';
import { GenerateAccessToken } from '..//service/auth';
import { RegisterPayload, LoginPayload } from '..//interfaces/user-interface';
import { JwtPayload } from '../interfaces/jwt-interface';
import {
  VerifyRefreshToken,
  CreateRefreshToken,
} from '..//service/refresh-token';
dotenv.config();

/* ================= REGISTER ================= */
export async function RegisterUser(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { username, email, password } = req.body as RegisterPayload;
    if (!email || !password || !username) {
      return res
        .status(400)
        .json({ message: 'Email, username & password required' });
    }

    const exist = await pool.query('SELECT id FROM users WHERE email=$1', [
      email,
    ]);
    if (exist.rowCount) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const result = await pool.query<JwtPayload>(
      `INSERT INTO users (username, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, username, email`,
      [username, email, hashPassword]
    );
    const user: JwtPayload = result.rows[0];

    return res.status(201).json({ message: 'User registered', user });
  } catch (err: any) {
    return res.status(500).json({
      message: 'Error',
      error: err.message,
    });
  }
}

/* ================= LOGIN ================= */
export async function LoginUser(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { email, password } = req.body as LoginPayload;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email & password required' });
    }

    const result = await pool.query(
      'SELECT id, username, email, password FROM users WHERE email=$1',
      [email]
    );
    if (result.rowCount == 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    const user = result.rows[0];

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Wrong password' });
    }

    const accessToken = await GenerateAccessToken({
      id: user.id,
      email: user.email,
      username: user.username,
    });

    const refreshToken = await CreateRefreshToken(user.id);

    return res.status(200).json({
      message: 'Login success',
      accessToken,
      refreshToken,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err: any) {
    console.error('LOGIN ERROR:', err);
    return res.status(500).json({
      message: 'Error',
      error: err.message,
    });
  }
}

/* ================= LOGOUT ================= */
export async function LogoutUser(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const refreshToken = req.body.refreshToken as string | undefined;

    if (refreshToken) {
      const payload = await VerifyRefreshToken(refreshToken);

      if (payload?.userId) {
        await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [
          payload.userId,
        ]);
      }
    }

    return res.json({ message: 'Logged out' });
  } catch (err: any) {
    console.error('LOGOUT ERROR:', err);
    return res.status(500).json({
      message: 'Logout failed',
      error: err.message,
    });
  }
}
