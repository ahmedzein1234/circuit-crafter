import { Context, Next } from 'hono';
import type { Env } from '../types/env';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
}

// Simple token verification (in production, use proper JWT)
export async function authMiddleware(c: Context<Env>, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json(
      {
        success: false,
        error: 'Unauthorized',
        message: 'Missing or invalid authorization header',
      },
      401
    );
  }

  const token = authHeader.slice(7);

  try {
    // In production, verify JWT here
    // For now, we'll use a simple token that contains the user ID
    const cached = await c.env.CACHE.get(`session:${token}`);

    if (!cached) {
      return c.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'Invalid or expired token',
        },
        401
      );
    }

    const user = JSON.parse(cached) as AuthUser;
    c.set('user', user);

    await next();
  } catch (error) {
    return c.json(
      {
        success: false,
        error: 'Unauthorized',
        message: 'Token verification failed',
      },
      401
    );
  }
}

// Optional auth - continues even if not authenticated
export async function optionalAuthMiddleware(
  c: Context<Env>,
  next: Next
) {
  const authHeader = c.req.header('Authorization');

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);

    try {
      const cached = await c.env.CACHE.get(`session:${token}`);

      if (cached) {
        const user = JSON.parse(cached) as AuthUser;
        c.set('user', user);
      }
    } catch {
      // Ignore errors for optional auth
    }
  }

  await next();
}
