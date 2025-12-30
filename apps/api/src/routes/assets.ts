import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import type { Env } from '../types/env';
import { generateId } from '@circuit-crafter/shared';

const assetsRouter = new Hono<Env>();

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

// Upload an asset
assetsRouter.post('/upload', authMiddleware, async (c) => {
  const user = c.get('user');

  try {
    const contentType = c.req.header('Content-Type');

    let file: ArrayBuffer;
    let mimeType: string;
    let fileName: string;

    if (contentType?.includes('multipart/form-data')) {
      // Handle multipart upload
      const formData = await c.req.formData();
      const uploadedFile = formData.get('file') as File | null;

      if (!uploadedFile) {
        return c.json({ success: false, error: 'No file provided' }, 400);
      }

      if (uploadedFile.size > MAX_FILE_SIZE) {
        return c.json({ success: false, error: 'File too large (max 5MB)' }, 400);
      }

      if (!ALLOWED_TYPES.includes(uploadedFile.type)) {
        return c.json({ success: false, error: 'Invalid file type. Allowed: PNG, JPEG, GIF, WebP' }, 400);
      }

      file = await uploadedFile.arrayBuffer();
      mimeType = uploadedFile.type;
      fileName = uploadedFile.name;
    } else if (contentType?.includes('application/json')) {
      // Handle base64 upload
      const body = await c.req.json();

      if (!body.data || !body.mimeType) {
        return c.json({ success: false, error: 'Missing data or mimeType' }, 400);
      }

      if (!ALLOWED_TYPES.includes(body.mimeType)) {
        return c.json({ success: false, error: 'Invalid file type' }, 400);
      }

      // Decode base64
      const base64Data = body.data.replace(/^data:image\/\w+;base64,/, '');
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      if (bytes.length > MAX_FILE_SIZE) {
        return c.json({ success: false, error: 'File too large (max 5MB)' }, 400);
      }

      file = bytes.buffer;
      mimeType = body.mimeType;
      fileName = body.fileName || `upload.${mimeType.split('/')[1]}`;
    } else {
      return c.json({ success: false, error: 'Invalid content type' }, 400);
    }

    // Generate unique key
    const extension = mimeType.split('/')[1] || 'png';
    const key = `users/${user.id}/${generateId()}.${extension}`;

    // Upload to R2
    await c.env.STORAGE.put(key, file, {
      httpMetadata: {
        contentType: mimeType,
      },
      customMetadata: {
        uploadedBy: user.id,
        originalName: fileName,
        uploadedAt: new Date().toISOString(),
      },
    });

    // Generate public URL (assuming public bucket or using signed URLs)
    const publicUrl = `/api/assets/${key}`;

    return c.json({
      success: true,
      data: {
        key,
        url: publicUrl,
        mimeType,
        size: file.byteLength,
      },
    }, 201);
  } catch (error) {
    console.error('Upload asset error:', error);
    return c.json({ success: false, error: 'Failed to upload asset' }, 500);
  }
});

// Get an asset (public)
assetsRouter.get('/:key{.+}', async (c) => {
  const key = c.req.param('key');

  try {
    const object = await c.env.STORAGE.get(key);

    if (!object) {
      return c.json({ success: false, error: 'Asset not found' }, 404);
    }

    const headers = new Headers();
    headers.set('Content-Type', object.httpMetadata?.contentType || 'application/octet-stream');
    headers.set('Cache-Control', 'public, max-age=31536000'); // 1 year cache
    headers.set('ETag', object.etag);

    // Check for conditional request
    const ifNoneMatch = c.req.header('If-None-Match');
    if (ifNoneMatch === object.etag) {
      return new Response(null, { status: 304, headers });
    }

    return new Response(object.body, { headers });
  } catch (error) {
    console.error('Get asset error:', error);
    return c.json({ success: false, error: 'Failed to fetch asset' }, 500);
  }
});

