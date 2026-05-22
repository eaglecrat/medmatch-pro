import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';

import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { hipaaAuditMiddleware } from './middleware/hipaaAudit';
import { encryptionMiddleware } from './middleware/encryption';
import { authRouter } from './routes/auth';
import { providerRouter } from './routes/providers';
import { employerRouter } from './routes/employers';
import { jobRouter } from './routes/jobs';
import { applicationRouter } from './routes/applications';
import { credentialRouter } from './routes/credentials';
import { messageRouter } from './routes/messages';
import { matchingRouter } from './routes/matching';
import { paymentRouter } from './routes/payments';
import { stateLicenseRouter } from './routes/stateLicenses';
import { hipaaRouter } from './routes/hipaa';
import { notificationRouter } from './routes/notifications';
import { reviewRouter } from './routes/reviews';
import { SocketManager } from './services/socketManager';
import { logger } from './utils/logger';
import { startCronJobs } from './utils/cronJobs';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:3000'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(rateLimiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined', { stream: { write: (msg) => logger.info(msg.trim()) } }));

// HIPAA encryption for sensitive fields
app.use(encryptionMiddleware);

// HIPAA audit logging
app.use(hipaaAuditMiddleware);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString(), hipaaCompliant: true });
});

// API Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/providers', providerRouter);
app.use('/api/v1/employers', employerRouter);
app.use('/api/v1/jobs', jobRouter);
app.use('/api/v1/applications', applicationRouter);
app.use('/api/v1/credentials', credentialRouter);
app.use('/api/v1/messages', messageRouter);
app.use('/api/v1/matching', matchingRouter);
app.use('/api/v1/payments', paymentRouter);
app.use('/api/v1/state-licenses', stateLicenseRouter);
app.use('/api/v1/hipaa', hipaaRouter);
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/reviews', reviewRouter);

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Error handling
app.use(errorHandler);

// Socket.IO setup
SocketManager.initialize(io);

// Start cron jobs (credential expiry checks, data retention, etc.)
startCronJobs();

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  logger.info(`Medical Recruiting API running on port ${PORT}`);
  logger.info(`HIPAA Compliance Mode: ENABLED`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export { io };
