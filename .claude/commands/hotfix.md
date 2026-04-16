---
description: Emergency fix — fast-track QA → Security → DevOps with HFX-ID
argument-hint: <description> [--severity critical|high] [#tag]
model: claude-sonnet-4-6
---

Args: $ARGUMENTS

Severity defaults to `high`. Require at least one tag.

**Compression SUSPENDED for this entire flow** per auto-clarity rule.

### Generate IDs

1. Read MANIFEST `## Link Index`
2. Assign `HFX-<YYYYMMDD>-<NN>` (hotfix — subclass of blocker)
3. Also generate 3 chained handoff IDs: `HDF-<YYYYMMDD>-<NN+1>`, `NN+2`, `NN+3`

### Write blocker entry

Append to `.hivemind/memory/blockers.md` `## Active`:
```
### HFX-<YYYYMMDD>-<NN> [HOTFIX][<severity>] <tags> <description>
- **Date**: <date>
- **Owner**: [[@<current-agent>]]
- **Status**: active
- **Chain**: [[HDF-...]] → [[HDF-...]] → [[HDF-...]]
```

### Write decision

Append to `decisions.log`:
```
[<ts>] DEC-... [[@<agent>]] <tags>
DECISION: hotfix initiated [[HFX-<ID>]]
REASON: <desc>
REFERENCES: [[HFX-<ID>]]
```

### Write handoff chain

Append to `handoff-queue.md`:
```
HDF-<NN+1> [[@<agent>]] → [[@qa]]       | verify fix for [[HFX-...]]    | STATUS: pending
HDF-<NN+2> [[@qa]] → [[@security]]      | security sign-off [[HFX-...]]  | STATUS: pending
HDF-<NN+3> [[@security]] → [[@devops]]  | deploy hotfix [[HFX-...]]      | STATUS: pending
```

### Update MANIFEST

1. Append 5 rows to `## Link Index` (1 HFX + 1 DEC + 3 HDF)
2. Backlinks: all 4 new entries reference `[[HFX-<ID>]]`
3. Bump `active_blockers` + severity sub-counter + `open_hotfixes`
4. Append each to `## Tag Index`
5. Append to `## Update log`

### Output (compression SUSPENDED)

```
═══════════════════════════════════════════
  HOTFIX ACTIVE — <severity> — [[HFX-<ID>]]
═══════════════════════════════════════════
Chain:  [[HDF-<NN+1>]] → qa
        [[HDF-<NN+2>]] → security
        [[HDF-<NN+3>]] → devops
Checklist:
  [ ] implement fix
  [ ] local verify
  [ ] QA smoke test       → signs off [[HDF-<NN+1>]]
  [ ] security sign-off   → signs off [[HDF-<NN+2>]]
  [ ] deploy to prod      → signs off [[HDF-<NN+3>]]
  [ ] post-mortem logged
═══════════════════════════════════════════
```

Close flow with `/resolve HFX-<ID>` when done.