// Delete an asset (owner only)
assetsRouter.delete('/:key{.+}', authMiddleware, async (c) => {
  const user = c.get('user');
  const key = c.req.param('key');

  try {
    // Verify ownership
    const object = await c.env.STORAGE.head(key);

    if (!object) {
      return c.json({ success: false, error: 'Asset not found' }, 404);
    }

    if (object.customMetadata?.uploadedBy !== user.id) {
      return c.json({ success: false, error: 'Not authorized' }, 403);
    }

    await c.env.STORAGE.delete(key);

    return c.json({ success: true, message: 'Asset deleted' });
  } catch (error) {
    console.error('Delete asset error:', error);
    return c.json({ success: false, error: 'Failed to delete asset' }, 500);
  }
});

// Upload circuit thumbnail
assetsRouter.put('/circuits/:circuitId/thumbnail', authMiddleware, async (c) => {
  const user = c.get('user');
  const circuitId = c.req.param('circuitId');

  try {
    // Verify circuit ownership
    const circuit = await c.env.DB.prepare(
      'SELECT user_id FROM circuits WHERE id = ?'
    )
      .bind(circuitId)
      .first<{ user_id: string }>();

    if (!circuit) {
      return c.json({ success: false, error: 'Circuit not found' }, 404);
    }

    if (circuit.user_id !== user.id) {
      return c.json({ success: false, error: 'Not authorized' }, 403);
    }

    // Get image data
    const body = await c.req.json();

    if (!body.data) {
      return c.json({ success: false, error: 'Missing image data' }, 400);
    }

    // Decode base64
    const base64Data = body.data.replace(/^data:image\/\w+;base64,/, '');
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    if (bytes.length > MAX_FILE_SIZE) {
      return c.json({ success: false, error: 'File too large (max 5MB)' }, 400);
    }

    // Upload to R2
    const key = `circuits/${circuitId}/thumbnail.png`;
    await c.env.STORAGE.put(key, bytes.buffer, {
      httpMetadata: {
        contentType: 'image/png',
      },
      customMetadata: {
        circuitId,
        uploadedBy: user.id,
        uploadedAt: new Date().toISOString(),
      },
    });

    // Update circuit with thumbnail URL
    const thumbnailUrl = `/api/assets/${key}`;
    await c.env.DB.prepare(
      'UPDATE circuits SET thumbnail_url = ?, updated_at = ? WHERE id = ?'
    )
      .bind(thumbnailUrl, new Date().toISOString(), circuitId)
      .run();

    return c.json({
      success: true,
      data: {
        thumbnailUrl,
      },
    });
  } catch (error) {
    console.error('Upload circuit thumbnail error:', error);
    return c.json({ success: false, error: 'Failed to upload thumbnail' }, 500);
  }
});

// Upload user avatar
assetsRouter.put('/users/avatar', authMiddleware, async (c) => {
  const user = c.get('user');

  try {
    const body = await c.req.json();

    if (!body.data) {
      return c.json({ success: false, error: 'Missing image data' }, 400);
    }

    // Decode base64
    const base64Data = body.data.replace(/^data:image\/\w+;base64,/, '');
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Avatar size limit: 1MB
    if (bytes.length > 1024 * 1024) {
      return c.json({ success: false, error: 'Avatar too large (max 1MB)' }, 400);
    }

    // Upload to R2
    const key = `users/${user.id}/avatar.png`;
    await c.env.STORAGE.put(key, bytes.buffer, {
      httpMetadata: {
        contentType: 'image/png',
      },
      customMetadata: {
        userId: user.id,
        uploadedAt: new Date().toISOString(),
      },
    });

    // Update user with avatar URL
    const avatarUrl = `/api/assets/${key}`;
    await c.env.DB.prepare(
      'UPDATE users SET avatar_url = ? WHERE id = ?'
    )
      .bind(avatarUrl, user.id)
      .run();

    return c.json({
      success: true,
      data: {
        avatarUrl,
      },
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    return c.json({ success: false, error: 'Failed to upload avatar' }, 500);
  }
});

export { assetsRouter };
