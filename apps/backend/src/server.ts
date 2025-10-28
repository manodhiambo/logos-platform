import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { sequelize } from './config/database.config';
import { logger } from './shared/utils/logger.util';
import { errorHandler } from './shared/middlewares/error-handler.middleware';

// Import routes
import authRoutes from './modules/auth/routes/auth.routes';
import communityRoutes from './modules/community/routes/community.routes';
import aiRoutes from './modules/ai-assistant/routes/ai.routes';
import bibleRoutes from './modules/bible/routes/bible.routes';
import postRoutes from './modules/posts/routes/post.routes';
import prayerRoutes from './modules/prayer/routes/prayer.routes';
import devotionalRoutes from './modules/devotional/routes/devotional.routes';
import notificationRoutes from './modules/notifications/routes/notification.routes';

// Import model associations
import './modules/community/models/associations';
import './modules/ai-assistant/models/associations';
import './modules/posts/models/associations';
import './modules/prayer/models/associations';
import './modules/devotional/models/associations';
import './modules/notifications/models/associations';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware - CORS configured for frontend
app.use(cors({
  origin: ['http://localhost:3001', 'http://127.0.0.1:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'LOGOS Platform API is running!',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/communities', communityRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/bible', bibleRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/prayers', prayerRoutes);
app.use('/api/v1/devotionals', devotionalRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await sequelize.authenticate();
    logger.info('✅ Database connected successfully');

    // Start listening
    app.listen(PORT, () => {
      logger.info(`🚀 Server is running on port ${PORT}`);
      logger.info(`📍 API Base URL: http://localhost:${PORT}/api/v1`);
      logger.info(`\n📋 Available Endpoints:`);
      logger.info(`   ✝️  Health Check: http://localhost:${PORT}/health`);
      logger.info(`   🔐 Auth Routes: http://localhost:${PORT}/api/v1/auth`);
      logger.info(`   👥 Community Routes: http://localhost:${PORT}/api/v1/communities`);
      logger.info(`   🤖 AI Routes: http://localhost:${PORT}/api/v1/ai`);
      logger.info(`   📖 Bible Routes: http://localhost:${PORT}/api/v1/bible`);
      logger.info(`   💬 Posts Routes: http://localhost:${PORT}/api/v1/posts`);
      logger.info(`   🙏 Prayer Routes: http://localhost:${PORT}/api/v1/prayers`);
      logger.info(`   📖 Devotional Routes: http://localhost:${PORT}/api/v1/devotionals`);
      logger.info(`   🔔 Notification Routes: http://localhost:${PORT}/api/v1/notifications`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
