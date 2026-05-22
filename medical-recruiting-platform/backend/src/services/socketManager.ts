import { Server as SocketServer } from 'socket.io';

let io: SocketServer;
const userSockets = new Map<string, string>(); // userId -> socketId

export const SocketManager = {
  initialize(socketIo: SocketServer) {
    io = socketIo;
    io.on('connection', (socket) => {
      socket.on('authenticate', (token: string) => {
        // In production, verify JWT and map userId to socket
        // For now, simplified
      });

      socket.on('join', (userId: string) => {
        userSockets.set(userId, socket.id);
        socket.join(userId);
      });

      socket.on('disconnect', () => {
        for (const [uid, sid] of userSockets.entries()) {
          if (sid === socket.id) {
            userSockets.delete(uid);
            break;
          }
        }
      });
    });
  },

  emitToUser(userId: string, event: string, data: any) {
    if (io) {
      io.to(userId).emit(event, data);
    }
  },

  emitToRoom(room: string, event: string, data: any) {
    if (io) {
      io.to(room).emit(event, data);
    }
  },

  broadcast(event: string, data: any) {
    if (io) {
      io.emit(event, data);
    }
  }
};
