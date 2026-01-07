import { GetIo } from './socket';
import { RoomUser } from '../interfaces/room-interface';
export const EmitRoomStatus = (roomName: string, isActive: boolean) => {
  const io = GetIo();
  io.emit('room-status-updated', {
    roomName,
    is_active: isActive,
  });
};
export const EmitRoomUsers = (roomName: string, users: RoomUser[]) => {
  const io = GetIo();
  io.emit('room-users-updated', {
    roomName,
    users,
  });
};
