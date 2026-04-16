# Memory Manifest

> **Read this first. Always. Then fetch only what it points to.**
> Self-sufficient for Tier 0. Authoritative index for IDs, tags, and backlinks.
> Updated by every command that writes memory.

---

## Tier 0 Snapshot (this block = full session context for most tasks)

```
project:            my-project           ← filled by /init
phase:              discovery            ← discovery | mvp | beta | production | maintenance
sprint:             0 (day 0 / 0)
active_focus:       not configured — run /init
last_updated:       YYYY-MM-DD HH:MM
manifest_freshness: stale (> 24h)        ← fresh | stale
compression:        heavy                ← normal | lite | heavy | ultra
reply_language:     en
```

### Active agents + focus

| Agent | Status | Current focus | Last active |
|-------|--------|---------------|-------------|
| cto | idle | awaiting /init | — |
| lead-dev | idle | — | — |

### Counters

| Counter | Value | Notes |
|---------|------:|-------|
| active_blockers | 0 | crit=0 high=0 med=0 low=0 |
| pending_handoffs | 1 | cto=1 |
| open_hotfixes | 0 | — |
| decisions_total | 1 | since last compact |
| audit_last_run | never | gate for `/deploy --env production` |

### Last decision per domain

| Domain | Last decision | Date | Entry ID |
|--------|---------------|------|----------|
| governance | HiveMind initialized | YYYY-MM-DD | `DEC-YYYYMMDD-001` |
| auth | — | — | — |
| db | — | — | — |
| api | — | — | — |
| frontend | — | — | — |
| infra | — | — | — |
| security | — | — | — |
| ai-ml | — | — | — |

---

## Link Index (forward lookup — ID → file + anchor)

> Full spec in `.hivemind/tools/linking.md`. Every ID-generating command appends here.

| ID | Kind | File | Anchor | Date | Agent | Tags | Status |
|----|------|------|--------|------|-------|------|--------|
| DEC-YYYYMMDD-001 | decision | `decisions.log` | L5 | YYYY-MM-DD | init | #governance | active |
| HDF-YYYYMMDD-001 | handoff  | `handoff-queue.md` | L5 | YYYY-MM-DD | init→cto | #governance | pending |

> Anchor is advisory (line hint). The ID is the stable key — search the file for the ID string if the line has shifted.

---

## Backlinks (inverted index — target ID → referenced by)

> When entry X cites `[[Y]]`, Y gains a backlink from X.

| Target ID | Referenced by |
|-----------|---------------|
| _no references yet_ | — |

---

## Tag Index (domain → entries)

| Tag | Entries |
|-----|---------|
| `#governance` | DEC-YYYYMMDD-001, HDF-YYYYMMDD-001 |
| `#auth` | — |
| `#db` | — |
| `#api` | — |
| `#frontend` | — |
| `#backend` | — |
| `#infra` | — |
| `#ci` | — |
| `#security` | — |
| `#qa` | — |
| `#data` | — |
| `#docs` | — |
| `#mobile` | — |
| `#ai-ml` | — |
| `#perf` | — |
| `#deps` | — |

### Custom tag registry
_empty._ (Register new tags here the first time they appear.)

---

## Tier 1 Pointers (fallback when ID lookup is not enough)

### Last entries per memory file

| File | Last entry summary | Entry ID |
|------|--------------------|----------|
| `decisions.log` | [init] HiveMind framework initialized | `DEC-YYYYMMDD-001` |
| `blockers.md` | none active | — |
| `handoff-queue.md` | init → cto: configure project.json | `HDF-YYYYMMDD-001` |
| `shared-context.md` | template scaffolded | — |

### Pending handoffs per agent

| Target agent | Count | Entry IDs |
|--------------|------:|-----------|
| cto | 1 | `HDF-YYYYMMDD-001` |

---

## Tier 2 Triggers (load only if flag above says so)

| Resource | Load when |
|----------|-----------|
| `blockers.md` full | `active_blockers > 0` AND task owned by you OR blocks your task |
| `handoff-queue.md` full | `pending_handoffs.<your-slug> > 0` |
| `decisions.log` full | Re-evaluating a settled architectural decision |
| Another agent's state | Resuming their work after handoff |

---

## Tier 3 — Explicit Fetch Only (never speculative)

| Resource | When to load |
|----------|--------------|
| `decisions.log` full history | Deep archaeology only |
| `blockers.md` resolved section | Diagnosing recurring issue |
| `reports/CHANGELOG.md` | Sprint report, release notes, audit |
| `reports/sprint-report.md` | Sprint planning or review |
| `reports/audit-log.md` | Security review or incident RCA |
| `.hivemind/project.json` | Modifying stack, routing, railguards, agents |
| `.hivemind/tools/scaffold-templates/*` | Running `/scaffold` |

---

## Compaction Status

| File | Active entries | Digest covers | Last compact |
|------|---------------:|---------------|--------------|
| `decisions.log` | 1 | none | never |
| `blockers.md` | 0 | none | never |
| `handoff-queue.md` | 1 pending / 0 done | none | never |

Run `/compact` when `decisions.log` exceeds ~30 entries or entries are older than `meta.compaction_threshold_days`.

IDs survive compaction — the `Anchor` column updates to `DIGEST` and `Status` to `archived`.

---

## Manifest Update Protocol

After writing to **any** memory file, update this manifest (atomic with the entry write):

1. Refresh Tier 0 Snapshot (`last_updated`, `manifest_freshness`)
2. Append row to **Link Index** with the new ID
3. For each `[[ID]]` reference in the new entry → append/update row in **Backlinks**
4. For each `#tag` in the new entry → append to **Tag Index** row
5. Update **Last entries per memory file** (summary + ID)
6. Bump **Counters** if applicable (blockers/handoffs/decisions/hotfixes)
7. Update **Last decision per domain** if entry is a decision
8. Append one line to **Update log**

### Freshness rule

- `fresh` (< 24h since last update): Tier 0 is trusted — agents skip Tier 1 unless flags demand
- `stale` (≥ 24h): Tier 0 is loaded but agents SHOULD verify pointers against file contents before acting

### Atomicity

If the MANIFEST write fails mid-operation, the entry write must be rolled back OR the update log must record the inconsistency for the next command to repair.

---

## Update log

```
[YYYY-MM-DD HH:MM] [init] scaffolded: all files — HiveMind Protocol template (DEC-YYYYMMDD-001, HDF-YYYYMMDD-001)
```
