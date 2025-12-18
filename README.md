# Circuit Crafter

An educational circuit-building game that teaches electronics through interactive puzzles and evolves into a creator economy platform.

## Features

- **Drag-and-Drop Circuit Building**: Intuitive canvas with grid snapping
- **Real-Time Simulation**: See current flow, voltage, and power in real-time
- **Component Library**: Batteries, resistors, LEDs, switches, and logic gates
- **Visual Feedback**: LEDs glow, overloaded components spark and smoke
- **Challenge System**: Progressive tutorials and community-created puzzles
- **Social Features**: Share circuits, fork designs, compete on leaderboards

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development servers
pnpm dev

# Frontend: http://localhost:3000
# API: http://localhost:8787
```

## Tech Stack

- **Frontend**: React 18, TypeScript, Konva.js, Tailwind CSS, Zustand
- **Backend**: Cloudflare Workers, Hono, D1, R2, KV
- **Build**: Vite, Turbo, pnpm workspaces

## Project Structure

```
circuit-crafter/
├── apps/
│   ├── web/          # React frontend
│   └── api/          # Cloudflare Workers API
├── packages/
│   ├── circuit-engine/  # Simulation logic
│   └── shared/          # Shared types
└── infrastructure/
    └── schemas/         # Database migrations
```

## Development

### Prerequisites

- Node.js 18+
- pnpm 8+
- Cloudflare account (for deployment)

### Setup

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Create Cloudflare resources:
   ```bash
   wrangler d1 create circuit-crafter-db
   wrangler r2 bucket create circuit-crafter-assets
   wrangler kv:namespace create CACHE
   ```
4. Update `apps/api/wrangler.toml` with your resource IDs
5. Run database migrations:
   ```bash
   cd apps/api
   wrangler d1 execute circuit-crafter-db --local --file=../../infrastructure/schemas/0001_initial.sql
   wrangler d1 execute circuit-crafter-db --local --file=../../infrastructure/schemas/0002_seed_challenges.sql
   ```
6. Start development: `pnpm dev`

### Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all dev servers |
| `pnpm build` | Build all packages |
| `pnpm test` | Run tests |
| `pnpm typecheck` | Type check |
| `pnpm lint` | Lint code |

## Circuit Components

| Component | Description |
|-----------|-------------|
| Battery | Power source (configurable voltage) |
| Resistor | Limits current flow |
| LED | Light output (shows brightness) |
| Switch | Toggle circuit connection |
| AND Gate | Logic AND operation |
| OR Gate | Logic OR operation |
| NOT Gate | Logic inverter |
| Ground | Zero voltage reference |

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `R` | Rotate selected component |
| `Delete` | Remove selected item |
| `Escape` | Cancel operation |
| `Space` | Run simulation |

## Deployment

### Frontend (Cloudflare Pages)

```bash
cd apps/web
pnpm build
# Deploy via Cloudflare Pages dashboard or CLI
```

### Backend (Cloudflare Workers)

```bash
cd apps/api
wrangler deploy
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and type checking
5. Submit a pull request

## License

MIT

## Roadmap

- [x] Phase 1: Core circuit canvas and simulation
- [ ] Phase 2: User authentication and saved circuits
- [ ] Phase 3: Social features and community gallery
- [ ] Phase 4: Real-time multiplayer collaboration
- [ ] Phase 5: Web3 integration for creator economy
