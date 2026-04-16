---
description: Bootstrap project from a template
argument-hint: <template> [--name <project-name>] [--out <dir>]
model: claude-sonnet-4-6
---

Args: $ARGUMENTS

Templates available in `.hivemind/tools/scaffold-templates/`:
- `nextjs` — Next.js 14+ App Router + TypeScript
- `fastapi` — FastAPI + SQLAlchemy + Alembic
- `node-api` — Node + Express + TypeScript
- `react-native` — React Native + Expo
- `monorepo` — Turborepo with apps/ + packages/

Flow:
1. Read `.hivemind/tools/scaffold-templates/<template>.md`
2. Confirm target dir (default: repo root; override with `--out`)
3. Generate files per template spec — do NOT write inside `.hivemind/`
4. Append `.hivemind/memory/decisions.log`:
   `[<date>] [<agent>] SCAFFOLD: <template> → <out> | name=<name>`
5. Update `.hivemind/memory/MANIFEST.md` scaffold log
6. Output (ultra): `scaffold done: <template> @ <out>`

Rules:
- Never overwrite existing files without explicit confirm per CLAUDE.md railguards
- `.hivemind/` folder is untouchable during scaffold (framework ≠ project)
- If dependencies need install, list them at end but do NOT run install unless user confirms
