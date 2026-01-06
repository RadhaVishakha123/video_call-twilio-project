import { GetIo } from './socket';
export const EmitRoomStatus = (roomName: string, isActive: boolean) => {
  const io = GetIo();
  io.emit('room-status-updated', {
    roomName,
    is_active: isActive,
  });
};
export const EmitRoomUsers = (roomName: string, users: string[]) => {
  const io = GetIo();
  io.emit('room-users-updated', {
    roomName,
    users,
  });
};
