---
description: Register blocker with stable ID + tags + backlinks
argument-hint: <description> [--owner <agent>] [--severity critical|high|medium|low] [#tag1 #tag2]
model: claude-haiku-4-5-20251001
---

Args: $ARGUMENTS

Parse description + optional `--owner` + `--severity` (default: medium) + inline `#tags` and `[[ID]]` references. Require at least one tag — ask if missing.

### Generate ID

1. Read MANIFEST `## Link Index`
2. Find highest NN for `BLK-<today>-*`
3. Assign `BLK-<YYYYMMDD>-<NN+1>`

### Write entry

Append to `.hivemind/memory/blockers.md` under `## Active`:

```
### BLK-<YYYYMMDD>-<NN> [<severity>] <tags> <description>
- **Date**: <date>
- **Owner**: [[@<agent>]] or UNASSIGNED
- **Status**: active
- **Context**: <from session>
- **Blocks**: <[[ID]] list or describe what is blocked>
- **References**: <[[ID]] list or none>
```

### Update MANIFEST

1. Append row to `## Link Index`:
   `| BLK-... | blocker | blockers.md | L<line> | <date> | <owner> | <tags> | active |`
2. For each `[[ID]]` in "Blocks" or "References" → append/update `## Backlinks`
3. For each `#tag` → append BLK-ID to `## Tag Index`
4. Bump `active_blockers` counter + increment severity sub-counter
5. Append to `## Update log`

### Critical severity

If `--severity critical`:
- **Suspend compression** per auto-clarity rule
- Also append a DEC entry tagged `#security #governance` linking `[[BLK-ID]]`
- Alert user in full clarity format

### Output (ultra unless critical)

```
✓ BLK-<YYYYMMDD>-<NN> [<severity>] logged | owner=<agent> | tags=<list>
```
