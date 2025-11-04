import express, { Application, Request, Response } from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { sequelize } from './config/database.config';

// Load environment variables FIRST
dotenv.config();

console.log('🔍 Environment check:');
console.log('PORT:', process.env.PORT || 3000);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN);

// Import routes
import authRoutes from './modules/auth/routes/auth.routes';
import communityRoutes from './modules/community/routes/community.routes';
import aiRoutes from './modules/ai-assistant/routes/ai.routes';
import bibleRoutes from './modules/bible/routes/bible.routes';
import postRoutes from './modules/posts/routes/post.routes';
import prayerRoutes from './modules/prayer/routes/prayer.routes';
import devotionalRoutes from './modules/devotional/routes/devotional.routes';
import notificationRoutes from './modules/notifications/routes/notification.routes';
import videoCallRoutes from './modules/video-calls/routes/video-call.routes';
import adminRoutes from './modules/admin/routes/admin.routes';

// Import middlewares
import { notFound } from './shared/middlewares/not-found.middleware';
import { errorHandler } from './shared/middlewares/error-handler.middleware';

console.log('📦 Loading model associations...');
// Import model associations
import './modules/community/models/associations';
import './modules/ai-assistant/models/associations';
import './modules/posts/models/associations';
import './modules/prayer/models/associations';
import './modules/devotional/models/associations';
import './modules/notifications/models/associations';
import './modules/video-calls/models';

const app: Application = express();
const PORT = process.env.PORT || 3000;

console.log('⚙️  Setting up middleware...');
// Middleware
app.use(helmet());
app.use(cors({

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'LOGOS API is running',
    timestamp: new Date().toISOString()
  });
});

console.log('🛣️  Setting up routes...');
// API Routes
const API_PREFIX = '/api/v1';
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/communities`, communityRoutes);
app.use(`${API_PREFIX}/ai`, aiRoutes);
app.use(`${API_PREFIX}/bible`, bibleRoutes);
app.use(`${API_PREFIX}/posts`, postRoutes);
app.use(`${API_PREFIX}/prayers`, prayerRoutes);
app.use(`${API_PREFIX}/devotionals`, devotionalRoutes);
app.use(`${API_PREFIX}/notifications`, notificationRoutes);
app.use(`${API_PREFIX}/video-calls`, videoCallRoutes);
app.use(`${API_PREFIX}/admin`, adminRoutes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

// Database connection and server startup
async function startServer() {
  try {
    console.log('🔌 Connecting to database...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`📍 API Base: http://localhost:${PORT}${API_PREFIX}`);
      console.log(`✨ LOGOS Backend is ready!`);
    });
  } catch (error: any) {
    console.error('❌ Failed to start server:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

console.log('🚀 Starting server...');
startServer();

export default app;

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'LOGOS Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});
