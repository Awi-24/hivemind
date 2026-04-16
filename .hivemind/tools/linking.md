# Linking Protocol — Obsidian-style cross-references for HiveMind memory

> Every memory entry gets a stable ID. Every reference is a wiki-link. MANIFEST holds the forward + backlink index so agents navigate in O(1) without scanning files.

---

## Why

Line refs like `decisions.log:L12` break the moment a file is compacted, reordered, or digested. IDs are stable for the life of the project — they survive compaction, reorganization, and merges.

Goals:
- **Navigation in O(1)** — agent jumps from any ID to its entry without grep
- **Impact analysis** — agent sees what references an entry before modifying/resolving it
- **Survives compaction** — digest blocks keep IDs; line refs evaporate
- **Cross-agent clarity** — backend-dev resolving `[[BLK-20260412-003]]` knows exactly which blocker

---

## ID format

```
<KIND>-<YYYYMMDD>-<NN>
```

- `KIND`: 3-letter prefix (see table below)
- `YYYYMMDD`: date of creation (UTC)
- `NN`: zero-padded two-digit counter, scoped per KIND per day (resets daily)

Examples: `DEC-20260416-001`, `BLK-20260416-003`, `HDF-20260416-002`

### Kind prefixes

| Prefix | Entry type | File |
|--------|-----------|------|
| `DEC` | Decision | `decisions.log` |
| `BLK` | Blocker | `blockers.md` |
| `HFX` | Hotfix (subclass of blocker) | `blockers.md` |
| `HDF` | Handoff | `handoff-queue.md` |
| `CHG` | Changelog entry | `reports/CHANGELOG.md` |
| `CHK` | Checkpoint | `agent-states/<slug>.state.md` + `decisions.log` |
| `AUD` | Audit finding | `reports/audit-log.md` |
| `MEM` | Memo | `shared-context.md` |
| `SPR` | Sprint report | `reports/sprint-report.md` |

### Counter allocation

Each command that creates an entry must:
1. Read MANIFEST `## Link Index` section
2. Find highest `NN` for `<KIND>-<today>-*`
3. Assign `NN+1` (zero-padded)
4. Write entry with the ID inline
5. Append to MANIFEST link index (forward + backlinks)

---

## Wiki-link syntax

```
[[<ID>]]                    → direct reference
[[<ID>|display text]]       → reference with custom label
[[@<agent-slug>]]           → agent reference
[[#<tag>]]                  → domain tag reference
```

### Examples

Inline in a decision:
```
[2026-04-16 14:30] DEC-20260416-001 [backend-dev] #auth #db
DECISION: JWT refresh via Redis sessions
REASON: stateful revocation requirement from [[AUD-20260410-002]]
SUPERSEDES: [[DEC-20260201-005]]
BLOCKED_BY: [[BLK-20260412-003]]
```

Inline in a blocker:
```
### BLK-20260416-003 [HIGH] #api PostgreSQL migration fails on staging
- Owner: [[@backend-dev]]
- Blocks: [[HDF-20260415-001]], [[CHG-20260414-007]]
- Related: [[DEC-20260401-002]]
```

Inline in a handoff:
```
HDF-20260416-002 [2026-04-16 14:30]
FROM: [[@backend-dev]] → TO: [[@devops]]
TASK: deploy /auth service to staging
CONTEXT: blocked until [[BLK-20260412-003]] resolves
REFERENCES: [[DEC-20260416-001]]
```

---

## Domain tags

Tags are `#lowercase-kebab-case`. Pre-registered tags:

| Tag | Domain |
|-----|--------|
| `#auth` | authentication / authorization |
| `#db` | database / schema / migrations |
| `#api` | REST / GraphQL / RPC |
| `#frontend` | UI / components / client state |
| `#backend` | server logic / services |
| `#infra` | IaC / cloud / networking |
| `#ci` | CI/CD pipelines |
| `#security` | vulns / audits / threat modeling |
| `#qa` | tests / coverage / release gates |
| `#data` | pipelines / analytics / ETL |
| `#docs` | guides / API docs / ADRs |
| `#mobile` | iOS / Android / React Native |
| `#ai-ml` | LLMs / RAG / embeddings |
| `#governance` | HiveMind itself / process changes |
| `#perf` | performance / optimization |
| `#deps` | dependency / supply-chain |

