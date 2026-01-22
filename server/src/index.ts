import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/errorHandler';
import { sessionMiddleware } from './middleware/session';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import mfaRoutes from './routes/mfa';
import dashboardRoutes from './routes/dashboard';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const SESSION_TIMEOUT = parseInt(process.env.SESSION_TIMEOUT || '1800000'); // 30 minutes

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(sessionMiddleware);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/mfa', mfaRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Session timeout: ${SESSION_TIMEOUT / 1000 / 60} minutes`);
});

export default app;
