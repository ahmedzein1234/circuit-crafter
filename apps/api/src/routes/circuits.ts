import { Hono } from 'hono';
import { z } from 'zod';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validation';
import type { Env } from '../types/env';
import { generateId } from '@circuit-crafter/shared';

const circuitsRouter = new Hono<{ Bindings: Env }>();

const createCircuitSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  blueprint: z.object({
    components: z.array(z.any()),
    wires: z.array(z.any()),
    metadata: z.record(z.any()).optional(),
  }),
  isPublic: z.boolean().optional().default(false),
  isTemplate: z.boolean().optional().default(false),
});

const updateCircuitSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  blueprint: z
    .object({
      components: z.array(z.any()),
      wires: z.array(z.any()),
      metadata: z.record(z.any()).optional(),
    })
    .optional(),
  isPublic: z.boolean().optional(),
  isTemplate: z.boolean().optional(),
});

const listQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(20),
  sortBy: z.enum(['created_at', 'updated_at', 'likes', 'plays']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  featured: z.coerce.boolean().optional(),
});

// List public circuits
circuitsRouter.get('/', validateQuery(listQuerySchema), async (c) => {
  const { page, limit, sortBy, sortOrder } = c.get('validatedQuery');
  const offset = (page - 1) * limit;

  try {
    const [circuits, countResult] = await Promise.all([
      c.env.DB.prepare(
        `SELECT c.id, c.name, c.description, c.thumbnail_url, c.plays, c.likes, c.forks,
                c.created_at, c.updated_at, u.username as author_username, u.avatar_url as author_avatar
         FROM circuits c
         JOIN users u ON c.user_id = u.id
         WHERE c.is_public = 1
         ORDER BY c.${sortBy} ${sortOrder}
         LIMIT ? OFFSET ?`
      )
        .bind(limit, offset)
        .all(),
      c.env.DB.prepare('SELECT COUNT(*) as total FROM circuits WHERE is_public = 1').first<{
        total: number;
      }>(),
    ]);

    const total = countResult?.total || 0;

    return c.json({
      success: true,
      data: {
        items: circuits.results,
        total,
        page,
        pageSize: limit,
        hasMore: offset + circuits.results.length < total,
      },
    });
  } catch (error) {
    console.error('List circuits error:', error);
    return c.json({ success: false, error: 'Failed to list circuits' }, 500);
  }
});

// Get user's circuits
circuitsRouter.get('/my', authMiddleware, async (c) => {
  const user = c.get('user');

  try {
    const circuits = await c.env.DB.prepare(
      `SELECT id, name, description, thumbnail_url, is_public, is_template,
              plays, likes, forks, created_at, updated_at
       FROM circuits WHERE user_id = ?
       ORDER BY updated_at DESC`
    )
      .bind(user.id)
      .all();

    return c.json({
      success: true,
      data: circuits.results,
    });
  } catch (error) {
    console.error('Get my circuits error:', error);
    return c.json({ success: false, error: 'Failed to get circuits' }, 500);
  }
});

// Get single circuit
circuitsRouter.get('/:id', optionalAuthMiddleware, async (c) => {
  const id = c.req.param('id');
  const user = c.get('user');

  try {
    const circuit = await c.env.DB.prepare(
      `SELECT c.*, u.username as author_username, u.avatar_url as author_avatar
       FROM circuits c
       JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`
    )
      .bind(id)
      .first();

    if (!circuit) {
      return c.json({ success: false, error: 'Circuit not found' }, 404);
    }

    // Check access
    const isOwner = user && circuit.user_id === user.id;
    if (!circuit.is_public && !isOwner) {
      return c.json({ success: false, error: 'Access denied' }, 403);
    }

    // Increment play count if not owner
    if (!isOwner) {
      await c.env.DB.prepare('UPDATE circuits SET plays = plays + 1 WHERE id = ?')
        .bind(id)
        .run();
    }

    return c.json({
      success: true,
      data: {
        ...circuit,
        blueprint: JSON.parse(circuit.blueprint_json as string),
        isOwner,
      },
    });
  } catch (error) {
    console.error('Get circuit error:', error);
    return c.json({ success: false, error: 'Failed to get circuit' }, 500);
  }
});

