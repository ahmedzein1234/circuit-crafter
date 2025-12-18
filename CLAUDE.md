# Circuit Crafter - Claude Code Context

## What Is This Project

Educational circuit-building game evolving into a creator economy platform. Players learn electronics through interactive puzzles, then create and share their own circuits with the community. Eventually includes Web3 integration for ownership and monetization.

## Current Phase

**Phase 1: Core Game Engine** (In Progress)
- Drag-and-drop circuit canvas with grid snapping
- Component palette: battery, resistor, LED, switch, AND/OR/NOT gates, ground
- Wire drawing between component terminals
- Real-time circuit simulation using Ohm's law and logic gate truth tables
- Visual current flow animation along wires
- Component states: LEDs glow, overloaded components spark
- Tutorial puzzle levels

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 18, TypeScript | UI Framework |
| Canvas | Konva.js, react-konva | Circuit rendering |
| State | Zustand | Frontend state management |
| Styling | Tailwind CSS | UI styling |
| Backend | Cloudflare Workers, Hono | API server |
| Database | Cloudflare D1 | SQLite database |
| Storage | Cloudflare R2 | Asset storage |
| Cache | Cloudflare KV | Session & leaderboard cache |
| Real-time | Cloudflare Durable Objects | Multiplayer rooms |
| Build | Vite, Turbo | Build tooling |
| Package Manager | pnpm | Monorepo management |

## Project Structure

```
circuit-crafter/
├── apps/
│   ├── web/                    # React frontend (Cloudflare Pages)
│   │   ├── src/
│   │   │   ├── canvas/         # Circuit canvas components
│   │   │   ├── components/     # UI components
│   │   │   ├── stores/         # Zustand stores
│   │   │   └── styles/         # CSS
│   │   └── public/
│   │
│   └── api/                    # Cloudflare Workers backend
│       ├── src/
│       │   ├── routes/         # API endpoints
│       │   ├── middleware/     # Auth, validation
│       │   └── durable-objects/ # Real-time rooms
│       └── wrangler.toml
│
├── packages/
│   ├── circuit-engine/         # Core simulation logic
│   │   └── src/
│   │       ├── components/     # Component factory
│   │       └── solver/         # Circuit solver
│   │
│   └── shared/                 # Shared types & utilities
│       └── src/
│           ├── types/          # TypeScript types
│           └── utils/          # Helper functions
│
└── infrastructure/
    └── schemas/                # D1 database migrations
```

## Code Conventions

- **TypeScript**: Strict mode, explicit types, no `any`
- **React**: Functional components with hooks only
- **Styling**: Tailwind CSS classes only
- **State**: Zustand stores with typed selectors
- **API**: Hono routes with Zod validation
- **Async**: All async operations in try/catch
- **Commits**: Conventional commit messages

## Commands

| Command | Action |
|---------|--------|
| `pnpm install` | Install all dependencies |
| `pnpm dev` | Start all dev servers (Turbo) |
| `pnpm dev:web` | Start frontend only |
| `pnpm dev:api` | Start API only (wrangler) |
| `pnpm build` | Build all packages |
| `pnpm test` | Run all tests |
| `pnpm typecheck` | Type check all packages |

## Component Types

| Component | Properties | Terminals |
|-----------|------------|-----------|
| Battery | voltage (V) | positive, negative |
| Resistor | resistance (Ω) | input, output |
| LED | forward_voltage, max_current | positive, negative |
| Switch | isOpen (boolean) | input, output |
| AND Gate | - | input_a, input_b, output |
| OR Gate | - | input_a, input_b, output |
| NOT Gate | - | input, output |
| Ground | - | input |

## Simulation Rules

1. Current flows from positive to negative terminal
2. V = I × R for resistive components
3. LEDs have fixed voltage drop when on
4. Logic gates output HIGH (1) or LOW (0) based on truth tables
5. Components have max current ratings
6. Exceeding max current triggers overload state with visual effects

## Key Files

- `packages/circuit-engine/src/solver/CircuitSolver.ts` - Main simulation logic
- `packages/circuit-engine/src/solver/CircuitGraph.ts` - Graph representation
- `apps/web/src/stores/circuitStore.ts` - Frontend state management
- `apps/web/src/canvas/CircuitCanvas.tsx` - Main canvas component
- `apps/api/src/index.ts` - API entry point
- `infrastructure/schemas/0001_initial.sql` - Database schema

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login |
| GET | /api/circuits | List public circuits |
| GET | /api/circuits/:id | Get circuit details |
| POST | /api/circuits | Create circuit |
| PUT | /api/circuits/:id | Update circuit |
| DELETE | /api/circuits/:id | Delete circuit |
| POST | /api/circuits/:id/fork | Fork circuit |
| GET | /api/challenges | List challenges |
| GET | /api/challenges/:id | Get challenge |
| POST | /api/challenges/:id/submit | Submit solution |

## Design Principles

- **Immediate Feedback**: Visual response for every user action
- **Educational Failures**: Spectacular sparks and smoke teach better than error messages
- **Progressive Complexity**: Start simple, unlock advanced components
- **Creator Economy**: Every circuit is potentially shareable content

## Current Focus

Building core circuit functionality:
1. ✅ Component drag-drop onto canvas
2. ✅ Wire drawing between terminals
3. ✅ Real-time simulation
4. ✅ Visual component states
5. 🔄 Tutorial challenges
6. ⬜ User authentication
7. ⬜ Save/load circuits

## Notes for Claude

- Run `pnpm install` before `pnpm dev`
- Frontend runs on port 3000, API on port 8787
- D1 database needs local setup: `wrangler d1 create circuit-crafter-db`
- Use existing patterns when adding features
- Keep simulation logic separate from rendering
- Test circuit changes with the built-in simulation panel
