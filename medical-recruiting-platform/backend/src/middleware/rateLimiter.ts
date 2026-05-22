import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health'
});

export const strictRateLimiter = rateLimit({
  windowMs: 60000, // 1 minute
  max: 10,
  message: {
    error: 'Rate limit exceeded for sensitive operations.'
  }
});
