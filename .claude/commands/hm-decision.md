---
description: Append entry to decisions.log with stable ID + tags + backlinks
argument-hint: <agent> <decision-text> [#tag1 #tag2]
model: claude-haiku-4-5-20251001
---

Args: $ARGUMENTS

Parse `<agent> <decision>` + extract inline `#tags` and `[[ID]]` references from the decision text. If no tag is given, ASK the user for at least one (required per linking protocol — see `.hivemind/tools/linking.md`).

### Generate ID

1. Read `.hivemind/memory/MANIFEST.md` → `## Link Index`
2. Find highest NN for `DEC-<today>-*`
3. Assign `DEC-<YYYYMMDD>-<NN+1>` (zero-padded)

### Write entry

Append to `.hivemind/memory/decisions.log` (ultra compression; preserve paths/versions/IDs exactly):

```
[YYYY-MM-DD HH:MM] DEC-<YYYYMMDD>-<NN> [[@<agent>]] <tags>
DECISION: <decision>
REASON: <reason from context or arg>
REFERENCES: <[[ID]] list or none>
```

### Update MANIFEST

1. Append row to `## Link Index`:
   `| DEC-... | decision | decisions.log | L<line> | <date> | <agent> | <tags> | active |`
2. For each `[[ID]]` in the decision body → append/update row in `## Backlinks`
3. For each `#tag` → append DEC-ID to `## Tag Index` row for that tag
4. Update `## Last decision per domain` row for the primary tag's domain
5. Bump `decisions_total` counter
6. Append to `## Update log`: `[<ts>] [<agent>] wrote: decisions.log — DEC-...`

### Supersede handling

If decision text contains `SUPERSEDES: [[<OLD-ID>]]`:
- Mark old entry `Status: superseded` in Link Index
- Old entry gains the new ID in its backlinks

### Output (ultra)

```
✓ DEC-<YYYYMMDD>-<NN> logged | tags=<list> | refs=<n>
manifest: link+backlink+tag index updated
```
