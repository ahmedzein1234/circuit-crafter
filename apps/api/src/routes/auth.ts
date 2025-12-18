import { Hono } from 'hono';
import { z } from 'zod';
import { validateBody } from '../middleware/validation';
import type { Env } from '../types/env';
import { generateId } from '@circuit-crafter/shared';

const authRouter = new Hono<{ Bindings: Env }>();

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(8).max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Register new user
authRouter.post('/register', validateBody(registerSchema), async (c) => {
  const { email, username, password } = c.get('validatedBody');

  try {
    // Check if user exists
    const existing = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ? OR username = ?'
    )
      .bind(email, username)
      .first();

    if (existing) {
      return c.json(
        {
          success: false,
          error: 'User already exists',
          message: 'Email or username is already taken',
        },
        409
      );
    }

    // Hash password (simplified - use bcrypt in production)
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'circuit-crafter-salt');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const passwordHash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    // Create user
    const userId = generateId();
    const now = new Date().toISOString();

    await c.env.DB.prepare(
      `INSERT INTO users (id, email, username, password_hash, created_at, last_login)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
      .bind(userId, email, username, passwordHash, now, now)
      .run();

    // Create session token
    const token = generateId() + '-' + generateId();
    const user = { id: userId, email, username };

    // Store session in KV (24 hour expiry)
    await c.env.CACHE.put(`session:${token}`, JSON.stringify(user), {
      expirationTtl: 86400,
    });

    return c.json(
      {
        success: true,
        data: {
          user: {
            id: userId,
            email,
            username,
          },
          token,
          expiresAt: new Date(Date.now() + 86400000).toISOString(),
        },
      },
      201
    );
  } catch (error) {
    console.error('Registration error:', error);
    return c.json(
      {
        success: false,
        error: 'Registration failed',
        message: 'Unable to create account',
      },
      500
    );
  }
});

// Login
authRouter.post('/login', validateBody(loginSchema), async (c) => {
  const { email, password } = c.get('validatedBody');

  try {
    // Find user
    const user = await c.env.DB.prepare(
      'SELECT id, email, username, password_hash FROM users WHERE email = ?'
    )
      .bind(email)
      .first<{ id: string; email: string; username: string; password_hash: string }>();

    if (!user) {
      return c.json(
        {
          success: false,
          error: 'Invalid credentials',
          message: 'Email or password is incorrect',
        },
        401
      );
    }

    // Verify password
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'circuit-crafter-salt');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const passwordHash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    if (passwordHash !== user.password_hash) {
      return c.json(
        {
          success: false,
          error: 'Invalid credentials',
          message: 'Email or password is incorrect',
        },
        401
      );
    }

    // Update last login
    await c.env.DB.prepare('UPDATE users SET last_login = ? WHERE id = ?')
      .bind(new Date().toISOString(), user.id)
      .run();

    // Create session token
    const token = generateId() + '-' + generateId();
    const sessionUser = { id: user.id, email: user.email, username: user.username };

    await c.env.CACHE.put(`session:${token}`, JSON.stringify(sessionUser), {
      expirationTtl: 86400,
    });

    return c.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
        token,
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json(
      {
        success: false,
        error: 'Login failed',
        message: 'Unable to authenticate',
      },
      500
    );
  }
});

// Logout
authRouter.post('/logout', async (c) => {
  const authHeader = c.req.header('Authorization');

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    await c.env.CACHE.delete(`session:${token}`);
  }

  return c.json({
    success: true,
    message: 'Logged out successfully',
  });
});

export { authRouter };
