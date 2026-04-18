---
description: Drop non-essential loaded context to free tokens
argument-hint: [--keep <agent>]
model: claude-haiku-4-5-20251001
---

Args: $ARGUMENTS

Does NOT touch disk. Instructs the agent to mentally drop context not needed for the next task.

Actions:
1. Retain: `.hivemind/memory/MANIFEST.md` (Tier 0), current agent profile (if `--keep <agent>`)
2. Drop from active consideration:
   - Other agents' state files
   - `decisions.log` full history (keep only MANIFEST last-entry pointers)
   - Full blockers.md (keep counters only)
   - Full CHANGELOG.md
   - Scaffold templates not in use
3. Before next action, re-enter Tier 0 flow from CLAUDE.md § 1

Output (ultra):
```
context reset.
kept: MANIFEST + <agent or none> profile
dropped: <n> files from active context
next: re-enter Tier 0 on next task
```

Use when: cold-start after compaction, sprint change, or switching agent focus mid-session.
