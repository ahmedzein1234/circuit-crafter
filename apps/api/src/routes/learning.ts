import { Hono } from 'hono';
import { z } from 'zod';
import { validateBody } from '../middleware/validation';
import { authMiddleware } from '../middleware/auth';
import type { Env } from '../types/env';
import { generateId } from '@circuit-crafter/shared';

const learningRouter = new Hono<Env>();

// All routes require authentication
learningRouter.use('*', authMiddleware);

const completeLevelSchema = z.object({
  rating: z.enum(['bronze', 'silver', 'gold']).optional(),
  timeSeconds: z.number().positive().optional(),
  hintsUsed: z.number().int().min(0).optional(),
});

const completeModuleSchema = z.object({
  score: z.number().int().min(0).max(100).optional(),
});

const generateCertificateSchema = z.object({
  studentName: z.string().min(1).max(100),
});

// ================== TUTORIALS ==================

// Get all tutorial progress
learningRouter.get('/tutorials/progress', async (c) => {
  const user = c.get('user');

  try {
    const progress = await c.env.DB.prepare(
      `SELECT chapter_id, level_id, completed, rating, time_seconds, attempts, hints_used, completed_at
       FROM tutorial_progress WHERE user_id = ?
       ORDER BY chapter_id, level_id`
    )
      .bind(user.id)
      .all();

    // Group by chapter
    const byChapter: Record<string, any[]> = {};
    for (const row of progress.results || []) {
      const r = row as any;
      if (!byChapter[r.chapter_id]) {
        byChapter[r.chapter_id] = [];
      }
      byChapter[r.chapter_id].push({
        levelId: r.level_id,
        completed: !!r.completed,
        rating: r.rating,
        timeSeconds: r.time_seconds,
        attempts: r.attempts,
        hintsUsed: r.hints_used,
        completedAt: r.completed_at,
      });
    }

    return c.json({
      success: true,
      data: byChapter,
    });
  } catch (error) {
    console.error('Get tutorial progress error:', error);
    return c.json({ success: false, error: 'Failed to fetch progress' }, 500);
  }
});

// Complete a tutorial level
learningRouter.post('/tutorials/:chapterId/:levelId', validateBody(completeLevelSchema), async (c) => {
  const user = c.get('user');
  const chapterId = c.req.param('chapterId');
  const levelId = c.req.param('levelId');
  const body = c.get('validatedBody') as z.infer<typeof completeLevelSchema>;
  const now = new Date().toISOString();

  try {
    // Check if already completed
    const existing = await c.env.DB.prepare(
      'SELECT attempts, completed FROM tutorial_progress WHERE user_id = ? AND chapter_id = ? AND level_id = ?'
    )
      .bind(user.id, chapterId, levelId)
      .first<{ attempts: number; completed: number }>();

    if (existing?.completed) {
      // Already completed, just increment attempts if retrying
      await c.env.DB.prepare(
        `UPDATE tutorial_progress
         SET attempts = attempts + 1,
             rating = CASE WHEN ? > rating THEN ? ELSE rating END,
             time_seconds = CASE WHEN ? < time_seconds OR time_seconds IS NULL THEN ? ELSE time_seconds END
         WHERE user_id = ? AND chapter_id = ? AND level_id = ?`
      )
        .bind(
          body.rating || 'bronze',
          body.rating || 'bronze',
          body.timeSeconds || 9999,
          body.timeSeconds,
          user.id,
          chapterId,
          levelId
        )
        .run();

      return c.json({
        success: true,
        data: { alreadyCompleted: true, improved: false },
      });
    }

    // First completion or update attempt
    await c.env.DB.prepare(
      `INSERT INTO tutorial_progress (user_id, chapter_id, level_id, completed, rating, time_seconds, attempts, hints_used, completed_at)
       VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id, chapter_id, level_id) DO UPDATE SET
         completed = 1,
         rating = excluded.rating,
         time_seconds = excluded.time_seconds,
         attempts = attempts + 1,
         hints_used = excluded.hints_used,
         completed_at = excluded.completed_at`
    )
      .bind(
        user.id,
        chapterId,
        levelId,
        body.rating || 'bronze',
        body.timeSeconds,
        (existing?.attempts || 0) + 1,
        body.hintsUsed || 0,
        now
      )
      .run();

    // Award XP based on rating
    const xpRewards = { bronze: 25, silver: 50, gold: 100 };
    const xpEarned = xpRewards[body.rating || 'bronze'];

    await c.env.DB.prepare(
      `UPDATE user_progress SET
         xp = xp + ?,
         total_challenges_completed = total_challenges_completed + 1,
         updated_at = ?
       WHERE user_id = ?`
    )
      .bind(xpEarned, now, user.id)
      .run();

    return c.json({
      success: true,
      data: {
        chapterId,
        levelId,
        rating: body.rating || 'bronze',
        xpEarned,
        completedAt: now,
      },
    });
  } catch (error) {
    console.error('Complete tutorial level error:', error);
    return c.json({ success: false, error: 'Failed to complete level' }, 500);
  }
});

