---
description: Append CHANGELOG entry with stable ID + tags + backlinks
argument-hint: <agent> <summary> [#tag]
model: claude-haiku-4-5-20251001
---

Args: $ARGUMENTS

Parse `<agent> <summary>` + extract `#tags` and `[[ID]]` references. Infer type (feat/fix/refactor/docs/chore) from summary. Require at least one tag.

### Generate ID

1. Read MANIFEST `## Link Index`
2. Find highest NN for `CHG-<today>-*`
3. Assign `CHG-<YYYYMMDD>-<NN+1>`

### Write entry

Append to `.hivemind/reports/CHANGELOG.md`:

```
## CHG-<YYYYMMDD>-<NN> — YYYY-MM-DD — [[@<agent>]] <tags>
### <type>: <short title>
- **What**: <what was done>
- **Why**: <motivation from context>
- **Impact**: <what changes for other agents>
- **Files**: <modified files>
- **References**: <[[ID]] list or none>
- **Model used**: <tier>
```

### Update MANIFEST

1. Append row to `## Link Index`:
   `| CHG-... | changelog | reports/CHANGELOG.md | L<line> | <date> | <agent> | <tags> | active |`
2. For each `[[ID]]` → `## Backlinks`
3. For each `#tag` → `## Tag Index`
4. Append to `## Update log`

### Update shared-context

Append to `.hivemind/memory/shared-context.md` `## Recent changes` section (cap at 5 entries, prune oldest):
- `[[CHG-<YYYYMMDD>-<NN>]] <agent> <type>: <title>`

### Output (ultra)

```
✓ CHG-<YYYYMMDD>-<NN> <type>/<title> | tags=<list>
```
