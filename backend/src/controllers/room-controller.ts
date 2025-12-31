import { Response } from 'express';
import { twilioClient } from '../config/twilio';
import { pool } from '../config/db';
import { AuthRequest } from '../interfaces/jwt-interface';
export const JoinOrCreateRoom = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { roomName } = req.body;

    if (!roomName) {
      res.status(400).json({ error: 'Room name is required' });
      return;
    }
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const userId = req.user?.id;
    const roomResult = await pool.query('SELECT * FROM rooms WHERE name = $1', [
      roomName,
    ]);
    let roomId: string;
    if (roomResult.rows.length == 0) {
      await twilioClient.video.v1.rooms.create({
        uniqueName: roomName,
        type: 'group',
      });

      const createdRoom = await pool.query(
        'INSERT INTO rooms (name, created_by) VALUES ($1, $2) RETURNING id',
        [roomName, userId]
      );
      roomId = createdRoom.rows[0].id;
    } else {
      roomId = roomResult.rows[0].id;
    }
    await pool.query(
      `
      INSERT INTO room_participants (room_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT (room_id, user_id) DO NOTHING
      `,
      [roomId, userId]
    );
    res.status(200).json({
      message: 'Joined room successfully',
      roomName,
    });
  } catch (error: any) {
    console.error('Join/Create room error:', error);
    res.status(500).json({ error: 'Failed to join room' });
  }
};
export const getActiveAndRecentRooms = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const userId = req.user?.id;
  try {
    const result = await pool.query(
      `SELECT DISTINCT r.id, r.name, r.is_active, r.created_at
    FROM rooms r
    JOIN room_participants rp ON rp.room_id = r.id
    WHERE rp.user_id = $1
    ORDER BY r.created_at DESC`,
      [userId]
    );
    res.status(200).json({ rooms: result.rows });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ error: 'Failed to retrieve rooms' });
  }
};
