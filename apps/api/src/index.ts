import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

// Routes
import { authRouter } from './routes/auth';
import { usersRouter } from './routes/users';
import { circuitsRouter } from './routes/circuits';
import { challengesRouter } from './routes/challenges';
import { simulationRouter } from './routes/simulation';
import { progressRouter } from './routes/progress';
import { learningRouter } from './routes/learning';
import { socialRouter } from './routes/social';
import { leaderboardRouter } from './routes/leaderboard';
import { assetsRouter } from './routes/assets';
import { roomsRouter } from './routes/rooms';

// Middleware
import { authRateLimiter, apiRateLimiter } from './middleware/rateLimit';
import { errorHandler, securityHeaders, notFoundHandler } from './middleware/error';

import type { Env } from './types/env';

const app = new Hono<Env>();

// Global middleware
app.use('*', logger());
app.use('*', securityHeaders);
app.use('*', errorHandler);

// CORS configuration
app.use(
  '*',
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://circuit-crafter.pages.dev',
    ],
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposeHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
    maxAge: 86400,
  })
);

// Health check
app.get('/', (c) => {
  return c.json({
    name: 'Circuit Crafter API',
    version: '0.2.0',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT || 'development',
  });
});

// Detailed health check
app.get('/health', async (c) => {
  const checks: Record<string, boolean> = {
    api: true,
    database: false,
    cache: false,
    storage: false,
  };

  try {
    // Test D1
    await c.env.DB.prepare('SELECT 1').first();
    checks.database = true;
  } catch {
    checks.database = false;
  }

  try {
    // Test KV
    await c.env.CACHE.get('health-check');
    checks.cache = true;
  } catch {
    checks.cache = false;
  }

  try {
    // Test R2
    await c.env.STORAGE.head('health-check');
    checks.storage = true;
  } catch {
    // R2 head on non-existent key is fine
    checks.storage = true;
  }

  const allHealthy = Object.values(checks).every(Boolean);

  return c.json(
    {
      status: allHealthy ? 'healthy' : 'degraded',
      checks,
      timestamp: new Date().toISOString(),
    },
    allHealthy ? 200 : 503
  );
});

// ================== API ROUTES ==================

// Auth routes (with rate limiting)
app.use('/api/auth/*', authRateLimiter);
app.route('/api/auth', authRouter);

// User routes
app.route('/api/users', usersRouter);

// Circuit routes (with general rate limiting)
app.use('/api/circuits/*', apiRateLimiter);
app.route('/api/circuits', circuitsRouter);

// Challenge routes
app.route('/api/challenges', challengesRouter);

// Simulation routes
app.route('/api/simulation', simulationRouter);

// Progress & Gamification routes
app.route('/api/progress', progressRouter);
app.route('/api/achievements', progressRouter); // Alias for convenience

// Learning routes (tutorials, paths, certificates)
app.route('/api/tutorials', learningRouter);
app.route('/api/learning-paths', learningRouter);
app.route('/api/certificates', learningRouter);
app.route('/api/learning', learningRouter); // Main learning route

// Social routes (comments, follows, notifications)
app.route('/api/social', socialRouter);

// Leaderboard routes
app.route('/api/leaderboard', leaderboardRouter);

// Asset routes (R2 storage)
app.route('/api/assets', assetsRouter);

// Room routes (WebSocket/Durable Objects)
app.route('/api/rooms', roomsRouter);

// Daily rewards (alias)
app.get('/api/daily-rewards', async (c) => {
  // Forward to progress router
  const url = new URL(c.req.url);
  url.pathname = '/api/progress/daily-rewards';
  return await app.fetch(new Request(url, c.req.raw), c.env);
});

// ================== ERROR HANDLING ==================

// 404 handler
app.notFound(notFoundHandler);

// Global error handler
app.onError((err, c) => {
  console.error('Unhandled API Error:', err);

  // Don't expose internal errors in production
  const message = c.env.ENVIRONMENT === 'production'
    ? 'Internal server error'
    : err.message;

  return c.json(
    {
      success: false,
      error: 'Internal Server Error',
      message,
    },
    500
  );
});

export default app;

// Export Durable Objects
export { CircuitRoom } from './durable-objects/CircuitRoom';
export { ChallengeRoom } from './durable-objects/ChallengeRoom';