// Create circuit
circuitsRouter.post('/', authMiddleware, validateBody(createCircuitSchema), async (c) => {
  const user = c.get('user');
  const { name, description, blueprint, isPublic, isTemplate } = c.get('validatedBody');

  try {
    const id = generateId();
    const now = new Date().toISOString();

    await c.env.DB.prepare(
      `INSERT INTO circuits (id, user_id, name, description, blueprint_json, is_public, is_template, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        id,
        user.id,
        name,
        description || null,
        JSON.stringify(blueprint),
        isPublic ? 1 : 0,
        isTemplate ? 1 : 0,
        now,
        now
      )
      .run();

    return c.json(
      {
        success: true,
        data: {
          id,
          name,
          description,
          isPublic,
          isTemplate,
          createdAt: now,
        },
      },
      201
    );
  } catch (error) {
    console.error('Create circuit error:', error);
    return c.json({ success: false, error: 'Failed to create circuit' }, 500);
  }
});

// Update circuit
circuitsRouter.put('/:id', authMiddleware, validateBody(updateCircuitSchema), async (c) => {
  const id = c.req.param('id');
  const user = c.get('user');
  const updates = c.get('validatedBody');

  try {
    // Check ownership
    const existing = await c.env.DB.prepare('SELECT user_id FROM circuits WHERE id = ?')
      .bind(id)
      .first<{ user_id: string }>();

    if (!existing) {
      return c.json({ success: false, error: 'Circuit not found' }, 404);
    }

    if (existing.user_id !== user.id) {
      return c.json({ success: false, error: 'Access denied' }, 403);
    }

    // Build update query
    const setClauses: string[] = ['updated_at = ?'];
    const values: (string | number)[] = [new Date().toISOString()];

    if (updates.name !== undefined) {
      setClauses.push('name = ?');
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      setClauses.push('description = ?');
      values.push(updates.description);
    }
    if (updates.blueprint !== undefined) {
      setClauses.push('blueprint_json = ?');
      values.push(JSON.stringify(updates.blueprint));
    }
    if (updates.isPublic !== undefined) {
      setClauses.push('is_public = ?');
      values.push(updates.isPublic ? 1 : 0);
    }
    if (updates.isTemplate !== undefined) {
      setClauses.push('is_template = ?');
      values.push(updates.isTemplate ? 1 : 0);
    }

    values.push(id);

    await c.env.DB.prepare(`UPDATE circuits SET ${setClauses.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();

    return c.json({
      success: true,
      message: 'Circuit updated',
    });
  } catch (error) {
    console.error('Update circuit error:', error);
    return c.json({ success: false, error: 'Failed to update circuit' }, 500);
  }
});

// Delete circuit
circuitsRouter.delete('/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const user = c.get('user');

  try {
    const existing = await c.env.DB.prepare('SELECT user_id FROM circuits WHERE id = ?')
      .bind(id)
      .first<{ user_id: string }>();

    if (!existing) {
      return c.json({ success: false, error: 'Circuit not found' }, 404);
    }

    if (existing.user_id !== user.id) {
      return c.json({ success: false, error: 'Access denied' }, 403);
    }

    await c.env.DB.prepare('DELETE FROM circuits WHERE id = ?').bind(id).run();

    return c.json({
      success: true,
      message: 'Circuit deleted',
    });
  } catch (error) {
    console.error('Delete circuit error:', error);
    return c.json({ success: false, error: 'Failed to delete circuit' }, 500);
  }
});

// Fork circuit
circuitsRouter.post('/:id/fork', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const user = c.get('user');

  try {
    const original = await c.env.DB.prepare(
      'SELECT * FROM circuits WHERE id = ? AND (is_public = 1 OR user_id = ?)'
    )
      .bind(id, user.id)
      .first();

    if (!original) {
      return c.json({ success: false, error: 'Circuit not found' }, 404);
    }

    const newId = generateId();
    const now = new Date().toISOString();

    await c.env.DB.prepare(
      `INSERT INTO circuits (id, user_id, name, description, blueprint_json, is_public, fork_of, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)`
    )
      .bind(
        newId,
        user.id,
        `${original.name} (Fork)`,
        original.description,
        original.blueprint_json,
        id,
        now,
        now
      )
      .run();

    // Increment fork count on original
    await c.env.DB.prepare('UPDATE circuits SET forks = forks + 1 WHERE id = ?')
      .bind(id)
      .run();

    return c.json(
      {
        success: true,
        data: {
          id: newId,
          forkedFrom: id,
        },
      },
      201
    );
  } catch (error) {
    console.error('Fork circuit error:', error);
    return c.json({ success: false, error: 'Failed to fork circuit' }, 500);
  }
});

// Like circuit
circuitsRouter.post('/:id/like', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const user = c.get('user');

  try {
    // Check if already liked
    const existing = await c.env.DB.prepare(
      'SELECT 1 FROM circuit_likes WHERE user_id = ? AND circuit_id = ?'
    )
      .bind(user.id, id)
      .first();

    if (existing) {
      return c.json({ success: false, error: 'Already liked' }, 409);
    }

    await c.env.DB.batch([
      c.env.DB.prepare(
        'INSERT INTO circuit_likes (user_id, circuit_id, created_at) VALUES (?, ?, ?)'
      ).bind(user.id, id, new Date().toISOString()),
      c.env.DB.prepare('UPDATE circuits SET likes = likes + 1 WHERE id = ?').bind(id),
    ]);

    return c.json({ success: true, message: 'Circuit liked' });
  } catch (error) {
    console.error('Like circuit error:', error);
    return c.json({ success: false, error: 'Failed to like circuit' }, 500);
  }
});

// Unlike circuit
circuitsRouter.delete('/:id/like', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const user = c.get('user');

  try {
    const result = await c.env.DB.prepare(
      'DELETE FROM circuit_likes WHERE user_id = ? AND circuit_id = ?'
    )
      .bind(user.id, id)
      .run();

    if (result.meta.changes === 0) {
      return c.json({ success: false, error: 'Not liked' }, 404);
    }

    await c.env.DB.prepare(
      'UPDATE circuits SET likes = MAX(0, likes - 1) WHERE id = ?'
    )
      .bind(id)
      .run();

    return c.json({ success: true, message: 'Like removed' });
  } catch (error) {
    console.error('Unlike circuit error:', error);
    return c.json({ success: false, error: 'Failed to unlike circuit' }, 500);
  }
});

export { circuitsRouter };
