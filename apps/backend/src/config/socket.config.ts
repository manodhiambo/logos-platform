import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { logger } from '../shared/utils/logger.util';
import { verifyToken } from '../shared/utils/jwt.util';
import { setupMessageSocket } from '../sockets/message.socket';
import { setupGroupSocket } from '../sockets/group.socket';

export interface AuthenticatedSocket extends SocketIOServer {
  userId?: string;
  user?: any;
}

export const initializeSocketIO = (httpServer: HTTPServer) => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: [
        'http://localhost:3001',
        'http://localhost:3000',
        'https://logos-grace.org',
        process.env.FRONTEND_URL || '',
      ],
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  // Authentication middleware
  io.use(async (socket: any, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = verifyToken(token);
      socket.userId = decoded.userId;
      socket.user = decoded;

      logger.info(`✅ Socket authenticated: ${socket.userId}`);
      next();
    } catch (error) {
      logger.error('❌ Socket authentication failed:', error);
      next(new Error('Authentication failed'));
    }
  });

  // Connection handler
  io.on('connection', (socket: any) => {
    logger.info(`🔌 User connected: ${socket.userId}`);

    // Join user's personal room
    socket.join(`user:${socket.userId}`);

    // Handle user online status
    socket.on('user:online', () => {
      io.emit('user:status', { userId: socket.userId, status: 'online' });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`🔌 User disconnected: ${socket.userId}`);
      io.emit('user:status', { userId: socket.userId, status: 'offline' });
    });
  });

  // Setup message socket handlers
  setupMessageSocket(io);

  // Setup group socket handlers
  setupGroupSocket(io);

  return io;
};

export default initializeSocketIO;