// ================== LEARNING PATHS ==================

// Get enrolled learning paths
learningRouter.get('/paths', async (c) => {
  const user = c.get('user');

  try {
    const enrollments = await c.env.DB.prepare(
      `SELECT path_id, enrolled_at, started_at, completed_at, certificate_id
       FROM learning_path_enrollments WHERE user_id = ?
       ORDER BY enrolled_at DESC`
    )
      .bind(user.id)
      .all();

    // Get module completions for each path
    const result = [];
    for (const enrollment of enrollments.results || []) {
      const e = enrollment as any;
      const modules = await c.env.DB.prepare(
        `SELECT module_id, completed_at, score
         FROM module_completions WHERE user_id = ? AND path_id = ?`
      )
        .bind(user.id, e.path_id)
        .all();

      result.push({
        pathId: e.path_id,
        enrolledAt: e.enrolled_at,
        startedAt: e.started_at,
        completedAt: e.completed_at,
        certificateId: e.certificate_id,
        completedModules: modules.results?.map((m: any) => ({
          moduleId: m.module_id,
          completedAt: m.completed_at,
          score: m.score,
        })) || [],
      });
    }

    return c.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get learning paths error:', error);
    return c.json({ success: false, error: 'Failed to fetch learning paths' }, 500);
  }
});

// Enroll in a learning path
learningRouter.post('/paths/:pathId/enroll', async (c) => {
  const user = c.get('user');
  const pathId = c.req.param('pathId');
  const now = new Date().toISOString();

  try {
    // Check if already enrolled
    const existing = await c.env.DB.prepare(
      'SELECT 1 FROM learning_path_enrollments WHERE user_id = ? AND path_id = ?'
    )
      .bind(user.id, pathId)
      .first();

    if (existing) {
      return c.json({ success: false, error: 'Already enrolled' }, 400);
    }

    await c.env.DB.prepare(
      `INSERT INTO learning_path_enrollments (user_id, path_id, enrolled_at)
       VALUES (?, ?, ?)`
    )
      .bind(user.id, pathId, now)
      .run();

    return c.json({
      success: true,
      data: { pathId, enrolledAt: now },
    });
  } catch (error) {
    console.error('Enroll in path error:', error);
    return c.json({ success: false, error: 'Failed to enroll' }, 500);
  }
});

// Get progress for a specific learning path
learningRouter.get('/paths/:pathId/progress', async (c) => {
  const user = c.get('user');
  const pathId = c.req.param('pathId');

  try {
    const enrollment = await c.env.DB.prepare(
      `SELECT enrolled_at, started_at, completed_at, certificate_id
       FROM learning_path_enrollments WHERE user_id = ? AND path_id = ?`
    )
      .bind(user.id, pathId)
      .first();

    if (!enrollment) {
      return c.json({ success: false, error: 'Not enrolled in this path' }, 404);
    }

    const modules = await c.env.DB.prepare(
      `SELECT module_id, completed_at, score
       FROM module_completions WHERE user_id = ? AND path_id = ?`
    )
      .bind(user.id, pathId)
      .all();

    const skills = await c.env.DB.prepare(
      `SELECT skill_id, mastery_level, last_practiced, practice_count
       FROM skill_mastery WHERE user_id = ?`
    )
      .bind(user.id)
      .all();

    return c.json({
      success: true,
      data: {
        pathId,
        enrollment: {
          enrolledAt: (enrollment as any).enrolled_at,
          startedAt: (enrollment as any).started_at,
          completedAt: (enrollment as any).completed_at,
          certificateId: (enrollment as any).certificate_id,
        },
        completedModules: modules.results?.map((m: any) => ({
          moduleId: m.module_id,
          completedAt: m.completed_at,
          score: m.score,
        })) || [],
        skills: skills.results?.map((s: any) => ({
          skillId: s.skill_id,
          masteryLevel: s.mastery_level,
          lastPracticed: s.last_practiced,
          practiceCount: s.practice_count,
        })) || [],
      },
    });
  } catch (error) {
    console.error('Get path progress error:', error);
    return c.json({ success: false, error: 'Failed to fetch progress' }, 500);
  }
});

