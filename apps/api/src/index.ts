import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { circuitsRouter } from './routes/circuits';
import { challengesRouter } from './routes/challenges';
import { usersRouter } from './routes/users';
import { authRouter } from './routes/auth';
import { simulationRouter } from './routes/simulation';
import type { Env } from './types/env';

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: ['http://localhost:3000', 'https://circuit-crafter.pages.dev'],
    credentials: true,
  })
);

// Health check
app.get('/', (c) => {
  return c.json({
    name: 'Circuit Crafter API',
    version: '0.1.0',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.route('/api/auth', authRouter);
app.route('/api/users', usersRouter);
app.route('/api/circuits', circuitsRouter);
app.route('/api/challenges', challengesRouter);
app.route('/api/simulation', simulationRouter);

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: 'Not Found',
      message: `Route ${c.req.method} ${c.req.path} not found`,
    },
    404
  );
});

// Error handler
app.onError((err, c) => {
  console.error('API Error:', err);
  return c.json(
    {
      success: false,
      error: 'Internal Server Error',
      message: err.message,
    },
    500
  );
});

export default app;

// Export Durable Objects
export { CircuitRoom } from './durable-objects/CircuitRoom';
export { ChallengeRoom } from './durable-objects/ChallengeRoom';
