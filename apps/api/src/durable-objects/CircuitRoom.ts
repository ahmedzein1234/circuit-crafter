/**
 * Durable Object for real-time collaborative circuit editing
 */

interface WebSocketSession {
  socket: WebSocket;
  userId: string;
  username: string;
  cursor?: { x: number; y: number };
}

interface CircuitComponent {
  id: string;
  [key: string]: unknown;
}

interface CircuitWire {
  id: string;
  [key: string]: unknown;
}

interface CircuitState {
  components: CircuitComponent[];
  wires: CircuitWire[];
  lastModified: string;
  version: number;
}

export class CircuitRoom {
  state: DurableObjectState;
  sessions: Map<WebSocket, WebSocketSession>;
  circuitState: CircuitState;

  constructor(state: DurableObjectState) {
    this.state = state;
    this.sessions = new Map();
    this.circuitState = {
      components: [],
      wires: [],
      lastModified: new Date().toISOString(),
      version: 0,
    };
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // WebSocket upgrade
    if (request.headers.get('Upgrade') === 'websocket') {
      return this.handleWebSocket(request);
    }

    // HTTP endpoints
    switch (url.pathname) {
      case '/state':
        return new Response(JSON.stringify(this.circuitState), {
          headers: { 'Content-Type': 'application/json' },
        });

      case '/participants':
        const participants = Array.from(this.sessions.values()).map((s) => ({
          userId: s.userId,
          username: s.username,
          cursor: s.cursor,
        }));
        return new Response(JSON.stringify(participants), {
          headers: { 'Content-Type': 'application/json' },
        });

      default:
        return new Response('Not Found', { status: 404 });
    }
  }

  async handleWebSocket(request: Request): Promise<Response> {
    // Get user info from headers (set by rooms router) or query params
    const userId = request.headers.get('X-User-Id') ||
                   new URL(request.url).searchParams.get('userId') || 'anonymous';
    const username = request.headers.get('X-User-Name') ||
                     new URL(request.url).searchParams.get('username') || 'Anonymous';

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    const session: WebSocketSession = {
      socket: server,
      userId,
      username,
    };

    this.sessions.set(server, session);

    server.accept();

    // Send initial state
    server.send(
      JSON.stringify({
        type: 'init',
        state: this.circuitState,
        participants: Array.from(this.sessions.values()).map((s) => ({
          userId: s.userId,
          username: s.username,
          cursor: s.cursor,
        })),
      })
    );

    // Broadcast join
    this.broadcast(
      {
        type: 'user_joined',
        user: { userId, username },
      },
      server
    );

    server.addEventListener('message', async (event) => {
      try {
        const message = JSON.parse(event.data as string);
        await this.handleMessage(session, message);
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    server.addEventListener('close', () => {
      this.sessions.delete(server);
      this.broadcast({
        type: 'user_left',
        userId,
      });
    });

    server.addEventListener('error', () => {
      this.sessions.delete(server);
    });

    return new Response(null, { status: 101, webSocket: client });
  }

  async handleMessage(
    session: WebSocketSession,
    message: { type: string; data?: unknown }
  ): Promise<void> {
    switch (message.type) {
      case 'cursor_move':
        session.cursor = message.data as { x: number; y: number };
        this.broadcast(
          {
            type: 'cursor_update',
            userId: session.userId,
            cursor: session.cursor,
          },
          session.socket
        );
        break;

      case 'add_component':
        this.circuitState.components.push(message.data as CircuitComponent);
        this.circuitState.version++;
        this.circuitState.lastModified = new Date().toISOString();
        this.broadcast({
          type: 'component_added',
          data: message.data,
          by: session.userId,
          version: this.circuitState.version,
        });
        break;

      case 'remove_component':
        const removeId = (message.data as { id: string }).id;
        this.circuitState.components = this.circuitState.components.filter(
          (c) => c.id !== removeId
        );
        this.circuitState.version++;
        this.circuitState.lastModified = new Date().toISOString();
        this.broadcast({
          type: 'component_removed',
          id: removeId,
          by: session.userId,
          version: this.circuitState.version,
        });
        break;

      case 'update_component':
        const updateData = message.data as { id: string; changes: Record<string, unknown> };
        this.circuitState.components = this.circuitState.components.map(
          (c) =>
            c.id === updateData.id
              ? { ...c, ...updateData.changes }
              : c
        );
        this.circuitState.version++;
        this.circuitState.lastModified = new Date().toISOString();
        this.broadcast({
          type: 'component_updated',
          data: updateData,
          by: session.userId,
          version: this.circuitState.version,
        });
        break;

      case 'add_wire':
        this.circuitState.wires.push(message.data as CircuitWire);
        this.circuitState.version++;
        this.circuitState.lastModified = new Date().toISOString();
        this.broadcast({
          type: 'wire_added',
          data: message.data,
          by: session.userId,
          version: this.circuitState.version,
        });
        break;

      case 'remove_wire':
        const wireId = (message.data as { id: string }).id;
        this.circuitState.wires = this.circuitState.wires.filter(
          (w) => w.id !== wireId
        );
        this.circuitState.version++;
        this.circuitState.lastModified = new Date().toISOString();
        this.broadcast({
          type: 'wire_removed',
          id: wireId,
          by: session.userId,
          version: this.circuitState.version,
        });
        break;

      case 'sync_request':
        session.socket.send(
          JSON.stringify({
            type: 'sync_response',
            state: this.circuitState,
          })
        );
        break;
    }
  }

  broadcast(message: unknown, exclude?: WebSocket): void {
    const messageStr = JSON.stringify(message);
    for (const [socket, _session] of this.sessions) {
      if (socket !== exclude) {
        try {
          socket.send(messageStr);
        } catch {
          // Socket may be closing
        }
      }
    }
  }
}