Custom tags are allowed — register them in MANIFEST `## Tag Registry` the first time they appear.

Every entry must carry **at least one tag**. Untagged entries are rejected by the command (agent asks for a tag).

---

## Agent references

```
[[@cto]]            [[@lead-dev]]        [[@backend-dev]]
[[@frontend-dev]]   [[@devops]]          [[@security]]
[[@qa]]             [[@data]]            [[@docs]]
[[@mobile]]         [[@ai-ml]]           [[@product-manager]]
```

Resolves to `.hivemind/agents/<N>-<slug>.md`.

---

## MANIFEST link index

MANIFEST is the single authority for link resolution. It holds:

### Forward index

```
## Link Index

| ID | Kind | File | Anchor | Date | Agent | Tags | Status |
|----|------|------|--------|------|-------|------|--------|
| DEC-20260416-001 | decision | decisions.log | L23 | 2026-04-16 | backend-dev | #auth #db | active |
| BLK-20260416-003 | blocker  | blockers.md   | L12 | 2026-04-16 | backend-dev | #api #db  | active |
| HDF-20260416-002 | handoff  | handoff-queue.md | L45 | 2026-04-16 | backend-dev→devops | #infra | pending |
```

Anchor (`L23`) is advisory for agents to jump close — but the **ID is the stable key**, not the line number. After compaction, the line number updates in MANIFEST; the ID stays.

### Backlink index

```
## Backlinks

| Target ID | Referenced by |
|-----------|---------------|
| DEC-20260401-002 | BLK-20260416-003, HDF-20260416-002 |
| BLK-20260412-003 | DEC-20260416-001, HDF-20260416-002 |
| AUD-20260410-002 | DEC-20260416-001 |
```

### Tag index

```
## Tag Index

| Tag | Entries |
|-----|---------|
| #auth | DEC-20260416-001, DEC-20260201-005, BLK-20260410-001 |
| #db   | DEC-20260416-001, BLK-20260416-003 |
| #api  | BLK-20260416-003 |
```

---

## Resolution protocol

When an agent encounters `[[<ID>]]`:

1. Open MANIFEST → `## Link Index` → look up ID
2. If found → fetch `<file>:<anchor>` (use anchor as hint, but search for the ID string in the file to verify position)
3. If NOT found → MANIFEST is stale; run `/route` or grep the file for the ID
4. If the agent is analyzing impact of modifying/resolving an entry → also read `## Backlinks` for that ID

When an agent encounters `[[#<tag>]]`:
1. Open MANIFEST → `## Tag Index` → `<tag>` row
2. Return the list of entry IDs

When an agent encounters `[[@<slug>]]`:
1. Resolve to `.hivemind/agents/<N>-<slug>.md`

---

## Write protocol (mandatory for ID-generating commands)

Every command that creates a new entry MUST:

1. **Generate ID**:
   - Read MANIFEST forward index for today + this KIND
   - Assign next NN
2. **Write entry with ID inline** using the format for that kind (see examples above)
3. **Extract tags** from command args or entry body — at least one required
4. **Detect forward references** (any `[[ID]]` or `[[#tag]]` in the entry body)
5. **Update MANIFEST**:
   - Append row to `## Link Index`
   - For each forward reference → append/update row in `## Backlinks` (the target gains a new backlink)
   - For each tag → append to `## Tag Index`
6. **Update MANIFEST counters** (existing Tier 0 snapshot)
7. **Update MANIFEST update log**

The write to MANIFEST is part of the atomic operation. If MANIFEST update fails, the entry write is rolled back (or at minimum, flagged in the update log).

---

## Status lifecycle

Entries have a status column in the Link Index:

| Status | Meaning |
|--------|---------|
| `active` | Current / relevant |
| `resolved` | Blocker closed, handoff done, decision superseded |
| `superseded` | Replaced by a newer entry (`SUPERSEDED_BY: [[NEW-ID]]`) |
| `archived` | Compacted into a digest block; ID still valid |
| `obsolete` | Explicitly invalidated; kept for audit but should not be followed |

