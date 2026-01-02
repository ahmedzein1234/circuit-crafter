// Real-time Rooms API calls

import { apiClient, type ApiResponse } from './client';

interface RoomInfo {
  roomId: string;
  wsUrl: string;
  user?: {
    id: string;
    username: string;
  };
}

interface RoomParticipant {
  userId: string;
  username: string;
  cursor?: { x: number; y: number };
}

interface RoomState {
  components: Array<{ id: string; [key: string]: unknown }>;
  wires: Array<{ id: string; [key: string]: unknown }>;
  lastModified: string;
  version: number;
}

interface ChallengeRoomInfo extends RoomInfo {
  status: 'waiting' | 'countdown' | 'active' | 'finished';
  participantCount: number;
}

interface ChallengeRoomStatus {
  challengeId: string;
  status: 'waiting' | 'countdown' | 'active' | 'finished';
  participantCount: number;
  participants: Array<{
    userId: string;
    username: string;
    score: number;
    completed: boolean;
  }>;
  startTime?: number;
  endTime?: number;
}

export const roomsApi = {
  // ==================== CIRCUIT ROOMS ====================

  /**
   * Get WebSocket URL for a circuit collaboration room
   */
  getCircuitRoom: async (circuitId: string): Promise<ApiResponse<RoomInfo>> => {
    return apiClient.get<RoomInfo>(`/rooms/circuit/${circuitId}`);
  },

  /**
   * Get current state of a circuit room
   */
  getCircuitRoomState: async (circuitId: string): Promise<ApiResponse<RoomState>> => {
    return apiClient.get<RoomState>(`/rooms/circuit/${circuitId}/state`, { skipAuth: true });
  },

  /**
   * Get participants in a circuit room
   */
  getCircuitRoomParticipants: async (
    circuitId: string
  ): Promise<ApiResponse<RoomParticipant[]>> => {
    return apiClient.get<RoomParticipant[]>(
      `/rooms/circuit/${circuitId}/participants`,
      { skipAuth: true }
    );
  },

  // ==================== CHALLENGE ROOMS ====================

  /**
   * Get available challenge rooms
   */
  getChallengeRooms: async (
    challengeId?: string
  ): Promise<ApiResponse<{ rooms: ChallengeRoomInfo[]; message: string }>> => {
    const params = challengeId ? `?challengeId=${challengeId}` : '';
    return apiClient.get<{ rooms: ChallengeRoomInfo[]; message: string }>(
      `/rooms/challenges${params}`,
      { skipAuth: true }
    );
  },

  /**
   * Join or create a challenge room
   */
  joinChallengeRoom: async (
    challengeId: string
  ): Promise<ApiResponse<ChallengeRoomInfo>> => {
    return apiClient.post<ChallengeRoomInfo>(`/rooms/challenge/${challengeId}/join`);
  },

  /**
   * Get challenge room status
   */
  getChallengeRoomStatus: async (
    challengeId: string,
    slot: string
  ): Promise<ApiResponse<ChallengeRoomStatus>> => {
    return apiClient.get<ChallengeRoomStatus>(
      `/rooms/challenge/${challengeId}/${slot}/status`,
      { skipAuth: true }
    );
  },
};

// ==================== WEBSOCKET HELPERS ====================

export interface WebSocketMessage {
  type: string;
  data?: unknown;
  [key: string]: unknown;
}

/**
 * Create a WebSocket connection to a room
 */
export function connectToRoom(
  wsUrl: string,
  handlers: {
    onOpen?: () => void;
    onMessage?: (message: WebSocketMessage) => void;
    onClose?: () => void;
    onError?: (error: Event) => void;
  }
): WebSocket {
  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    handlers.onOpen?.();
  };

  ws.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      handlers.onMessage?.(message);
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  };

  ws.onclose = () => {
    handlers.onClose?.();
  };

  ws.onerror = (error) => {
    handlers.onError?.(error);
  };

  return ws;
}

/**
 * Send a message through a WebSocket connection
 */
export function sendMessage(ws: WebSocket, message: WebSocketMessage): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

export type {
  RoomInfo,
  RoomParticipant,
  RoomState,
  ChallengeRoomInfo,
  ChallengeRoomStatus,
};
