# 6 — Linking System

Obsidian-style cross-references for memory entries. Full machine-readable spec: `.hivemind/tools/linking.md`.

## Why Links

Line refs (`decisions.log:L12`) break on compaction, reordering, and merges. Stable IDs don't. Every memory entry gets an immutable ID the moment it's created.

## Entry ID Format

```
<KIND>-<YYYYMMDD>-<NN>
```

- `KIND` — 3-letter prefix identifying the entry type
- `YYYYMMDD` — UTC date of creation
- `NN` — two-digit counter, resets daily per KIND

### Kinds

| Prefix | Type | Stored in |
|--------|------|-----------|
| `DEC` | Decision | `decisions.log` |
| `BLK` | Blocker | `blockers.md` |
| `HFX` | Hotfix (blocker subclass) | `blockers.md` |
| `HDF` | Handoff | `handoff-queue.md` |
| `CHG` | Changelog entry | `reports/CHANGELOG.md` |
| `CHK` | Checkpoint | `agent-states/<slug>.state.md` |
| `AUD` | Audit finding | `reports/audit-log.md` |
| `MEM` | Memo | `shared-context.md` |
| `SPR` | Sprint report | `reports/sprint-report.md` |

### Example IDs

```
DEC-20260416-001   first decision on 2026-04-16
BLK-20260416-003   third blocker on 2026-04-16
HDF-20260417-001   first handoff on 2026-04-17
```

## Wiki-link Syntax

```
[[<ID>]]                         reference an entry
[[<ID>|custom label]]            reference with display text
[[@<agent-slug>]]                reference an agent profile
[[#<tag>]]                       reference a domain tag
```

## Tags (required)

Every entry carries at least one `#tag`. If an entry is created without a tag, the command asks for one.

### Pre-registered tags

`#auth` `#db` `#api` `#frontend` `#backend` `#infra` `#ci` `#security` `#qa` `#data` `#docs` `#mobile` `#ai-ml` `#governance` `#perf` `#deps`

### Custom tags

Allowed. Register in MANIFEST `## Tag Registry` on first use.

## MANIFEST as Authority

MANIFEST holds three indices updated atomically with every memory write.

### Link Index (forward)

```
| ID | Kind | File | Anchor | Date | Agent | Tags | Status |
|----|------|------|--------|------|-------|------|--------|
| DEC-20260416-001 | decision | decisions.log | L23 | 2026-04-16 | backend-dev | #auth #db | active |
| BLK-20260416-003 | blocker  | blockers.md   | L12 | 2026-04-16 | backend-dev | #api #db  | active |
```

Anchor is advisory — the ID is the stable key. After compaction, Anchor updates to `DIGEST`.

### Backlinks (inverted)

```
| Target ID | Referenced by |
|-----------|---------------|
| DEC-20260401-002 | BLK-20260416-003, HDF-20260416-002 |
| BLK-20260412-003 | DEC-20260416-001, HDF-20260416-002 |
```

### Tag Index

```
| Tag | Entries |
|-----|---------|
| #auth | DEC-20260416-001, DEC-20260201-005, BLK-20260410-001 |
| #db   | DEC-20260416-001, BLK-20260416-003 |
| #api  | BLK-20260416-003 |
```

## Status Lifecycle

Every ID has a status:

| Status | Meaning |
|--------|---------|
| `active` | Current / relevant |
| `pending` | Handoff not yet picked up |
| `resolved` | Blocker closed, handoff done |
| `superseded` | Replaced by a newer entry |
| `archived` | Folded into a digest block (via `/compact`) |
| `obsolete` | Explicitly invalidated (kept for audit) |

Transitions happen atomically via commands:
- `/resolve <BLK-ID>` → `active` → `resolved`
- Adding `SUPERSEDES: [[OLD-ID]]` to a new decision → OLD-ID becomes `superseded`
- `/compact` → entries in the digest range → `archived`

## Navigation Commands

```
/link DEC-20260416-001
  → entry body + metadata + backlinks + forward references

/link #auth
  → all entries tagged #auth, grouped by kind

/link @backend-dev
  → agent profile + state + pending handoffs + authored entries
```

Read-only. No writes. Pure navigation helper.

## Example — Full Lifecycle

### 1. Audit finds a vulnerability

```
/audit --scope secrets
```

Writes `AUD-20260410-002` in `audit-log.md`:
```
### AUD-20260410-002 [HIGH] #security #auth
- **Finding**: JWT tokens stored in localStorage (XSS vector)
- **File**: src/auth/client.ts:45
- **Fix**: move to httpOnly cookie
```

