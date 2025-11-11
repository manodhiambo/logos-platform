import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { config } from './config/env.config';
import { sequelize } from './config/database.config';
import { logger } from './shared/utils/logger.util';
import { errorHandler } from './shared/middlewares/error-handler.middleware';

// Import models to initialize associations
import './database/models';

// Import routes
import authRoutes from './modules/auth/routes/auth.routes';
import communityRoutes from './modules/community/routes/community.routes';
import postRoutes from './modules/posts/routes/post.routes';
import prayerRoutes from './modules/prayer/routes/prayer.routes';
import devotionalRoutes from './modules/devotional/routes/devotional.routes';
import bibleRoutes from './modules/bible/routes/bible.routes';
import notificationRoutes from './modules/notifications/routes/notification.routes';
import aiRoutes from './modules/ai-assistant/routes/ai.routes';
import videoCallRoutes from './modules/video-calls/routes/video-call.routes';
import friendshipRoutes from './modules/auth/routes/friendship.routes';
import messageRoutes from './modules/auth/routes/message.routes';

const app: Application = express();

// CORS configuration
const corsOptions = {
  origin: function (origin: string | undefined, callback: Function) {
    const allowedOrigins = [
      'http://localhost:3001',
      'http://localhost:3000',
      'https://logos-grace.org',
      config.cors.origin,
      process.env.FRONTEND_URL,
    ].filter(Boolean);

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'LOGOS Platform API is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/communities', communityRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/prayers', prayerRoutes);
app.use('/api/v1/devotionals', devotionalRoutes);
app.use('/api/v1/bible', bibleRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/video-calls', videoCallRoutes);
app.use('/api/v1/friendship', friendshipRoutes);
app.use('/api/v1/messages', messageRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route not found: ${req.method} ${req.path}`,
    },
  });
});

// Error handler
app.use(errorHandler);

// Database connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info('✅ Database connected successfully');

    // Sync models in development
    if (config.nodeEnv === 'development') {
      await sequelize.sync({ alter: false });
      logger.info('✅ Database models synchronized');
    }
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

connectDB();

export default app;
