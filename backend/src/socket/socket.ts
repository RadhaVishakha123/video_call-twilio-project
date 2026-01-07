import { Server } from 'socket.io';
let io: Server;
export const InitSocket = (httpServer: any) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
    },
  });
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });
};
export const GetIo = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};