### 2. Decision to migrate

```
/decision backend-dev "JWT refresh via Redis sessions, supersedes localStorage storage — addresses audit finding" #auth #db
```

Writes `DEC-20260416-001` in `decisions.log`:
```
[2026-04-16 14:30] DEC-20260416-001 [[@backend-dev]] #auth #db
DECISION: JWT refresh via Redis sessions
REASON: stateful revocation from [[AUD-20260410-002]]
SUPERSEDES: [[DEC-20260201-005]]
REFERENCES: [[AUD-20260410-002]]
```

MANIFEST updates:
- Link Index: `DEC-20260416-001` row added
- Backlinks: `AUD-20260410-002 ← DEC-20260416-001`, `DEC-20260201-005 ← DEC-20260416-001`
- Status change: `DEC-20260201-005 → superseded`
- Tag Index: `#auth` and `#db` rows gain `DEC-20260416-001`
- Counters: `decisions_total += 1`
- Last decision per domain: `#auth` row updated

### 3. Implementation blocked

```
/blocker "Redis client not in dependencies, blocks JWT rewrite" --owner backend-dev --severity high #deps #auth
```

Writes `BLK-20260416-003`:
```
### BLK-20260416-003 [HIGH] #deps #auth Redis client not in dependencies
- Owner: [[@backend-dev]]
- Blocks: [[DEC-20260416-001]]
```

MANIFEST:
- New Link Index row
- Backlinks: `DEC-20260416-001 ← BLK-20260416-003`
- `active_blockers += 1` (severity high)

### 4. Handoff to DevOps to add dependency

```
/handoff backend-dev devops "add ioredis to package.json, update compose" #deps #infra
```

Writes `HDF-20260416-002`:
```
HDF-20260416-002 [[@backend-dev]] → [[@devops]] #deps #infra
TASK: add ioredis to package.json, update compose
REFERENCES: [[BLK-20260416-003]], [[DEC-20260416-001]]
```

### 5. Resolve blocker

After DevOps does the work:

```
/resolve BLK-20260416-003 --resolution "ioredis@5.3.2 added, compose updated in CHG-20260416-005"
```

Impact check reads `## Backlinks` for `BLK-20260416-003`:
- `[[HDF-20260416-002]]` pending
- `[[DEC-20260416-001]]` active

Command warns: "1 handoff pending, 1 decision depends on this. Proceed?"

On confirmation:
- `BLK-20260416-003 → resolved`
- New `DEC-20260416-007` logs the resolution
- MANIFEST updated

### 6. Follow the chain weeks later

Someone asks: "why are we using Redis for sessions?"

```
/link DEC-20260416-001
```

Returns:
- Entry body
- `SUPERSEDES: [[DEC-20260201-005]]` (the old localStorage decision)
- `REFERENCES: [[AUD-20260410-002]]` (the audit that triggered the change)
- Backlinks: `BLK-20260416-003` (now resolved), `HDF-20260416-002` (now done), `CHG-20260416-005`

The full causal chain reconstructed in one command, no grep.

## Token Savings

Measured on a project with ~200 memory entries:

| Operation | Before (grep) | After (link index) | Savings |
|-----------|--------------:|-------------------:|--------:|
| Resolve a reference | ~800 tok | ~40 tok | ~95% |
| Find all `#auth` entries | ~1,200 tok | ~30 tok | ~97% |
| Check blocker impact | ~600 tok | ~25 tok | ~96% |
| Cold session navigation | ~3,000 tok | ~800 tok | ~73% |

## Validation Rules

Before any write, the command validates:

- [ ] ID follows `<KIND>-<YYYYMMDD>-<NN>` format
- [ ] At least one `#tag` present
- [ ] Agent references use `[[@slug]]` (not bare agent name)
- [ ] All `[[ID]]` references either exist in Link Index OR are explicitly forward refs (same-transaction)
- [ ] No duplicate ID exists
- [ ] Status is one of the lifecycle values

Failed validation → command does not write partial state.

## Anti-patterns

- Writing an entry without IDs → future references break
- Using bare agent names (`backend-dev`) instead of `[[@backend-dev]]` → MANIFEST can't resolve
- Inventing custom KIND prefixes → parsers break
- Deleting an archived entry → backlinks become dangling
- Manually editing MANIFEST without re-running the triggering command → inconsistency risk

## Rebuilding the Index

If MANIFEST becomes inconsistent:

```
/compact --file all
```

Scans all memory files, rebuilds Link Index / Backlinks / Tag Index from ID strings found inline. Appends to update log: `[<ts>] [docs] MANIFEST rebuilt from source files`.
