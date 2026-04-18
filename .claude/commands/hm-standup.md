---
description: Daily standup across all active agents
argument-hint: (no args)
model: claude-haiku-4-5-20251001
---

Read `.hivemind/memory/MANIFEST.md` first. If standup was already generated today per MANIFEST, ask user to confirm regeneration.

For each agent in `agents.active`:
- Read `.hivemind/memory/agent-states/<slug>.state.md`
- Extract: last completed task, current focus, active blockers

Output (ultra compression):
```
=== HIVEMIND STANDUP — <date> ===

<agent>
  done:    <last task>
  today:   <current focus>
  blocked: <blocker title | —>

<agent>
  ...

pending handoffs: <n>
active blockers:  <n>  (critical=<n> high=<n>)
sprint day:       <n>/<total>
```

Update MANIFEST `last_standup` row.
