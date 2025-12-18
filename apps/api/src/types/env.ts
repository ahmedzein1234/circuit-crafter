// Cloudflare Worker bindings
export interface Bindings {
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

  // Index signature for Hono compatibility
  [key: string]: unknown;
}

// User data from auth middleware
export interface User {
  id: string;
  username: string;
  email: string;
}

// Hono context variables
export interface Variables {
  user: User;
  validatedBody: unknown;
  validatedQuery: unknown;
  // Index signature for Hono compatibility
  [key: string]: unknown;
}

// Hono app environment type
export interface Env {
  Bindings: Bindings;
  Variables: Variables;
}
