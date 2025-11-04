import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database.config';
import routes from './shared/routes';
import { errorHandler } from './shared/middlewares/error.middleware';
import { logger } from './shared/utils/logger.util';

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

// Logging middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Logos Platform API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Logos Platform API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api/v1',
    },
  });
});

// API routes
app.use('/api/v1', routes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route not found: ${req.method} ${req.path}`,
    },
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    console.log('🔌 Connecting to database...');
    await connectDatabase();
    console.log('✅ Database connected successfully');

    app.listen(PORT, () => {
      console.log('✅ Server started successfully');
      console.log(`🌐 Server running on port ${PORT}`);
      console.log(`🔗 API URL: http://localhost:${PORT}/api/v1`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
