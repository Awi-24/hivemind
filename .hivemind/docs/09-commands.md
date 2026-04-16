# 9 — Commands Reference

Every command lives in `.claude/commands/<name>.md`. The filename (without `.md`) becomes the slash command. Claude Code surfaces them in the `/` dropdown automatically.

## At a Glance (23 commands)

### Project lifecycle

| Command | Tier | Purpose |
|---------|------|---------|
| [`/init`](#init) | heavy | CTO onboarding form (run once) |
| [`/scaffold`](#scaffold) | standard | Generate project structure |
| [`/sprint`](#sprint) | lite | Sprint report |
| [`/deploy`](#deploy) | standard | QA → Security → DevOps chain |

### Daily work

| Command | Tier | Purpose |
|---------|------|---------|
| [`/status`](#status) | lite | Cross-agent summary |
| [`/standup`](#standup) | lite | Daily standup |
| [`/focus`](#focus) | lite | Scope session to one agent |
| [`/handoff`](#handoff) | lite | Formal handoff |
| [`/report`](#report) | lite | Append CHANGELOG |
| [`/decision`](#decision) | lite | Append decisions.log |
| [`/memo`](#memo) | lite | Quick one-liner note |
| [`/link`](#link) | lite | Resolve ID / tag / agent |
| [`/review`](#review) | standard | Structured code review |

### Incidents

| Command | Tier | Purpose |
|---------|------|---------|
| [`/blocker`](#blocker) | lite | Register blocker |
| [`/resolve`](#resolve) | lite | Close blocker |
| [`/hotfix`](#hotfix) | standard | Emergency fast-track |
| [`/audit`](#audit) | heavy | Security audit |
| [`/checkpoint`](#checkpoint) | lite | Snapshot pre-risky-op |

### Token hygiene

| Command | Tier | Purpose |
|---------|------|---------|
| [`/compact`](#compact) | lite | Compress old memory |
| [`/compress`](#compress) | lite | Switch session compression |
| [`/digest`](#digest) | lite | Activity summary (read-only) |
| [`/reset-context`](#reset-context) | lite | Drop non-essential context |
| [`/route`](#route) | lite | Suggest tier + owner |

---

## Full Specs

### /init

**Tier**: heavy | **File**: `.claude/commands/init.md`

CTO onboarding. 16-question form covering identity, stack, scope, agents, communication, governance. Populates `.hivemind/project.json`, writes opening `DEC-*`, creates agent state files, refreshes MANIFEST.

Run once per project. Subsequent runs detect initialized state and report status.

### /status

**Tier**: lite | **File**: `.claude/commands/status.md`

Reads MANIFEST only. Outputs project + phase + sprint + active agents with current focus + counters + last decision. Ultra compression.

### /standup

**Tier**: lite | **File**: `.claude/commands/standup.md`

Per-agent daily standup: done / today / blocked. Reads agent state files (Tier 1 for each active agent). Ultra compression.

### /focus

**Tier**: lite | **File**: `.claude/commands/focus.md` | **Arg**: `<agent>`

Scope the session to a specific agent. Loads profile + state + MANIFEST entries tagged for that agent's domain. From now on, the agent operates within its boundaries.

### /handoff

**Tier**: lite | **File**: `.claude/commands/handoff.md` | **Args**: `<from> <to> <task> [#tag]`

Formal handoff. Generates `HDF-*` ID, updates source agent state, logs a companion `DEC-*`, updates MANIFEST link + backlinks + tag index + handoff counter.

### /report

**Tier**: lite | **File**: `.claude/commands/report.md` | **Args**: `<agent> <summary> [#tag]`

Append to `CHANGELOG.md` with `CHG-*` ID. Infers type (feat/fix/refactor/docs/chore) from summary. Updates shared-context Recent changes.

### /decision

**Tier**: lite | **File**: `.claude/commands/decision.md` | **Args**: `<agent> <decision> [#tag]`

Append to `decisions.log` with `DEC-*` ID. Extracts `[[ID]]` references, supports `SUPERSEDES:`. Updates MANIFEST domain table.

### /memo

**Tier**: lite | **File**: `.claude/commands/memo.md` | **Args**: `<text> [#tag]`

Low-ceremony note. `MEM-*` ID. Stored in `shared-context.md`. Actionable memos (fix/add/check/test) also land in agent backlog.

### /link

**Tier**: lite | **File**: `.claude/commands/link.md` | **Arg**: `<ID | #tag | @agent>`

Read-only navigation. Resolves via MANIFEST, returns entry + metadata + backlinks + forward refs.

```
/link DEC-20260416-001
/link #auth
/link @backend-dev
```

### /review

**Tier**: standard | **File**: `.claude/commands/review.md` | **Args**: `<file> [--scope logic|security|style|all]`

Structured code review. Determines owning agent via `code-boundaries.md`. Output grouped by severity (CRITICAL / HIGH / MEDIUM / LOW / INFO). HIGH/CRITICAL security findings append to `audit-log.md`.

### /blocker

**Tier**: lite | **File**: `.claude/commands/blocker.md` | **Args**: `<desc> [--owner <agent>] [--severity <lvl>] [#tag]`

Register blocker. `BLK-*` ID. Critical severity auto-logs a `DEC-*` and suspends compression.

### /resolve

**Tier**: lite | **File**: `.claude/commands/resolve.md` | **Args**: `<BLK-ID or title> [--resolution <text>]`

Close blocker. **Impact check** — reads backlinks, warns if active dependents exist. Writes resolution `DEC-*`. Status transition: active → resolved.

### /hotfix

**Tier**: standard | **File**: `.claude/commands/hotfix.md` | **Args**: `<desc> [--severity critical|high] [#tag]`

Emergency fast-track. `HFX-*` ID (blocker subclass). Generates 3-step handoff chain: current → QA → Security → DevOps. Compression suspended throughout.

### /audit

**Tier**: heavy | **File**: `.claude/commands/audit.md` | **Args**: `[--scope files|deps|secrets|all]`

Security audit. One `AUD-*` per finding. CRITICAL findings auto-trigger `/blocker`. Updates `audit_last_run` counter.

### /checkpoint

**Tier**: lite | **File**: `.claude/commands/checkpoint.md` | **Args**: `[--label <name>] [#tag]`

Snapshot state before risky ops. `CHK-*` ID. Written to agent state + companion `DEC-*`. Used before db migrations, refactors, force pushes.

### /scaffold

**Tier**: standard | **File**: `.claude/commands/scaffold.md` | **Args**: `<template> [--name <name>] [--out <dir>]`

Bootstrap from template. Templates: `nextjs`, `fastapi`, `node-api`, `react-native`, `monorepo`. Writes outside `.hivemind/` (always at repo root or `--out`).

### /sprint

**Tier**: lite | **File**: `.claude/commands/sprint.md` | **Args**: `[--week YYYY-Www]`

Sprint report. `SPR-*` ID. Compiles CHANGELOG + blockers + handoffs + decisions for the window into `sprint-report.md`.

### /deploy

**Tier**: standard | **File**: `.claude/commands/deploy.md` | **Args**: `[--env staging|production]`

Formal deploy chain: QA → Security → DevOps. Preflight checks: no open CRITICAL/HIGH blockers, audit < 7 days for production. Compression suspended for production.

### /compact

**Tier**: lite | **File**: `.claude/commands/compact.md` | **Args**: `[--older-than <days>] [--file decisions|blockers|all]`

Fold old entries into a `[DIGEST]` block. Preserves IDs (Anchor → `DIGEST`, Status → `archived`). Saves tokens on cold-start. Default threshold: 30 days.

### /compress

**Tier**: lite | **File**: `.claude/commands/compress.md` | **Arg**: `normal | lite | heavy | ultra`

Switch session compression level. Does not persist to `project.json` — session-scoped.

### /digest

**Tier**: lite | **File**: `.claude/commands/digest.md` | **Args**: `[--since <days>]`

Read-only ultra-compressed activity summary. Default: last 7 days. No file writes. Useful for cold-start context restoration.

### /reset-context

**Tier**: lite | **File**: `.claude/commands/reset-context.md` | **Args**: `[--keep <agent>]`

Drop non-essential context from active consideration. Retains MANIFEST and optionally one agent profile. Re-enters Tier 0 on next task. Useful when switching focus mid-session.

### /route

**Tier**: lite | **File**: `.claude/commands/route.md` | **Arg**: `<task-description>`

Classify a task: suggests tier + owning agent + recommended command. Read-only. Call before spawning a subagent to avoid burning heavy-tier budget on lite tasks.

---

## Conventions

- Every command declares its tier in frontmatter — runtime should honor it
- Commands that write memory also update MANIFEST atomically
- Read-only commands (`/status`, `/digest`, `/link`, `/route`, `/reset-context`) never touch disk
- Compression suspension is mandatory for CRITICAL severity, irreversible ops, and the production leg of `/deploy`
- All memory-writing commands require at least one `#tag` — if missing, the command asks

## Adding a Command

See `12-customization.md §2` for the full procedure.
