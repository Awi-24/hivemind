# Scaffold Template: Monorepo (Turborepo)

> Triggered by `/scaffold monorepo --name <name>`

## Directory Structure

```
<name>/
├── apps/
│   ├── web/             ← Next.js frontend
│   └── api/             ← Node.js or FastAPI backend
├── packages/
│   ├── ui/              ← shared component library
│   ├── types/           ← shared TypeScript types
│   ├── config/          ← shared ESLint, TSConfig, etc.
│   └── utils/           ← shared utility functions
├── turbo.json
├── package.json         ← root workspace
├── pnpm-workspace.yaml
└── .env.example
```

## Conventions
- pnpm workspaces for package management
- Turborepo for build/task orchestration
- Shared types live in `packages/types` — imported by both apps
- UI components in `packages/ui` — no business logic
- Each app has its own `.env.local` (not shared)
- Run `turbo dev` to start all apps in parallel
