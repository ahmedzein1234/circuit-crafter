import { Hono } from 'hono';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import * as jose from 'jose';
import { validateBody } from '../middleware/validation';
import type { Env } from '../types/env';
import { generateId } from '@circuit-crafter/shared';

const authRouter = new Hono<Env>();

// Constants
const BCRYPT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; // 7 days in seconds
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in ms

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(8).max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const refreshSchema = z.object({
  refreshToken: z.string(),
});

// Helper to generate JWT tokens
async function generateTokens(
  user: { id: string; email: string; username: string },
  jwtSecret: string,
  issuer: string
) {
  const secret = new TextEncoder().encode(jwtSecret);

  const accessToken = await new jose.SignJWT({
    sub: user.id,
    email: user.email,
    username: user.username,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(issuer)
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(secret);

  const refreshToken = generateId() + '-' + generateId() + '-' + generateId();

  return { accessToken, refreshToken };
}

// Register new user
authRouter.post('/register', validateBody(registerSchema), async (c) => {
  const { email, username, password } = c.get('validatedBody') as z.infer<typeof registerSchema>;

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

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Create user
    const userId = generateId();
    const now = new Date().toISOString();

    await c.env.DB.prepare(
      `INSERT INTO users (id, email, username, password_hash, created_at, last_login)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
      .bind(userId, email, username, passwordHash, now, now)
      .run();

    // Initialize user progress
    await c.env.DB.prepare(
      `INSERT INTO user_progress (user_id, xp, level, updated_at)
       VALUES (?, 0, 1, ?)`
    )
      .bind(userId, now)
      .run();

    // Initialize user streaks
    await c.env.DB.prepare(
      `INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_activity_date)
       VALUES (?, 0, 0, ?)`
    )
      .bind(userId, now.split('T')[0])
      .run();

    // Generate tokens
    const user = { id: userId, email, username };
    const { accessToken, refreshToken } = await generateTokens(
      user,
      c.env.JWT_SECRET,
      c.env.JWT_ISSUER
    );

    // Store refresh token hash in DB
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    const sessionId = generateId();
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL * 1000).toISOString();

    await c.env.DB.prepare(
      `INSERT INTO sessions (id, user_id, refresh_token_hash, created_at, expires_at)
       VALUES (?, ?, ?, ?, ?)`
    )
      .bind(sessionId, userId, refreshTokenHash, now, expiresAt)
      .run();

    return c.json(
      {
        success: true,
        data: {
          user: {
            id: userId,
            email,
            username,
          },
          accessToken,
          refreshToken,
          expiresIn: 900, // 15 minutes in seconds
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
  const { email, password } = c.get('validatedBody') as z.infer<typeof loginSchema>;

  try {
    // Find user with lockout check
    const user = await c.env.DB.prepare(
      `SELECT id, email, username, password_hash, failed_login_attempts, locked_until
       FROM users WHERE email = ?`
    )
      .bind(email)
      .first<{
        id: string;
        email: string;
        username: string;
        password_hash: string;
        failed_login_attempts: number | null;
        locked_until: string | null;
      }>();

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

    // Check if account is locked
    if (user.locked_until) {
      const lockExpiry = new Date(user.locked_until).getTime();
      if (Date.now() < lockExpiry) {
        const remainingMinutes = Math.ceil((lockExpiry - Date.now()) / 60000);
        return c.json(
          {
            success: false,
            error: 'Account locked',
            message: `Too many failed attempts. Try again in ${remainingMinutes} minutes.`,
          },
          429
        );
      }
      // Lock expired, reset attempts
      await c.env.DB.prepare(
        'UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = ?'
      )
        .bind(user.id)
        .run();
    }

    // Verify password with bcrypt
    const passwordValid = await bcrypt.compare(password, user.password_hash);

    if (!passwordValid) {
      // Increment failed attempts
      const attempts = (user.failed_login_attempts || 0) + 1;
      const lockedUntil = attempts >= MAX_LOGIN_ATTEMPTS
        ? new Date(Date.now() + LOCKOUT_DURATION).toISOString()
        : null;

      await c.env.DB.prepare(
        'UPDATE users SET failed_login_attempts = ?, locked_until = ? WHERE id = ?'
      )
        .bind(attempts, lockedUntil, user.id)
        .run();

      const remainingAttempts = MAX_LOGIN_ATTEMPTS - attempts;
      return c.json(
        {
          success: false,
          error: 'Invalid credentials',
          message: remainingAttempts > 0
            ? `Email or password is incorrect. ${remainingAttempts} attempts remaining.`
            : 'Account locked due to too many failed attempts.',
        },
        401
      );
    }

    // Reset failed attempts and update last login
    const now = new Date().toISOString();
    await c.env.DB.prepare(
      'UPDATE users SET failed_login_attempts = 0, locked_until = NULL, last_login = ? WHERE id = ?'
    )
      .bind(now, user.id)
      .run();

    // Generate tokens
    const userPayload = { id: user.id, email: user.email, username: user.username };
    const { accessToken, refreshToken } = await generateTokens(
      userPayload,
      c.env.JWT_SECRET,
      c.env.JWT_ISSUER
    );

    // Store refresh token
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    const sessionId = generateId();
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL * 1000).toISOString();

    await c.env.DB.prepare(
      `INSERT INTO sessions (id, user_id, refresh_token_hash, created_at, expires_at)
       VALUES (?, ?, ?, ?, ?)`
    )
      .bind(sessionId, user.id, refreshTokenHash, now, expiresAt)
      .run();

    return c.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
        accessToken,
        refreshToken,
        expiresIn: 900, // 15 minutes
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

// Refresh token
authRouter.post('/refresh', validateBody(refreshSchema), async (c) => {
  const { refreshToken } = c.get('validatedBody') as z.infer<typeof refreshSchema>;

  try {
    // Find valid sessions for this user
    const sessions = await c.env.DB.prepare(
      `SELECT s.id, s.user_id, s.refresh_token_hash, u.email, u.username
       FROM sessions s
       JOIN users u ON s.user_id = u.id
       WHERE s.revoked = 0 AND s.expires_at > datetime('now')
       ORDER BY s.created_at DESC
       LIMIT 10`
    )
      .all<{
        id: string;
        user_id: string;
        refresh_token_hash: string;
        email: string;
        username: string;
      }>();

    if (!sessions.results || sessions.results.length === 0) {
      return c.json(
        {
          success: false,
          error: 'Invalid token',
          message: 'Refresh token is invalid or expired',
        },
        401
      );
    }

    // Find matching session
    let matchedSession = null;
    for (const session of sessions.results) {
      const isValid = await bcrypt.compare(refreshToken, session.refresh_token_hash);
      if (isValid) {
        matchedSession = session;
        break;
      }
    }

    if (!matchedSession) {
      return c.json(
        {
          success: false,
          error: 'Invalid token',
          message: 'Refresh token is invalid or expired',
        },
        401
      );
    }

    // Revoke old session
    await c.env.DB.prepare('UPDATE sessions SET revoked = 1 WHERE id = ?')
      .bind(matchedSession.id)
      .run();

    // Generate new tokens
    const user = {
      id: matchedSession.user_id,
      email: matchedSession.email,
      username: matchedSession.username,
    };
    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(
      user,
      c.env.JWT_SECRET,
      c.env.JWT_ISSUER
    );

    // Store new refresh token
    const now = new Date().toISOString();
    const refreshTokenHash = await bcrypt.hash(newRefreshToken, 10);
    const sessionId = generateId();
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL * 1000).toISOString();

    await c.env.DB.prepare(
      `INSERT INTO sessions (id, user_id, refresh_token_hash, created_at, expires_at)
       VALUES (?, ?, ?, ?, ?)`
    )
      .bind(sessionId, user.id, refreshTokenHash, now, expiresAt)
      .run();

    return c.json({
      success: true,
      data: {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: 900,
      },
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return c.json(
      {
        success: false,
        error: 'Refresh failed',
        message: 'Unable to refresh token',
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

    try {
      // Verify JWT to get user ID
      const secret = new TextEncoder().encode(c.env.JWT_SECRET);
      const { payload } = await jose.jwtVerify(token, secret, {
        issuer: c.env.JWT_ISSUER,
      });

      if (payload.sub) {
        // Revoke all sessions for this user
        await c.env.DB.prepare('UPDATE sessions SET revoked = 1 WHERE user_id = ?')
          .bind(payload.sub)
          .run();
      }
    } catch {
      // Token might be expired, that's ok for logout
    }
  }

  return c.json({
    success: true,
    message: 'Logged out successfully',
  });
});

// Logout from all devices
authRouter.post('/logout-all', async (c) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }

  const token = authHeader.slice(7);

  try {
    const secret = new TextEncoder().encode(c.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret, {
      issuer: c.env.JWT_ISSUER,
    });

    if (payload.sub) {
      await c.env.DB.prepare('UPDATE sessions SET revoked = 1 WHERE user_id = ?')
        .bind(payload.sub)
        .run();
    }

    return c.json({
      success: true,
      message: 'Logged out from all devices',
    });
  } catch {
    return c.json({ success: false, error: 'Invalid token' }, 401);
  }
});

export { authRouter };
