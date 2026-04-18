---
description: Formal handoff with stable ID + backlinks
argument-hint: <from-agent> <to-agent> <task-description> [#tag]
model: claude-haiku-4-5-20251001
---

Args: $ARGUMENTS

Parse as `<from> <to> <task>`. Extract `#tags` and `[[ID]]` references from task text. Require at least one tag — ask if missing. Validate both agents exist in `agents.active` from `.hivemind/project.json`.

### Generate ID

1. Read MANIFEST `## Link Index`
2. Find highest NN for `HDF-<today>-*`
3. Assign `HDF-<YYYYMMDD>-<NN+1>`

### Write entry

Append to `.hivemind/memory/hm-handoff-queue.md`:

```
HDF-<YYYYMMDD>-<NN> [YYYY-MM-DD HH:MM] <tags>
FROM: [[@<from>]] → TO: [[@<to>]]
TASK: <task>
CONTEXT: <from session>
FILES: <relevant files>
MODEL: <recommended tier>
REFERENCES: <[[ID]] list or none>
STATUS: pending
```

### Update MANIFEST

1. Append row to `## Link Index`:
   `| HDF-... | handoff | handoff-queue.md | L<line> | <date> | <from>→<to> | <tags> | pending |`
2. For each `[[ID]]` → append/update `## Backlinks`
3. For each `#tag` → update `## Tag Index`
4. Bump `pending_handoffs.<to>` counter
5. Append to `## Update log`

### Also log to decisions.log

Append DEC entry referencing the handoff:
```
[<ts>] DEC-<YYYYMMDD>-<NN+1> [[@<from>]] <tags>
DECISION: handoff task to [[@<to>]] → [[HDF-...]]
REASON: <from context>
```

### Update source agent state

`.hivemind/memory/agent-states/<from>.state.md` → add under `## Outgoing`:
- `[[HDF-<YYYYMMDD>-<NN>]] → [[@<to>]]: <task first 60 chars>`

### Output (ultra)

```
✓ HDF-<YYYYMMDD>-<NN> [[@<from>]]→[[@<to>]] | tags=<list>
manifest: index+backlinks updated
```
