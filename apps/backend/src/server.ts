import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { sequelize } from './config/database.config';

// Import ALL module routes
import adminRoutes from './modules/admin/routes/admin.routes';
import aiRoutes from './modules/ai-assistant/routes/ai.routes';
import authRoutes from './modules/auth/routes/auth.routes';
import bibleRoutes from './modules/bible/routes/bible.routes';
import communityRoutes from './modules/community/routes/community.routes';
import devotionalRoutes from './modules/devotional/routes/devotional.routes';
import notificationRoutes from './modules/notifications/routes/notification.routes';
import postRoutes from './modules/posts/routes/post.routes';
import prayerRoutes from './modules/prayer/routes/prayer.routes';
import videoCallRoutes from './modules/video-calls/routes/video-call.routes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 Starting Logos Platform Backend...');
console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Logos Platform API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Root endpoint with complete API documentation
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Logos Platform API',
    version: '1.0.0',
    documentation: {
      health: '/health',
      api: '/api/v1',
    },
    availableRoutes: {
      admin: '/api/v1/admin',
      ai: '/api/v1/ai',
      auth: '/api/v1/auth',
      bible: '/api/v1/bible',
      communities: '/api/v1/communities',
      devotionals: '/api/v1/devotionals',
      notifications: '/api/v1/notifications',
      posts: '/api/v1/posts',
      prayers: '/api/v1/prayers',
      videoCalls: '/api/v1/video-calls',
    }
  });
});

// ==========================================
// API ROUTES - ALL MODULES REGISTERED
// ==========================================

// Admin routes (protected with admin middleware)
app.use('/api/v1/admin', adminRoutes);

// AI Assistant routes
app.use('/api/v1/ai', aiRoutes);

// Authentication routes
app.use('/api/v1/auth', authRoutes);

// Bible routes
app.use('/api/v1/bible', bibleRoutes);

// Community routes
app.use('/api/v1/communities', communityRoutes);

// Devotional routes
app.use('/api/v1/devotionals', devotionalRoutes);

// Notification routes
app.use('/api/v1/notifications', notificationRoutes);

// Post routes
app.use('/api/v1/posts', postRoutes);

// Prayer routes
app.use('/api/v1/prayers', prayerRoutes);

// Video call routes
app.use('/api/v1/video-calls', videoCallRoutes);

// ==========================================
// ERROR HANDLERS
// ==========================================

// 404 handler - must be after all routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route not found: ${req.method} ${req.path}`,
      availableEndpoints: 'Visit / or /health for available routes',
    },
  });
});

// Global error handling middleware - must be last
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Error:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { 
        stack: err.stack,
        details: err 
      }),
    },
  });
});

// ==========================================
// DATABASE CONNECTION & SERVER START
// ==========================================

const startServer = async () => {
  try {
    console.log('🔌 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    app.listen(PORT, () => {
      console.log('═══════════════════════════════════════════════════════');
      console.log('✅ Server started successfully');
      console.log(`🌐 Server running on port ${PORT}`);
      console.log(`🔗 API URL: http://localhost:${PORT}/api/v1`);
      console.log('═══════════════════════════════════════════════════════');
      console.log('📍 Available Endpoints:');
      console.log(`   🏥 Health Check:    http://localhost:${PORT}/health`);
      console.log(`   👨‍💼 Admin:           http://localhost:${PORT}/api/v1/admin`);
      console.log(`   🤖 AI Assistant:    http://localhost:${PORT}/api/v1/ai`);
      console.log(`   🔐 Auth:            http://localhost:${PORT}/api/v1/auth`);
      console.log(`   📖 Bible:           http://localhost:${PORT}/api/v1/bible`);
      console.log(`   👥 Communities:     http://localhost:${PORT}/api/v1/communities`);
      console.log(`   🙏 Devotionals:     http://localhost:${PORT}/api/v1/devotionals`);
      console.log(`   🔔 Notifications:   http://localhost:${PORT}/api/v1/notifications`);
      console.log(`   📝 Posts:           http://localhost:${PORT}/api/v1/posts`);
      console.log(`   🙏 Prayers:         http://localhost:${PORT}/api/v1/prayers`);
      console.log(`   📹 Video Calls:     http://localhost:${PORT}/api/v1/video-calls`);
      console.log('═══════════════════════════════════════════════════════');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
