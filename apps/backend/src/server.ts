import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';

// Import configurations
import { config } from './config/env.config';
import { sequelize, testConnection } from './config/database.config';
import { corsConfig } from './config/cors.config';
import { redisClient } from './config/redis.config';
import { logger, morganStream } from './shared/utils/logger.util';

// Import middlewares
import { errorHandler } from './shared/middlewares/error-handler.middleware';
import { notFound } from './shared/middlewares/not-found.middleware';

// Import routes
import authRoutes from './modules/auth/routes/auth.routes';
import adminRoutes from './modules/admin/routes/admin.routes';
import communityRoutes from './modules/community/routes/community.routes';

// Import models (to register them)
import './database/models/user.model';
import './database/models/announcement.model';

// Import community model associations
import './modules/community/models/associations';

// Initialize Express app
const app: Application = express();
const PORT = config.port;

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new SocketServer(httpServer, {
  cors: corsConfig,
});

// Make io accessible to routes
app.set('io', io);

// Security middlewares
app.use(helmet());
app.use(cors(corsConfig));
app.use(compression());

// Body parsing middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging middleware
if (config.env === 'development') {
  app.use(morgan('dev', { stream: morganStream }));
} else {
  app.use(morgan('combined', { stream: morganStream }));
}

// Health check endpoint
app.get('/health', async (req: Request, res: Response) => {
  const dbHealthy = await sequelize
    .authenticate()
    .then(() => true)
    .catch(() => false);

  const redisHealthy = redisClient.status === 'ready';

  const health = {
    status: dbHealthy && redisHealthy ? 'OK' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env,
    services: {
      database: dbHealthy ? 'connected' : 'disconnected',
      redis: redisHealthy ? 'connected' : 'disconnected',
    },
  };

  const statusCode = health.status === 'OK' ? 200 : 503;
  res.status(statusCode).json(health);
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'LOGOS Platform API - Christian Community',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      health: '/health',
      api: '/api/v1',
      auth: '/api/v1/auth',
      admin: '/api/v1/admin',
      communities: '/api/v1/communities',
    },
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/communities', communityRoutes);

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

// Socket.IO connection handling
io.on('connection', socket => {
  logger.info(`Client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });

  socket.on('join-user-room', (userId: string) => {
    socket.join(`user-${userId}`);
    logger.info(`User ${userId} joined their personal room`);
  });

  socket.on('join-community', (communityId: string) => {
    socket.join(`community-${communityId}`);
    logger.info(`User joined community: ${communityId}`);
  });

  socket.on('leave-community', (communityId: string) => {
    socket.leave(`community-${communityId}`);
    logger.info(`User left community: ${communityId}`);
  });
});

// Database connection and server start
const startServer = async () => {
  try {
    logger.info('🚀 Starting LOGOS Platform Backend...');

    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error('Database connection failed');
    }

    if (config.env === 'development') {
      await sequelize.sync({ alter: false });
      logger.info('✅ Database models synchronized');
    }

    httpServer.listen(PORT, () => {
      logger.info('='.repeat(60));
      logger.info(`✅ Server is running on port ${PORT}`);
      logger.info(`📝 Environment: ${config.env}`);
      logger.info(`🌐 API URL: http://localhost:${PORT}/api/v1`);
      logger.info(`💚 Health Check: http://localhost:${PORT}/health`);
      logger.info(`🔐 Auth Routes: http://localhost:${PORT}/api/v1/auth`);
      logger.info(`👑 Admin Routes: http://localhost:${PORT}/api/v1/admin`);
      logger.info(`🏘️  Community Routes: http://localhost:${PORT}/api/v1/communities`);
      logger.info('='.repeat(60));
    });
  } catch (error) {
    logger.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

process.on('uncaughtException', (error: Error) => {
  logger.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason: any) => {
  logger.error('💥 Unhandled Rejection:', reason);
  process.exit(1);
});

process.on('SIGTERM', async () => {
  logger.info('⚠️  SIGTERM received, closing server gracefully...');
  httpServer.close(async () => {
    try {
      await sequelize.close();
      await redisClient.quit();
      logger.info('✅ Server closed gracefully');
      process.exit(0);
    } catch (error) {
      logger.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  });
});

process.on('SIGINT', async () => {
  logger.info('⚠️  SIGINT received, closing server gracefully...');
  httpServer.close(async () => {
    try {
      await sequelize.close();
      await redisClient.quit();
      logger.info('✅ Server closed gracefully');
      process.exit(0);
    } catch (error) {
      logger.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  });
});

startServer();

export { app, io };
