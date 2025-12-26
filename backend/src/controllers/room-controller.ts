import { Request, Response } from 'express';
import { twilioClient } from '../config/twilio';

export const createRoom = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { roomName } = req.body;

  if (!roomName) {
    res.status(400).json({ error: 'Room name is required' });
    return;
  }

  try {
    const room = await twilioClient.video.v1.rooms.create({
      uniqueName: roomName,
      type: 'group', // or "peer-to-peer"
    });

    res.status(201).json({
      sid: room.sid,
      name: room.uniqueName,
      status: room.status,
    });
  } catch (error: any) {
    if (error.code === 53113) {
      // Room already exists
      const room = await twilioClient.video.v1.rooms(roomName).fetch();
      res.json(room);
    } else {
      res.status(500).json({ error: 'Failed to create room' });
    }
  }
};
