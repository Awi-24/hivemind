---
description: Generate sprint report
argument-hint: [--week YYYY-Www]
model: claude-haiku-4-5-20251001
---

Args: $ARGUMENTS

Determine sprint window:
- If `--week` given, use that
- Else read `meta.sprint_length_weeks` from `.hivemind/project.json` and compute current sprint window

Read (ultra-compression context only):
1. `.hivemind/reports/CHANGELOG.md` entries in window
2. `.hivemind/memory/blockers.md` (both active + resolved-in-window)
3. `.hivemind/memory/handoff-queue.md` `[DONE]` + `[PENDING]` entries
4. `.hivemind/memory/decisions.log` entries in window

Write to `.hivemind/reports/sprint-report.md` (append, don't overwrite prior sprints):

```
# Sprint <n> — <start> → <end>

## Delivered
- <feat/fix>: <summary> — <agent>

## In progress
- <task>: <owner> — <status>

## Blockers
  active: <n> | resolved: <n>
- [<severity>] <title> — <owner>

## Decisions
- <summary> — <agent>

## Velocity
  handoffs completed: <n> | open: <n>
  changelog entries: <n>
  model budget used: lite=<n> std=<n> heavy=<n>
```

Update MANIFEST sprint row.
Output (ultra): `sprint <n> report written | delivered=<n> blockers=<active>`
