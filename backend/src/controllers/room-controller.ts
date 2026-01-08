import { Response } from 'express';
import { twilioClient } from '../config/twilio';
import { pool } from '../config/db';
import { AuthRequest } from '../interfaces/jwt-interface';
import { EmitRoomStatus, EmitRoomUsers } from '../socket/emit';
import { RoomUser } from '../interfaces/room-interface';
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

    const userId = req.user.id;

    //  Fetch DB room
    const roomResult = await pool.query(
      'SELECT id, room_sid FROM rooms WHERE name = $1',
      [roomName]
    );

    //  Fetch or create Twilio room SAFELY
    let twilioRoom;
    try {
      twilioRoom = await twilioClient.video.v1.rooms(roomName).fetch();
    } catch (e: any) {
      if (e.code === 20404) {
        twilioRoom = await twilioClient.video.v1.rooms.create({
          uniqueName: roomName,
          type: 'group',
        });
      } else {
        throw e;
      }
    }

    //  Save / sync roomSid
    let roomId: string;

    if (roomResult.rows.length === 0) {
      const createdRoom = await pool.query(
        `INSERT INTO rooms (name, created_by, room_sid)
VALUES ($1, $2, $3)
ON CONFLICT (name) DO NOTHING
RETURNING id;
`,
        [roomName, userId, twilioRoom.sid]
      );
      roomId = createdRoom.rows[0].id;
    } else {
      roomId = roomResult.rows[0].id;
      await pool.query('UPDATE rooms SET room_sid = $1 WHERE id = $2', [
        twilioRoom.sid,
        roomId,
      ]);
    }

    //  Mark active
    await pool.query('UPDATE rooms SET is_active = true WHERE id = $1', [
      roomId,
    ]);

    await UpdateRoomActiveStatus(roomId, roomName);
    const users = await getRoomUsers(roomId);
    EmitRoomUsers(roomName, users);

    res.status(200).json({
      message: 'Room ready',
      roomId,
      roomSid: twilioRoom.sid,
    });
  } catch (error: any) {
    console.error('Join/Create room error:', error);
    res.status(500).json({ error: 'Failed to join room' });
  }
};

export const JoinRoomParticipant = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { roomName } = req.body;

    if (!req.user || !roomName) {
      res.status(400).json({ error: 'Invalid request' });
      return;
    }

    const userId = req.user.id;

    const roomRes = await pool.query(`SELECT id FROM rooms WHERE name = $1`, [
      roomName,
    ]);

    if (roomRes.rows.length === 0) {
      res.status(200).json({ error: 'Room not found' });
      return;
    }

    const roomId = roomRes.rows[0].id;
    // Check if user already joined
    const existing = await pool.query(
      `SELECT id, joined_at
       FROM room_participants
       WHERE room_id = $1 AND user_id = $2`,
      [roomId, userId]
    );

    if (existing.rows.length > 0) {
      res.status(200).json({
        alreadyJoined: true,
        message: 'User already joined from another device',
      });
      return;
    }

    await pool.query(
      `
      INSERT INTO room_participants (room_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT (room_id, user_id) DO NOTHING
      `,
      [roomId, userId]
    );

    await UpdateRoomActiveStatus(roomId, roomName);

    const users: RoomUser[] = await getRoomUsers(roomId);
    EmitRoomUsers(roomName, users);

    res.status(200).json({ message: 'User joined room', users });
  } catch (err) {
    console.error('JoinRoomParticipant error:', err);
    res.status(500).json({ error: 'Failed to join room' });
  }
};

export const GetActiveAndRecentRooms = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const userId = req.user?.id;
  try {
    // const result = await pool.query(
    //   `SELECT DISTINCT r.id, r.name, r.is_active, r.created_at
    // FROM rooms r
    // JOIN room_participants rp ON rp.room_id = r.id
    // WHERE rp.user_id = $1
    // ORDER BY r.created_at DESC`,
    //   [userId]
    // );
    console.log('user id:', userId);
    const result = await pool.query(
      `SELECT  id, name, is_active, created_by FROM rooms`
    );
    res.status(200).json({ rooms: result.rows });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ error: 'Failed to retrieve rooms' });
  }
};
export const LeaveRoom = async (
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

    const userId = req.user.id;

    //  Get room ID
    const roomResult = await pool.query(
      'SELECT id FROM rooms WHERE name = $1',
      [roomName]
    );

    if (roomResult.rows.length === 0) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    const roomId = roomResult.rows[0].id;

    // Remove participant
    await pool.query(
      `
      DELETE FROM room_participants
      WHERE room_id = $1 AND user_id = $2
      `,
      [roomId, userId]
    );

    await UpdateRoomActiveStatus(roomId as string, roomName);
    const user: RoomUser[] = await getRoomUsers(roomId);
    EmitRoomUsers(roomName, user);

    res.status(200).json({
      message: 'Left room successfully',
      roomName,
    });
  } catch (error) {
    console.error('Leave room error:', error);
    res.status(500).json({ error: 'Failed to leave room' });
  }
};
export const UpdateRoomActiveStatus = async (
  roomId: string,
  roomName: string
) => {
  // Count participants
  const countRes = await pool.query(
    `
    SELECT COUNT(*)::int AS count
    FROM room_participants
    WHERE room_id = $1
    `,
    [roomId]
  );

  const participantCount: number = countRes.rows[0].count;
  const newIsActive = participantCount >= 2;

  // Get current status
  const roomRes = await pool.query(
    `
    SELECT is_active
    FROM rooms
    WHERE id = $1
    `,
    [roomId]
  );

  if (roomRes.rows.length === 0) return;

  const currentIsActive = roomRes.rows[0].is_active;

  //  Update + emit ONLY if changed
  if (currentIsActive !== newIsActive) {
    await pool.query(
      `
      UPDATE rooms
      SET is_active = $2
      WHERE id = $1
      `,
      [roomId, newIsActive]
    );

    EmitRoomStatus(roomName, newIsActive);
  }
};
const getRoomUsers = async (roomId: string) => {
  const res = await pool.query(
    `
    SELECT rp.user_id, u.username
    FROM room_participants rp
    JOIN users u ON u.id = rp.user_id
    WHERE rp.room_id = $1
    `,
    [roomId]
  );

  return res.rows.map((r) => ({
    userId: r.user_id,
    username: r.username,
  }));
};

export const GetRoomUsers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { roomName } = req.body;

    if (!roomName) {
      res.status(400).json({ error: 'Room name required' });
      return;
    }

    const roomRes = await pool.query('SELECT id FROM rooms WHERE name = $1', [
      roomName,
    ]);

    if (roomRes.rows.length === 0) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    const roomId = roomRes.rows[0].id;

    const users: RoomUser[] = await getRoomUsers(roomId);

    //  Emit for OTHER clients
    EmitRoomUsers(roomName, users);

    //  Return for current client
    res.status(200).json({ users });
  } catch (err) {
    console.error('GetRoomUsers error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};
