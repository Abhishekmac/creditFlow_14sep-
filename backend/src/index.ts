import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';

// Load environment variables
dotenv.config();

import { logger } from './config/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';
import { setupSwagger } from './swagger/swagger';

// Import routes
import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';
import cardsRoutes from './routes/cards';
import transactionsRoutes from './routes/transactions';
import paymentsRoutes from './routes/payments';
import rewardsRoutes from './routes/rewards';
import profileRoutes from './routes/profile';
import notificationsRoutes from './routes/notifications';
import statementsRoutes from './routes/statements';
import analyticsRoutes from './routes/analytics';
import activitiesRoutes from './routes/activities';

const app = express();
const port = process.env.PORT || 4000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate limiting
app.use(generalLimiter);

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'CreditFlow API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/cards', cardsRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/rewards', rewardsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/statements', statementsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/activities', activitiesRoutes);

// Setup Swagger documentation
setupSwagger(app);

// Serve static frontend files if configured
if (process.env.SERVE_STATIC_FRONTEND === 'true') {
  const frontendPath = process.env.FRONTEND_DIST_PATH || path.join(__dirname, '../../dist');
  app.use(express.static(frontendPath));
  
  // Serve index.html for all non-API routes (SPA support)
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(frontendPath, 'index.html'));
    } else {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: `API route ${req.method} ${req.path} not found`,
        },
      });
    }
  });
}

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(port, () => {
  logger.info(`🚀 CreditFlow API server running on port ${port}`);
  logger.info(`📚 API Documentation: http://localhost:${port}/api/docs`);
  logger.info(`🏥 Health Check: http://localhost:${port}/api/health`);
  
  if (process.env.SERVE_STATIC_FRONTEND === 'true') {
    logger.info(`🌐 Frontend: http://localhost:${port}`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app;