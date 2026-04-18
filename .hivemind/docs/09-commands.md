# 9 — Commands Reference

Every command lives in `.claude/commands/<name>.md`. The filename (without `.md`) becomes the slash command. Claude Code surfaces them in the `/` dropdown automatically.

## At a Glance (23 commands)

### Project lifecycle

| Command | Tier | Purpose |
|---------|------|---------|
| [`/hm-init`](#init) | heavy | CTO onboarding form (run once) |
| [`/hm-scaffold`](#scaffold) | standard | Generate project structure |
| [`/hm-sprint`](#sprint) | lite | Sprint report |
| [`/hm-deploy`](#deploy) | standard | QA → Security → DevOps chain |

### Daily work

| Command | Tier | Purpose |
|---------|------|---------|
| [`/hm-status`](#status) | lite | Cross-agent summary |
| [`/hm-standup`](#standup) | lite | Daily standup |
| [`/hm-focus`](#focus) | lite | Scope session to one agent |
| [`/hm-handoff`](#handoff) | lite | Formal handoff |
| [`/hm-report`](#report) | lite | Append CHANGELOG |
| [`/hm-decision`](#decision) | lite | Append decisions.log |
| [`/hm-memo`](#memo) | lite | Quick one-liner note |
| [`/hm-link`](#link) | lite | Resolve ID / tag / agent |
| [`/hm-review`](#review) | standard | Structured code review |

### Incidents

| Command | Tier | Purpose |
|---------|------|---------|
| [`/hm-blocker`](#blocker) | lite | Register blocker |
| [`/hm-resolve`](#resolve) | lite | Close blocker |
| [`/hm-hotfix`](#hotfix) | standard | Emergency fast-track |
| [`/hm-audit`](#audit) | heavy | Security audit |
| [`/hm-checkpoint`](#checkpoint) | lite | Snapshot pre-risky-op |

### Token hygiene

| Command | Tier | Purpose |
|---------|------|---------|
| [`/hm-compact`](#compact) | lite | Compress old memory |
| [`/hm-compress`](#compress) | lite | Switch session compression |
| [`/hm-digest`](#digest) | lite | Activity summary (read-only) |
| [`/hm-reset-context`](#reset-context) | lite | Drop non-essential context |
| [`/hm-route`](#route) | lite | Suggest tier + owner |

---

## Full Specs

### /hm-init

**Tier**: heavy | **File**: `.claude/commands/hm-init.md`

CTO onboarding. 16-question form covering identity, stack, scope, agents, communication, governance. Populates `.hivemind/project.json`, writes opening `DEC-*`, creates agent state files, refreshes MANIFEST.

Run once per project. Subsequent runs detect initialized state and report status.

### /hm-status

**Tier**: lite | **File**: `.claude/commands/hm-status.md`

Reads MANIFEST only. Outputs project + phase + sprint + active agents with current focus + counters + last decision. Ultra compression.

### /hm-standup

**Tier**: lite | **File**: `.claude/commands/hm-standup.md`

Per-agent daily standup: done / today / blocked. Reads agent state files (Tier 1 for each active agent). Ultra compression.

### /hm-focus

**Tier**: lite | **File**: `.claude/commands/hm-focus.md` | **Arg**: `<agent>`

Scope the session to a specific agent. Loads profile + state + MANIFEST entries tagged for that agent's domain. From now on, the agent operates within its boundaries.

### /hm-handoff

**Tier**: lite | **File**: `.claude/commands/hm-handoff.md` | **Args**: `<from> <to> <task> [#tag]`

Formal handoff. Generates `HDF-*` ID, updates source agent state, logs a companion `DEC-*`, updates MANIFEST link + backlinks + tag index + handoff counter.

### /hm-report

**Tier**: lite | **File**: `.claude/commands/hm-report.md` | **Args**: `<agent> <summary> [#tag]`

Append to `CHANGELOG.md` with `CHG-*` ID. Infers type (feat/fix/refactor/docs/chore) from summary. Updates shared-context Recent changes.

### /hm-decision

**Tier**: lite | **File**: `.claude/commands/hm-decision.md` | **Args**: `<agent> <decision> [#tag]`

Append to `decisions.log` with `DEC-*` ID. Extracts `[[ID]]` references, supports `SUPERSEDES:`. Updates MANIFEST domain table.

### /hm-memo

**Tier**: lite | **File**: `.claude/commands/hm-memo.md` | **Args**: `<text> [#tag]`

Low-ceremony note. `MEM-*` ID. Stored in `shared-context.md`. Actionable memos (fix/add/check/test) also land in agent backlog.

### /hm-link

**Tier**: lite | **File**: `.claude/commands/hm-link.md` | **Arg**: `<ID | #tag | @agent>`

Read-only navigation. Resolves via MANIFEST, returns entry + metadata + backlinks + forward refs.

```
/hm-link DEC-20260416-001
/hm-link #auth
/hm-link @backend-dev
```

### /hm-review

**Tier**: standard | **File**: `.claude/commands/hm-review.md` | **Args**: `<file> [--scope logic|security|style|all]`

Structured code review. Determines owning agent via `code-boundaries.md`. Output grouped by severity (CRITICAL / HIGH / MEDIUM / LOW / INFO). HIGH/CRITICAL security findings append to `audit-log.md`.

### /hm-blocker

**Tier**: lite | **File**: `.claude/commands/hm-blocker.md` | **Args**: `<desc> [--owner <agent>] [--severity <lvl>] [#tag]`

Register blocker. `BLK-*` ID. Critical severity auto-logs a `DEC-*` and suspends compression.

### /hm-resolve

**Tier**: lite | **File**: `.claude/commands/hm-resolve.md` | **Args**: `<BLK-ID or title> [--resolution <text>]`

Close blocker. **Impact check** — reads backlinks, warns if active dependents exist. Writes resolution `DEC-*`. Status transition: active → resolved.

### /hm-hotfix

**Tier**: standard | **File**: `.claude/commands/hm-hotfix.md` | **Args**: `<desc> [--severity critical|high] [#tag]`

Emergency fast-track. `HFX-*` ID (blocker subclass). Generates 3-step handoff chain: current → QA → Security → DevOps. Compression suspended throughout.

### /hm-audit

**Tier**: heavy | **File**: `.claude/commands/hm-audit.md` | **Args**: `[--scope files|deps|secrets|all]`

Security audit. One `AUD-*` per finding. CRITICAL findings auto-trigger `/hm-blocker`. Updates `audit_last_run` counter.

### /hm-checkpoint

**Tier**: lite | **File**: `.claude/commands/hm-checkpoint.md` | **Args**: `[--label <name>] [#tag]`

Snapshot state before risky ops. `CHK-*` ID. Written to agent state + companion `DEC-*`. Used before db migrations, refactors, force pushes.

### /hm-scaffold

**Tier**: standard | **File**: `.claude/commands/hm-scaffold.md` | **Args**: `<template> [--name <name>] [--out <dir>]`

Bootstrap from template. Templates: `nextjs`, `fastapi`, `node-api`, `react-native`, `monorepo`. Writes outside `.hivemind/` (always at repo root or `--out`).

### /hm-sprint

**Tier**: lite | **File**: `.claude/commands/hm-sprint.md` | **Args**: `[--week YYYY-Www]`

Sprint report. `SPR-*` ID. Compiles CHANGELOG + blockers + handoffs + decisions for the window into `sprint-report.md`.

### /hm-deploy

**Tier**: standard | **File**: `.claude/commands/hm-deploy.md` | **Args**: `[--env staging|production]`

Formal deploy chain: QA → Security → DevOps. Preflight checks: no open CRITICAL/HIGH blockers, audit < 7 days for production. Compression suspended for production.

### /hm-compact

**Tier**: lite | **File**: `.claude/commands/hm-compact.md` | **Args**: `[--older-than <days>] [--file decisions|blockers|all]`

Fold old entries into a `[DIGEST]` block. Preserves IDs (Anchor → `DIGEST`, Status → `archived`). Saves tokens on cold-start. Default threshold: 30 days.

### /hm-compress

**Tier**: lite | **File**: `.claude/commands/hm-compress.md` | **Arg**: `normal | lite | heavy | ultra`

Switch session compression level. Does not persist to `project.json` — session-scoped.

### /hm-digest

**Tier**: lite | **File**: `.claude/commands/hm-digest.md` | **Args**: `[--since <days>]`

Read-only ultra-compressed activity summary. Default: last 7 days. No file writes. Useful for cold-start context restoration.

### /hm-reset-context

**Tier**: lite | **File**: `.claude/commands/hm-reset-context.md` | **Args**: `[--keep <agent>]`

Drop non-essential context from active consideration. Retains MANIFEST and optionally one agent profile. Re-enters Tier 0 on next task. Useful when switching focus mid-session.

### /hm-route

**Tier**: lite | **File**: `.claude/commands/hm-route.md` | **Arg**: `<task-description>`

Classify a task: suggests tier + owning agent + recommended command. Read-only. Call before spawning a subagent to avoid burning heavy-tier budget on lite tasks.

---

## Conventions

- Every command declares its tier in frontmatter — runtime should honor it
- Commands that write memory also update MANIFEST atomically
- Read-only commands (`/hm-status`, `/hm-digest`, `/hm-link`, `/hm-route`, `/hm-reset-context`) never touch disk
- Compression suspension is mandatory for CRITICAL severity, irreversible ops, and the production leg of `/hm-deploy`
- All memory-writing commands require at least one `#tag` — if missing, the command asks

## Adding a Command

See `12-customization.md §2` for the full procedure.
