import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../config';

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(API_BASE_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};
