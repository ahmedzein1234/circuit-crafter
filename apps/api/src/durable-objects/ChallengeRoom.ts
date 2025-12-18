/**
 * Durable Object for real-time challenge competitions
 */

interface Participant {
  socket: WebSocket;
  userId: string;
  username: string;
  score: number;
  completed: boolean;
  solveTime?: number;
}

interface ChallengeRoomState {
  challengeId: string;
  status: 'waiting' | 'countdown' | 'active' | 'finished';
  startTime?: number;
  endTime?: number;
  maxParticipants: number;
  timeLimit: number;
}

export class ChallengeRoom {
  state: DurableObjectState;
  participants: Map<WebSocket, Participant>;
  roomState: ChallengeRoomState;
  countdownTimer?: number;

  constructor(state: DurableObjectState) {
    this.state = state;
    this.participants = new Map();
    this.roomState = {
      challengeId: '',
      status: 'waiting',
      maxParticipants: 10,
      timeLimit: 300, // 5 minutes default
    };
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.headers.get('Upgrade') === 'websocket') {
      return this.handleWebSocket(request);
    }

    switch (url.pathname) {
      case '/status':
        return new Response(
          JSON.stringify({
            ...this.roomState,
            participantCount: this.participants.size,
            participants: Array.from(this.participants.values()).map((p) => ({
              userId: p.userId,
              username: p.username,
              score: p.score,
              completed: p.completed,
            })),
          }),
          { headers: { 'Content-Type': 'application/json' } }
        );

      case '/start':
        if (request.method === 'POST') {
          return this.startChallenge();
        }
        return new Response('Method Not Allowed', { status: 405 });

      default:
        return new Response('Not Found', { status: 404 });
    }
  }

  async handleWebSocket(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || 'anonymous';
    const username = url.searchParams.get('username') || 'Anonymous';
    const challengeId = url.searchParams.get('challengeId');

    if (challengeId && !this.roomState.challengeId) {
      this.roomState.challengeId = challengeId;
    }

    if (this.participants.size >= this.roomState.maxParticipants) {
      return new Response('Room is full', { status: 403 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    const participant: Participant = {
      socket: server,
      userId,
      username,
      score: 0,
      completed: false,
    };

    this.participants.set(server, participant);
    server.accept();

    // Send initial state
    server.send(
      JSON.stringify({
        type: 'init',
        roomState: this.roomState,
        participants: this.getParticipantList(),
      })
    );

    // Broadcast join
    this.broadcast(
      {
        type: 'participant_joined',
        participant: {
          userId,
          username,
          score: 0,
          completed: false,
        },
      },
      server
    );

    server.addEventListener('message', async (event) => {
      try {
        const message = JSON.parse(event.data as string);
        await this.handleMessage(participant, message);
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    server.addEventListener('close', () => {
      this.participants.delete(server);
      this.broadcast({
        type: 'participant_left',
        userId,
      });

      // If room is empty during waiting, reset
      if (this.participants.size === 0 && this.roomState.status === 'waiting') {
        this.resetRoom();
      }
    });

    server.addEventListener('error', () => {
      this.participants.delete(server);
    });

    return new Response(null, { status: 101, webSocket: client });
  }

  async handleMessage(
    participant: Participant,
    message: { type: string; data?: unknown }
  ): Promise<void> {
    switch (message.type) {
      case 'ready':
        // Mark participant as ready
        this.broadcast({
          type: 'participant_ready',
          userId: participant.userId,
        });

        // Auto-start if all participants are ready
        const allReady = Array.from(this.participants.values()).every(
          (p) => p.userId === participant.userId || (message.data as { ready?: boolean })?.ready
        );
        if (allReady && this.participants.size >= 2) {
          this.startCountdown();
        }
        break;

      case 'submit_solution':
        if (this.roomState.status !== 'active') return;

        const submitData = message.data as {
          passed: boolean;
          score?: number;
        };

        if (submitData.passed) {
          participant.completed = true;
          participant.solveTime = Date.now() - (this.roomState.startTime || 0);
          participant.score = submitData.score || 100;

          this.broadcast({
            type: 'participant_completed',
            userId: participant.userId,
            username: participant.username,
            solveTime: participant.solveTime,
            score: participant.score,
          });

          // Check if all participants completed
          const allCompleted = Array.from(this.participants.values()).every(
            (p) => p.completed
          );
          if (allCompleted) {
            this.endChallenge();
          }
        }
        break;

      case 'chat':
        this.broadcast({
          type: 'chat',
          userId: participant.userId,
          username: participant.username,
          message: (message.data as { message: string }).message,
          timestamp: Date.now(),
        });
        break;
    }
  }

  startCountdown(): void {
    if (this.roomState.status !== 'waiting') return;

    this.roomState.status = 'countdown';
    let countdown = 3;

    const countdownInterval = setInterval(() => {
      this.broadcast({
        type: 'countdown',
        seconds: countdown,
      });

      countdown--;

      if (countdown < 0) {
        clearInterval(countdownInterval);
        this.startChallengeActive();
      }
    }, 1000);
  }

  startChallengeActive(): void {
    this.roomState.status = 'active';
    this.roomState.startTime = Date.now();
    this.roomState.endTime = this.roomState.startTime + this.roomState.timeLimit * 1000;

    this.broadcast({
      type: 'challenge_started',
      startTime: this.roomState.startTime,
      endTime: this.roomState.endTime,
    });

    // Set timer to end challenge
    setTimeout(() => {
      if (this.roomState.status === 'active') {
        this.endChallenge();
      }
    }, this.roomState.timeLimit * 1000);
  }

  startChallenge(): Response {
    if (this.roomState.status !== 'waiting') {
      return new Response('Challenge already started', { status: 400 });
    }

    this.startCountdown();
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  endChallenge(): void {
    this.roomState.status = 'finished';

    const results = Array.from(this.participants.values())
      .map((p) => ({
        userId: p.userId,
        username: p.username,
        score: p.score,
        completed: p.completed,
        solveTime: p.solveTime,
      }))
      .sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? -1 : 1;
        if (a.solveTime && b.solveTime) return a.solveTime - b.solveTime;
        return b.score - a.score;
      })
      .map((p, index) => ({ ...p, rank: index + 1 }));

    this.broadcast({
      type: 'challenge_ended',
      results,
    });
  }

  resetRoom(): void {
    this.roomState = {
      challengeId: '',
      status: 'waiting',
      maxParticipants: 10,
      timeLimit: 300,
    };
  }

  getParticipantList(): Array<{
    userId: string;
    username: string;
    score: number;
    completed: boolean;
  }> {
    return Array.from(this.participants.values()).map((p) => ({
      userId: p.userId,
      username: p.username,
      score: p.score,
      completed: p.completed,
    }));
  }

  broadcast(message: unknown, exclude?: WebSocket): void {
    const messageStr = JSON.stringify(message);
    for (const [socket] of this.participants) {
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
