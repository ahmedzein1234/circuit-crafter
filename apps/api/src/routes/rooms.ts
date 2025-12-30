import { Hono } from 'hono';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth';
import type { Env } from '../types/env';

const roomsRouter = new Hono<Env>();

// Get WebSocket URL for circuit collaboration room
roomsRouter.get('/circuit/:circuitId', authMiddleware, async (c) => {
  const user = c.get('user');
  const circuitId = c.req.param('circuitId');

  try {
    // Verify circuit exists
    const circuit = await c.env.DB.prepare(
      'SELECT id, user_id, is_public FROM circuits WHERE id = ?'
    )
      .bind(circuitId)
      .first<{ id: string; user_id: string; is_public: number }>();

    if (!circuit) {
      return c.json({ success: false, error: 'Circuit not found' }, 404);
    }

    // Check access (owner or public)
    if (circuit.user_id !== user.id && !circuit.is_public) {
      return c.json({ success: false, error: 'Not authorized' }, 403);
    }

    // Generate room URL
    const url = new URL(c.req.url);
    const wsUrl = `${url.protocol === 'https:' ? 'wss:' : 'ws:'}//${url.host}/api/rooms/circuit/${circuitId}/ws`;

    return c.json({
      success: true,
      data: {
        roomId: circuitId,
        wsUrl,
        user: {
          id: user.id,
          username: user.username,
        },
      },
    });
  } catch (error) {
    console.error('Get circuit room error:', error);
    return c.json({ success: false, error: 'Failed to get room' }, 500);
  }
});

// WebSocket connection for circuit room
roomsRouter.get('/circuit/:circuitId/ws', authMiddleware, async (c) => {
  const user = c.get('user');
  const circuitId = c.req.param('circuitId');

  // Upgrade to WebSocket
  const upgradeHeader = c.req.header('Upgrade');
  if (upgradeHeader !== 'websocket') {
    return c.json({ success: false, error: 'Expected WebSocket upgrade' }, 426);
  }

  // Get durable object and forward request
  const roomId = c.env.CIRCUIT_ROOM.idFromName(circuitId);
  const roomStub = c.env.CIRCUIT_ROOM.get(roomId);

  // Add user info to request headers for the durable object
  const newHeaders = new Headers(c.req.raw.headers);
  newHeaders.set('X-User-Id', user.id);
  newHeaders.set('X-User-Name', user.username);

  const newRequest = new Request(c.req.raw, { headers: newHeaders });
  return roomStub.fetch(newRequest);
});

// Get circuit room state
roomsRouter.get('/circuit/:circuitId/state', optionalAuthMiddleware, async (c) => {
  const circuitId = c.req.param('circuitId');

  try {
    const roomId = c.env.CIRCUIT_ROOM.idFromName(circuitId);
    const roomStub = c.env.CIRCUIT_ROOM.get(roomId);

    const response = await roomStub.fetch(
      new Request(`http://internal/state`, { method: 'GET' })
    );

    const state = await response.json();
    return c.json({ success: true, data: state });
  } catch (error) {
    console.error('Get room state error:', error);
    return c.json({ success: false, error: 'Failed to get room state' }, 500);
  }
});

// Get circuit room participants
roomsRouter.get('/circuit/:circuitId/participants', optionalAuthMiddleware, async (c) => {
  const circuitId = c.req.param('circuitId');

  try {
    const roomId = c.env.CIRCUIT_ROOM.idFromName(circuitId);
    const roomStub = c.env.CIRCUIT_ROOM.get(roomId);

    const response = await roomStub.fetch(
      new Request(`http://internal/participants`, { method: 'GET' })
    );

    const participants = await response.json();
    return c.json({ success: true, data: participants });
  } catch (error) {
    console.error('Get participants error:', error);
    return c.json({ success: false, error: 'Failed to get participants' }, 500);
  }
});

// ================== CHALLENGE ROOMS ==================

