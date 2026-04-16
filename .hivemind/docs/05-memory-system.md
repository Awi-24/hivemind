# 5 — Memory System

## Goals

1. **Persist context across sessions** — agents never start from zero
2. **Minimize token cost** — 90% of sessions should never read past Tier 0
3. **Single source of truth** — MANIFEST holds the current state
4. **Auditable history** — append-only, never overwritten
5. **Survives compaction** — stable IDs, not fragile line refs

## Tiered Loading

| Tier | Content | Size | Trigger |
|------|---------|-----:|---------|
| **0** | `MANIFEST.md` | ~200 tok | Always loaded — self-sufficient snapshot |
| **1** | agent profile + own state | ~400 tok | `/focus` or role-scoped task |
| **2** | blockers / handoffs / decisions (targeted rows) | ~500 tok | MANIFEST flag indicates relevance to you |
| **3** | full logs, cross-agent states, reports | variable | Explicit fetch — never speculative |

### Tier 0 — MANIFEST (always)

Single file. Contains inline:

- Project name, phase, sprint, sprint day
- Active agents + their current focus
- Counters: active blockers (by severity), pending handoffs (by target), open hotfixes, decisions total, last audit date
- Last decision per domain (`#auth`, `#db`, …)
- Link Index (forward: `ID → file:anchor`)
- Backlinks (inverted: `ID → [referenced by]`)
- Tag Index (`#tag → [entries]`)
- Tier 1 pointers (last entry per file, pending handoffs by target)
- Compaction status
- Update log

If MANIFEST is fresh (last updated < 24h) and your task is trivial → **stop reading, start working**.

### Tier 1 — Role-specific (conditional)

Load only when operating as a specific agent role:

- `.hivemind/agents/<N>-<your-role>.md` — profile (first session only, cached thereafter)
- `.hivemind/memory/agent-states/<your-role>.state.md` — your last state

### Tier 2 — Flag-triggered (conditional)

Load only when MANIFEST counters or last-entry rows indicate relevance:

- `.hivemind/memory/blockers.md` — if `active_blockers > 0` AND one is owned by you OR blocks your task
- `.hivemind/memory/handoff-queue.md` — if `pending_handoffs.<your-slug> > 0`
- `.hivemind/memory/decisions.log` — only the specific lines MANIFEST points to for your domain

### Tier 3 — Explicit fetch (never speculative)

Load only when the task actively requires it:

- `decisions.log` full history — re-evaluating a prior architectural decision
- `blockers.md` resolved section — diagnosing a recurring issue
- Other agents' state files — resuming their work after a handoff
- `reports/*` — sprint / release / audit tasks
- `project.json` — modifying stack, routing, railguards, or active agents

## Write Protocol

Any memory write is a 5-step atomic operation:

```
1. Read MANIFEST → get next entry ID for this KIND
2. Write entry to target file (with ID inline + tags + [[links]])
3. Update MANIFEST Link Index (new row)
4. Update MANIFEST Backlinks (one row per [[ID]] reference)
5. Update MANIFEST Tag Index, counters, update log
```

If step 3–5 fails, the entry write is rolled back OR the update log records the inconsistency for the next command to repair.

## File Reference

### `MANIFEST.md`

Central index. Updated on every write. Structure:

```
# Memory Manifest

## Tier 0 Snapshot
  project, phase, sprint, active_focus, last_updated, freshness, compression, language

### Active agents + focus
  <table>

### Counters
  active_blockers, pending_handoffs, open_hotfixes, decisions_total, audit_last_run

### Last decision per domain
  <table: domain, summary, date, ID>

## Link Index
  <table: ID, kind, file, anchor, date, agent, tags, status>

## Backlinks
  <table: target ID, referenced by>

## Tag Index
  <table: tag, entries>

## Tier 1 Pointers
  last entries per file, pending handoffs per agent

## Tier 2 Triggers
  resource → load when

## Tier 3 Explicit Fetch
  resource → when to load

## Compaction Status
  <table: file, entries, digest covers, last compact>

## Update log
  <append-only log>
```

### `shared-context.md`

Project-wide state, append-only. Sections:
- Current project state (phase, sprint, focus)
- Recent changes (cap 5, oldest pruned)
- Memos (cap 20, with `MEM-*` IDs)
- Checkpoints (references to `CHK-*` IDs)

### `decisions.log`

Append-only decision log. Every entry has a `DEC-*` ID. Format:

```
[YYYY-MM-DD HH:MM] DEC-YYYYMMDD-NN [[@agent]] #tag1 #tag2
DECISION: <what>
REASON: <why>
REFERENCES: [[ID1]], [[ID2]] (or "none")
```

### `handoff-queue.md`

Cross-agent task queue. Every handoff has an `HDF-*` ID. Entries persist after `[DONE]` — never deleted (audit trail).

### `blockers.md`

Active + resolved blockers with `BLK-*` / `HFX-*` (hotfix) IDs. Two sections: `## Active`, `## Resolved`. Resolved items stay in the file for historical reference but MANIFEST status changes to `resolved`.

### `agent-states/<slug>.state.md`

Per-agent resume state. Sections:
- Current focus
- Recent work
- Outgoing handoffs (to other agents)
- Incoming handoffs (from other agents)
- Backlog (references to `MEM-*` IDs with actionable verbs)
- Checkpoints (`CHK-*` IDs with context)

## Compaction

When entries accumulate, run `/compact` to fold old entries into a digest block while preserving IDs:

```
[DIGEST: 2026-01-01 → 2026-03-15 | compacted by docs on 2026-04-16]
auth:     JWT chosen [[DEC-20260112-001]]. Refresh added [[DEC-20260228-004]].
db:       Postgres + Redis [[DEC-20260115-002]]. Alembic [[DEC-20260203-001]].
archived: DEC-20260112-001, DEC-20260115-002, DEC-20260203-001, DEC-20260228-004
[END DIGEST]
```

Post-compaction:
- Archived entries are removed from the file body
- MANIFEST Link Index rows update `Anchor → DIGEST`, `Status → archived`
- Backlinks for archived IDs are preserved — references still resolve
- Archived entries cannot be edited, only referenced

Trigger thresholds (configurable in `project.json > meta.compaction_threshold_days`):
- `decisions.log` > 30 entries OR entries > 30 days old
- `blockers.md` resolved > 50 entries

## Freshness Rule

MANIFEST has a `manifest_freshness` flag:

- `fresh` (< 24h since last update) — Tier 0 is trusted, agents skip Tier 1 unless flags demand
- `stale` (≥ 24h) — Tier 0 is loaded but agents SHOULD verify pointers against file contents before acting

Updated automatically by every write.

## Anti-patterns

- Reading `decisions.log` full "to see the whole picture" when MANIFEST summarizes it
- Reading every agent state file at session start — only read on `/focus` or `/standup`
- Re-reading files already loaded this session unless modified
- Loading Tier 2/3 speculatively "just in case"
- Writing to memory without updating MANIFEST — breaks the link index

## Recovery

If MANIFEST is corrupted or out of sync:

1. Run `/compact --file all` — rebuilds Link Index from file contents
2. If counters look wrong, read Tier 2 files directly and reconstruct MANIFEST manually
3. Append to update log: `[<ts>] [<agent>] MANIFEST rebuilt from source files`

Memory files themselves are the source of truth — MANIFEST is the index. The files can regenerate the index, not the other way around.
