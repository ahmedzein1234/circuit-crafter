import { Context, Next } from 'hono';
import * as jose from 'jose';
import type { Env } from '../types/env';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
}

// JWT verification middleware
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
    const secret = new TextEncoder().encode(c.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret, {
      issuer: c.env.JWT_ISSUER,
    });

    if (!payload.sub || !payload.email || !payload.username) {
      return c.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'Invalid token payload',
        },
        401
      );
    }

    const user: AuthUser = {
      id: payload.sub,
      email: payload.email as string,
      username: payload.username as string,
    };

    c.set('user', user);
    await next();
  } catch (error) {
    if (error instanceof jose.errors.JWTExpired) {
      return c.json(
        {
          success: false,
          error: 'Token expired',
          message: 'Access token has expired. Please refresh.',
          code: 'TOKEN_EXPIRED',
        },
        401
      );
    }

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
export async function optionalAuthMiddleware(c: Context<Env>, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);

    try {
      const secret = new TextEncoder().encode(c.env.JWT_SECRET);
      const { payload } = await jose.jwtVerify(token, secret, {
        issuer: c.env.JWT_ISSUER,
      });

      if (payload.sub && payload.email && payload.username) {
        const user: AuthUser = {
          id: payload.sub,
          email: payload.email as string,
          username: payload.username as string,
        };
        c.set('user', user);
      }
    } catch {
      // Ignore errors for optional auth - just don't set user
    }
  }

  await next();
}