// Get available challenge rooms
roomsRouter.get('/challenges', optionalAuthMiddleware, async (c) => {
  // challengeId can be used for filtering in future
  // const challengeId = c.req.query('challengeId');

  try {
    // This would typically query a list of active rooms from KV or D1
    // For now, return empty - real implementation would track active rooms
    return c.json({
      success: true,
      data: {
        rooms: [],
        message: 'Challenge rooms are matched on-demand',
      },
    });
  } catch (error) {
    console.error('Get challenge rooms error:', error);
    return c.json({ success: false, error: 'Failed to get rooms' }, 500);
  }
});

// Join or create a challenge room
roomsRouter.post('/challenge/:challengeId/join', authMiddleware, async (c) => {
  // User is validated by authMiddleware
  const challengeId = c.req.param('challengeId');

  try {
    // Verify challenge exists
    const challenge = await c.env.DB.prepare(
      'SELECT id, title FROM challenges WHERE id = ?'
    )
      .bind(challengeId)
      .first();

    if (!challenge) {
      return c.json({ success: false, error: 'Challenge not found' }, 404);
    }

    // Create a room ID (could be based on matchmaking logic)
    // For simplicity, use a time-based room that groups players joining around the same time
    const timeSlot = Math.floor(Date.now() / 60000); // 1 minute slots
    const roomName = `challenge:${challengeId}:${timeSlot}`;

    const roomId = c.env.CHALLENGE_ROOM.idFromName(roomName);
    const roomStub = c.env.CHALLENGE_ROOM.get(roomId);

    // Check room status
    const statusResponse = await roomStub.fetch(
      new Request('http://internal/status', { method: 'GET' })
    );
    const status = await statusResponse.json() as { participantCount: number; status: string };

    // If room is full or already started, create new room
    if (status.participantCount >= 10 || status.status !== 'waiting') {
      // Create new room with next time slot
      const newRoomName = `challenge:${challengeId}:${timeSlot + 1}`;

      const url = new URL(c.req.url);
      const wsUrl = `${url.protocol === 'https:' ? 'wss:' : 'ws:'}//${url.host}/api/rooms/challenge/${challengeId}/${timeSlot + 1}/ws`;

      return c.json({
        success: true,
        data: {
          roomId: newRoomName,
          wsUrl,
          status: 'waiting',
          participantCount: 0,
        },
      });
    }

    const url = new URL(c.req.url);
    const wsUrl = `${url.protocol === 'https:' ? 'wss:' : 'ws:'}//${url.host}/api/rooms/challenge/${challengeId}/${timeSlot}/ws`;

    return c.json({
      success: true,
      data: {
        roomId: roomName,
        wsUrl,
        status: status.status,
        participantCount: status.participantCount,
      },
    });
  } catch (error) {
    console.error('Join challenge room error:', error);
    return c.json({ success: false, error: 'Failed to join room' }, 500);
  }
});

// WebSocket connection for challenge room
roomsRouter.get('/challenge/:challengeId/:slot/ws', authMiddleware, async (c) => {
  const user = c.get('user');
  const challengeId = c.req.param('challengeId');
  const slot = c.req.param('slot');

  const upgradeHeader = c.req.header('Upgrade');
  if (upgradeHeader !== 'websocket') {
    return c.json({ success: false, error: 'Expected WebSocket upgrade' }, 426);
  }

  const roomName = `challenge:${challengeId}:${slot}`;
  const roomId = c.env.CHALLENGE_ROOM.idFromName(roomName);
  const roomStub = c.env.CHALLENGE_ROOM.get(roomId);

  const newHeaders = new Headers(c.req.raw.headers);
  newHeaders.set('X-User-Id', user.id);
  newHeaders.set('X-User-Name', user.username);
  newHeaders.set('X-Challenge-Id', challengeId);

  const newRequest = new Request(c.req.raw, { headers: newHeaders });
  return roomStub.fetch(newRequest);
});

export { roomsRouter };
