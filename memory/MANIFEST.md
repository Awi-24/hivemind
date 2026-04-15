# Memory Manifest

> **Read this first. Always. Then fetch only what it points to.**
> Updated by agents after every memory write. Load nothing else without consulting this.

---

## Tier 0 — Always Load (this file + shared-context header)

**Project**: _fill from project.json_
**Phase**: Setup | **Sprint**: 0
**Active focus**: Not configured — run `/init`

---

## Tier 1 — Load When Relevant

### Last entries per file
| File | Last entry summary | Line ref |
|------|--------------------|---------|
| `decisions.log` | [init] HiveMind Protocol initialized | L12 |
| `blockers.md` | none active | — |
| `handoff-queue.md` | init → cto: configure project.json | L10-16 |
| `shared-context.md` | initialized from template | L64 |

> Fetch **only the referenced lines**, not the full file.

### Domain index
| Domain | Relevant files | Key line refs |
|--------|---------------|--------------|
| auth | — | — |
| database | — | — |
| frontend | — | — |
| backend | — | — |
| security | `reports/audit-log.md` | L25-33 |
| infra | — | — |
| ai-ml | — | — |

> Add a row when a decision, blocker, or handoff introduces a new domain.

---

## Tier 2 — Explicit Fetch Only

Load these **only when your task requires it**. Do not load speculatively.

| Resource | When to load |
|----------|-------------|
| `decisions.log` full history | Re-evaluating an architectural decision |
| `blockers.md` resolved section | Investigating a recurring issue |
| Other agents' state files | Resuming their work or diagnosing a handoff failure |
| `reports/CHANGELOG.md` | Sprint report, release notes, audit |
| `reports/sprint-report.md` | Sprint planning or review |
| `project.json` | Modifying stack, routing, railguards, or active agents |

---

## Compaction Status

| File | Active entries | Digest covers | Last compact |
|------|---------------|--------------|-------------|
| `decisions.log` | 1 | none | never |
| `blockers.md` | 0 active | none | never |

Run `/compact` when `decisions.log` exceeds ~30 entries or entries are older than 30 days.

---

## Manifest Update Protocol

After writing to **any** memory file, update this manifest:
1. Update the relevant row in **Last entries per file** with the new summary and line ref
2. Add or update a row in **Domain index** if a new domain is introduced
3. Append one line to the **Update log** below

### Update log

```
[YYYY-MM-DD HH:MM] [init] initialized: all files — HiveMind Protocol template scaffolded
```
