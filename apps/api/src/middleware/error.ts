import { Context, Next } from 'hono';
import type { Env } from '../types/env';

// Standard error response format
interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  code?: string;
  details?: unknown;
}

// Custom error class for API errors
export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(
    message: string,
    status: number = 500,
    code?: string,
    details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// Common error factories
export const Errors = {
  notFound: (resource: string = 'Resource') =>
    new ApiError(`${resource} not found`, 404, 'NOT_FOUND'),

  unauthorized: (message: string = 'Unauthorized') =>
    new ApiError(message, 401, 'UNAUTHORIZED'),

  forbidden: (message: string = 'Forbidden') =>
    new ApiError(message, 403, 'FORBIDDEN'),

  badRequest: (message: string, details?: unknown) =>
    new ApiError(message, 400, 'BAD_REQUEST', details),

  conflict: (message: string) =>
    new ApiError(message, 409, 'CONFLICT'),

  tooManyRequests: (retryAfter: number) =>
    new ApiError(
      `Rate limit exceeded. Retry after ${retryAfter} seconds`,
      429,
      'RATE_LIMIT_EXCEEDED',
      { retryAfter }
    ),

  internal: (message: string = 'Internal server error') =>
    new ApiError(message, 500, 'INTERNAL_ERROR'),

  validation: (errors: unknown) =>
    new ApiError('Validation failed', 400, 'VALIDATION_ERROR', errors),
};

// Global error handler middleware
export async function errorHandler(c: Context<Env>, next: Next) {
  try {
    await next();
  } catch (error) {
    console.error('Unhandled error:', error);

    // Handle ApiError
    if (error instanceof ApiError) {
      const response: ErrorResponse = {
        success: false,
        error: error.code || 'ERROR',
        message: error.message,
      };

      if (error.details) {
        response.details = error.details;
      }

      return c.json(response, error.status as any);
    }

    // Handle Zod validation errors
    if (error && typeof error === 'object' && 'issues' in error) {
      const response: ErrorResponse = {
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: (error as any).issues,
      };
      return c.json(response, 400);
    }

    // Handle generic errors
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    const response: ErrorResponse = {
      success: false,
      error: 'INTERNAL_ERROR',
      message: c.env.ENVIRONMENT === 'development' ? message : 'Internal server error',
    };

    return c.json(response, 500);
  }
}

// Not found handler (for unmatched routes)
export function notFoundHandler(c: Context) {
  return c.json(
    {
      success: false,
      error: 'NOT_FOUND',
      message: `Route ${c.req.method} ${c.req.path} not found`,
    },
    404
  );
}

// Request logging middleware (optional, for debugging)
export async function requestLogger(c: Context<Env>, next: Next) {
  const start = Date.now();
  const method = c.req.method;
  const path = c.req.path;

  await next();

  const duration = Date.now() - start;
  const status = c.res.status;

  // Log in development
  if (c.env.ENVIRONMENT === 'development') {
    console.log(`${method} ${path} - ${status} (${duration}ms)`);
  }
}

// Security headers middleware
export async function securityHeaders(c: Context<Env>, next: Next) {
  await next();

  // Add security headers
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-XSS-Protection', '1; mode=block');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Only add HSTS in production
  if (c.env.ENVIRONMENT === 'production') {
    c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
}
