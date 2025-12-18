import { Context, Next } from 'hono';
import { z } from 'zod';

export function validateBody<T extends z.ZodType>(schema: T) {
  return async (c: Context, next: Next) => {
    try {
      const body = await c.req.json();
      const result = schema.safeParse(body);

      if (!result.success) {
        return c.json(
          {
            success: false,
            error: 'Validation Error',
            details: result.error.errors.map((e) => ({
              path: e.path.join('.'),
              message: e.message,
            })),
          },
          400
        );
      }

      c.set('validatedBody', result.data);
      await next();
    } catch (error) {
      return c.json(
        {
          success: false,
          error: 'Invalid JSON',
          message: 'Request body must be valid JSON',
        },
        400
      );
    }
  };
}

export function validateQuery<T extends z.ZodType>(schema: T) {
  return async (c: Context, next: Next) => {
    const query = c.req.query();
    const result = schema.safeParse(query);

    if (!result.success) {
      return c.json(
        {
          success: false,
          error: 'Validation Error',
          details: result.error.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        },
        400
      );
    }

    c.set('validatedQuery', result.data);
    await next();
  };
}

export function validateParams<T extends z.ZodType>(schema: T) {
  return async (c: Context, next: Next) => {
    const params = c.req.param();
    const result = schema.safeParse(params);

    if (!result.success) {
      return c.json(
        {
          success: false,
          error: 'Validation Error',
          details: result.error.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        },
        400
      );
    }

    c.set('validatedParams', result.data);
    await next();
  };
}
