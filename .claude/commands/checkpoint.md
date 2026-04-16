---
description: Snapshot state pre-risky-op with CHK-ID
argument-hint: [--label <name>] [#tag]
model: claude-haiku-4-5-20251001
---

Args: $ARGUMENTS

Label defaults to `checkpoint-<timestamp>`. Require at least one tag.

### Generate ID

Read MANIFEST. Assign `CHK-<YYYYMMDD>-<NN>`.

### Write checkpoint

1. Append to `.hivemind/memory/agent-states/<active-agent>.state.md` under `## Checkpoints`:
   ```
   ### CHK-<YYYYMMDD>-<NN> — <label> — <tags>
   - **Date**: <ts>
   - **Context**: <one-line summary of active task>
   - **Files in flight**: <list>
   - **Next action**: <what was about to run>
   ```

2. Append DEC to `decisions.log`:
   ```
   [<ts>] DEC-<NN+1> [[@<agent>]] <tags>
   DECISION: checkpoint before <context>
   REASON: pre-risky-op snapshot
   REFERENCES: [[CHK-...]]
   ```

3. Append marker to `shared-context.md` `## Checkpoints`:
   - `[[CHK-<YYYYMMDD>-<NN>]] <label> by [[@<agent>]]`

### Update MANIFEST

- Append rows to `## Link Index` (CHK + DEC)
- Tag Index + Backlinks updated
- Append to `## Update log`

### Output (ultra)

```
✓ [[CHK-<YYYYMMDD>-<NN>]] saved | label=<label> | agent=<slug>
```

Use before: db migrations, refactors spanning 3+ files, destructive ops, force pushes.