// Complete a module in a learning path
learningRouter.post('/paths/:pathId/modules/:moduleId/complete', validateBody(completeModuleSchema), async (c) => {
  const user = c.get('user');
  const pathId = c.req.param('pathId');
  const moduleId = c.req.param('moduleId');
  const body = c.get('validatedBody') as z.infer<typeof completeModuleSchema>;
  const now = new Date().toISOString();

  try {
    // Verify enrollment
    const enrollment = await c.env.DB.prepare(
      'SELECT started_at FROM learning_path_enrollments WHERE user_id = ? AND path_id = ?'
    )
      .bind(user.id, pathId)
      .first<{ started_at: string | null }>();

    if (!enrollment) {
      return c.json({ success: false, error: 'Not enrolled in this path' }, 404);
    }

    // Mark path as started if not already
    if (!enrollment.started_at) {
      await c.env.DB.prepare(
        'UPDATE learning_path_enrollments SET started_at = ? WHERE user_id = ? AND path_id = ?'
      )
        .bind(now, user.id, pathId)
        .run();
    }

    // Complete module
    await c.env.DB.prepare(
      `INSERT INTO module_completions (user_id, path_id, module_id, completed_at, score)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(user_id, path_id, module_id) DO UPDATE SET
         score = CASE WHEN excluded.score > score THEN excluded.score ELSE score END`
    )
      .bind(user.id, pathId, moduleId, now, body.score || 0)
      .run();

    // Award XP
    const xpEarned = 50 + Math.floor((body.score || 0) / 2); // Base 50 + up to 50 bonus
    await c.env.DB.prepare(
      'UPDATE user_progress SET xp = xp + ?, updated_at = ? WHERE user_id = ?'
    )
      .bind(xpEarned, now, user.id)
      .run();

    return c.json({
      success: true,
      data: {
        pathId,
        moduleId,
        score: body.score || 0,
        xpEarned,
        completedAt: now,
      },
    });
  } catch (error) {
    console.error('Complete module error:', error);
    return c.json({ success: false, error: 'Failed to complete module' }, 500);
  }
});

// ================== CERTIFICATES ==================

// Get user's certificates
learningRouter.get('/certificates', async (c) => {
  const user = c.get('user');

  try {
    const certificates = await c.env.DB.prepare(
      `SELECT id, path_id, student_name, issued_at, verification_code, metadata_json
       FROM certificates WHERE user_id = ?
       ORDER BY issued_at DESC`
    )
      .bind(user.id)
      .all();

    return c.json({
      success: true,
      data: certificates.results?.map((cert: any) => ({
        id: cert.id,
        pathId: cert.path_id,
        studentName: cert.student_name,
        issuedAt: cert.issued_at,
        verificationCode: cert.verification_code,
        metadata: cert.metadata_json ? JSON.parse(cert.metadata_json) : null,
      })) || [],
    });
  } catch (error) {
    console.error('Get certificates error:', error);
    return c.json({ success: false, error: 'Failed to fetch certificates' }, 500);
  }
});