Transitions:
- `/resolve <BLK-ID>` → status `active` → `resolved`
- Adding `SUPERSEDES: [[OLD-ID]]` to a new entry → OLD-ID transitions to `superseded`
- `/compact` → entries in the digest range → `archived` (IDs remain valid)

---

## Compaction behavior

When `/compact` runs:
1. Entries older than threshold are replaced by a single `[DIGEST]` block at the top of the file
2. The digest block contains a compressed summary PLUS the list of archived IDs:
   ```
   [DIGEST: 2026-01-01 → 2026-03-15 | compacted by docs on 2026-04-16]
   auth:     JWT chosen [[DEC-20260112-001]]. Refresh added [[DEC-20260228-004]].
   db:       Postgres + Redis [[DEC-20260115-002]]. Alembic [[DEC-20260203-001]].
   archived: DEC-20260112-001, DEC-20260115-002, DEC-20260203-001, DEC-20260228-004
   [END DIGEST]
   ```
3. MANIFEST Link Index rows for archived IDs update `Anchor` to `DIGEST` and `Status` to `archived`
4. Backlink index is preserved — references to archived IDs still resolve

Archived entries cannot be edited, only referenced.

---

## Validation rules

Before writing any entry, validate:

- [ ] ID follows `<KIND>-<YYYYMMDD>-<NN>` format
- [ ] At least one `#tag` present
- [ ] Agent reference uses `[[@slug]]` format (not bare agent name)
- [ ] All inline `[[ID]]` references exist in MANIFEST Link Index (warn if not — may be a forward reference to an entry being created)
- [ ] No duplicate ID exists
- [ ] Status is one of the lifecycle values

Commands that fail validation must not write partial state.

---

## Agent behavior changes

- When creating an entry → generate ID, require tags, update MANIFEST atomically
- When reading an entry with references → resolve via MANIFEST link index, not grep
- When resolving a blocker → check backlinks first; warn if blocker has unresolved dependents
- When proposing a decision → check if any existing decision in same tag(s) supersedes it; link with `SUPERSEDES:`
- When performing `/audit` → check MANIFEST for entries tagged `#security` without an `AUD-*` backlink

---

## Token impact

Measured on a project with ~200 memory entries:

| Operation | Before (scan) | After (link index) | Savings |
|-----------|---------------|--------------------|---------|
| Resolve a reference | ~800 tok (grep + read) | ~40 tok (MANIFEST row) | ~95% |
| Find all #auth entries | ~1,200 tok (scan logs) | ~30 tok (tag index row) | ~97% |
| Check blocker impact | ~600 tok (search refs) | ~25 tok (backlink row) | ~96% |
| Cold session navigation | ~3,000 tok | ~800 tok | ~73% |

---

## CLI / Command integration

- `/decision`, `/blocker`, `/handoff`, `/report`, `/resolve`, `/hotfix`, `/checkpoint`, `/audit`, `/memo` → generate IDs automatically
- `/link <ID|#tag|@agent>` → resolve a reference, return file:line + entry body + backlinks
- `/compact` → preserves IDs, updates Anchor to `DIGEST`
- `/digest` → respects IDs when summarizing activity

---

## Example — full flow

1. User runs `/blocker "Migration fails on staging" --owner backend-dev --severity high`
2. Command generates `BLK-20260416-003`, extracts `#api` `#db` tags from description
3. Writes to `.hivemind/memory/blockers.md`:
   ```
   ### BLK-20260416-003 [HIGH] #api #db Migration fails on staging
   - Date: 2026-04-16
   - Owner: [[@backend-dev]]
   - Status: active
   ```
4. Updates MANIFEST:
   - Link Index: new row for BLK-20260416-003
   - Tag Index: add BLK-20260416-003 to `#api` and `#db` rows
   - Counters: active_blockers += 1 (high)
5. Later, `/handoff backend-dev devops "deploy auth service"` generates `HDF-20260416-002` with body referencing `[[BLK-20260416-003]]`
6. MANIFEST Backlinks table gets a row: `BLK-20260416-003 ← HDF-20260416-002`
7. When devops reads the handoff, they follow `[[BLK-20260416-003]]` via MANIFEST → instant context, no grep
8. When `/resolve BLK-20260416-003` runs, it warns: "This blocker has 1 active dependent: HDF-20260416-002 (pending). Resolve anyway?"
