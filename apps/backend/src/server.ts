import http from 'http';
import app from './app';
import { config } from './config/env.config';
import { logger } from './shared/utils/logger.util';
import { initializeSocketIO } from './config/socket.config';

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
export const io = initializeSocketIO(server);

// Make io available globally
(global as any).io = io;

const PORT = config.port || 3000;

server.listen(PORT, () => {
  logger.info(`🚀 Server is running on port ${PORT}`);
  logger.info(`🌐 Environment: ${config.nodeEnv}`);
  logger.info(`🔌 Socket.IO initialized`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('❌ Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

export default server;
