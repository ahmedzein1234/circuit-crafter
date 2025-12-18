export interface Env {
  // D1 Database
  DB: D1Database;

  // R2 Storage
  STORAGE: R2Bucket;

  // KV Cache
  CACHE: KVNamespace;

  // Durable Objects
  CIRCUIT_ROOM: DurableObjectNamespace;
  CHALLENGE_ROOM: DurableObjectNamespace;

  // Environment variables
  ENVIRONMENT: string;
  JWT_SECRET?: string;
}
