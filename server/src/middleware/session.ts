import express from 'express';
import session from 'express-session';
import RedisStore from 'connect-redis';
import { createClient } from 'redis';

const SESSION_TIMEOUT = parseInt(process.env.SESSION_TIMEOUT || '1800000'); // 30 minutes

// Create Redis client if REDIS_URL is provided
let redisClient: ReturnType<typeof createClient> | undefined;
let redisStore: RedisStore | undefined;

if (process.env.REDIS_URL) {
  redisClient = createClient({ url: process.env.REDIS_URL });
  redisClient.connect().catch(console.error);
  redisStore = new RedisStore({ client: redisClient });
}

export const sessionMiddleware = session({
  store: redisStore || undefined,
  secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: SESSION_TIMEOUT,
    sameSite: 'lax',
  },
  name: 'sessionId',
});

// Middleware to check session timeout
export const checkSessionTimeout = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (req.session && req.session.lastActivity) {
    const timeSinceLastActivity = Date.now() - (req.session.lastActivity as number);
    
    if (timeSinceLastActivity > SESSION_TIMEOUT) {
      req.session.destroy((err) => {
        if (err) console.error('Error destroying session:', err);
        return res.status(401).json({ 
          error: 'Session expired. Please login again.',
          code: 'SESSION_EXPIRED'
        });
      });
      return;
    }
  }
  
  if (req.session) {
    req.session.lastActivity = Date.now();
  }
  
  next();
};
