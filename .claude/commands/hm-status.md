---
description: Summary of all HiveMind agents, blockers, handoffs
argument-hint: (no args)
model: claude-haiku-4-5-20251001
---

Read `.hivemind/memory/MANIFEST.md` first. If MANIFEST is fresh and complete, use it as the sole source. Only read individual files if MANIFEST lacks data.

Output in **ultra compression**:

```
=== HIVEMIND STATUS — <YYYY-MM-DD HH:MM> ===
project: <name> | phase=<phase> | sprint=<n>
agents active: <count>/<total>
  <agent> → <focus|IDLE>
  ...
blockers: <open>/<resolved> | critical=<n>
pending handoffs: <n>
  <from>→<to>: <task>
last decision: [<date>] <summary>
compression: <level>
```

Rules:
- No preamble. No postamble.
- Read only `.hivemind/memory/MANIFEST.md` + `.hivemind/memory/shared-context.md` (first 25 lines).
- Do NOT read individual agent state files unless MANIFEST timestamp > 24h old.