// Generate certificate for completed path
learningRouter.post('/certificates/:pathId', validateBody(generateCertificateSchema), async (c) => {
  const user = c.get('user');
  const pathId = c.req.param('pathId');
  const body = c.get('validatedBody') as z.infer<typeof generateCertificateSchema>;
  const now = new Date().toISOString();

  try {
    // Check if path is completed
    const enrollment = await c.env.DB.prepare(
      'SELECT completed_at, certificate_id FROM learning_path_enrollments WHERE user_id = ? AND path_id = ?'
    )
      .bind(user.id, pathId)
      .first<{ completed_at: string | null; certificate_id: string | null }>();

    if (!enrollment) {
      return c.json({ success: false, error: 'Not enrolled in this path' }, 404);
    }

    if (enrollment.certificate_id) {
      // Already has certificate
      const existingCert = await c.env.DB.prepare(
        'SELECT * FROM certificates WHERE id = ?'
      )
        .bind(enrollment.certificate_id)
        .first();

      return c.json({
        success: true,
        data: {
          alreadyGenerated: true,
          certificate: existingCert,
        },
      });
    }

    // Generate certificate
    const certId = generateId();
    const verificationCode = `CC-${generateId().slice(0, 8).toUpperCase()}`;

    await c.env.DB.prepare(
      `INSERT INTO certificates (id, user_id, path_id, student_name, issued_at, verification_code)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
      .bind(certId, user.id, pathId, body.studentName, now, verificationCode)
      .run();

    // Update enrollment with certificate ID and mark as completed
    await c.env.DB.prepare(
      `UPDATE learning_path_enrollments
       SET completed_at = COALESCE(completed_at, ?), certificate_id = ?
       WHERE user_id = ? AND path_id = ?`
    )
      .bind(now, certId, user.id, pathId)
      .run();

    // Add to activity feed
    await c.env.DB.prepare(
      `INSERT INTO activity_feed (id, user_id, activity_type, target_id, target_type, created_at)
       VALUES (?, ?, 'certificate_earned', ?, 'certificate', ?)`
    )
      .bind(generateId(), user.id, certId, now)
      .run();

    return c.json({
      success: true,
      data: {
        id: certId,
        pathId,
        studentName: body.studentName,
        issuedAt: now,
        verificationCode,
      },
    });
  } catch (error) {
    console.error('Generate certificate error:', error);
    return c.json({ success: false, error: 'Failed to generate certificate' }, 500);
  }
});

// Verify a certificate (public endpoint)
learningRouter.get('/certificates/verify/:code', async (c) => {
  const code = c.req.param('code');

  try {
    const cert = await c.env.DB.prepare(
      `SELECT c.id, c.path_id, c.student_name, c.issued_at, c.verification_code,
              u.username
       FROM certificates c
       JOIN users u ON c.user_id = u.id
       WHERE c.verification_code = ?`
    )
      .bind(code)
      .first();

    if (!cert) {
      return c.json({ success: false, error: 'Certificate not found' }, 404);
    }

    return c.json({
      success: true,
      data: {
        valid: true,
        certificate: cert,
      },
    });
  } catch (error) {
    console.error('Verify certificate error:', error);
    return c.json({ success: false, error: 'Failed to verify certificate' }, 500);
  }
});

// ================== SKILLS ==================

// Update skill mastery
learningRouter.post('/skills/:skillId/practice', async (c) => {
  const user = c.get('user');
  const skillId = c.req.param('skillId');
  const { masteryGained } = await c.req.json();
  const now = new Date().toISOString();

  try {
    await c.env.DB.prepare(
      `INSERT INTO skill_mastery (user_id, skill_id, mastery_level, last_practiced, practice_count)
       VALUES (?, ?, ?, ?, 1)
       ON CONFLICT(user_id, skill_id) DO UPDATE SET
         mastery_level = MIN(100, mastery_level + ?),
         last_practiced = ?,
         practice_count = practice_count + 1`
    )
      .bind(user.id, skillId, masteryGained || 5, now, masteryGained || 5, now)
      .run();

    const skill = await c.env.DB.prepare(
      'SELECT mastery_level, practice_count FROM skill_mastery WHERE user_id = ? AND skill_id = ?'
    )
      .bind(user.id, skillId)
      .first();

    return c.json({
      success: true,
      data: {
        skillId,
        masteryLevel: (skill as any)?.mastery_level || 0,
        practiceCount: (skill as any)?.practice_count || 0,
      },
    });
  } catch (error) {
    console.error('Update skill mastery error:', error);
    return c.json({ success: false, error: 'Failed to update skill' }, 500);
  }
});

export { learningRouter };
