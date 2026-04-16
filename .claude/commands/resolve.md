---
description: Close active blocker + update backlinks
argument-hint: <BLK-ID or title> [--resolution <text>]
model: claude-haiku-4-5-20251001
---

Args: $ARGUMENTS

Accept either full `BLK-YYYYMMDD-NN` ID (preferred) or fuzzy title match. If title, resolve via MANIFEST `## Link Index` status=active blockers.

### Impact check (MANDATORY)

Read MANIFEST `## Backlinks` for the target ID. If the blocker has active dependents (entries referencing it whose Status is `active` or `pending`):

**Suspend compression** and warn user:
```
[COMPRESSION SUSPENDED — IMPACT CHECK]
BLK-<ID> has <n> active dependent(s):
  - [[HDF-...]] pending — <task>
  - [[DEC-...]] active — <decision>
Resolving may break these. Proceed anyway? (yes/no)
[COMPRESSION RESUMED]
```

Only proceed on explicit `yes`.

### Write resolution

1. In `.hivemind/memory/blockers.md`:
   - Mark target entry `Status: resolved` + append `- **Resolved**: YYYY-MM-DD by [[@<agent>]] | <resolution>`
   - Move entry from `## Active` to `## Resolved` section (keep ID)
2. Append DEC entry to `decisions.log` (auto-generate `DEC-<YYYYMMDD>-<NN>`):
   ```
   [<ts>] DEC-... [[@<agent>]] #<domain>
   DECISION: resolved [[BLK-<ID>]]
   REASON: <resolution>
   REFERENCES: [[BLK-<ID>]]
   ```

### Update MANIFEST

1. Change target's `Status: active` → `resolved` in `## Link Index`
2. Append the new DEC-ID to `## Link Index` + `## Backlinks`
3. Decrement `active_blockers` counter + severity sub-counter
4. If resolved blocker was `[HOTFIX]` → decrement `open_hotfixes`
5. Append to `## Update log`

### Output (ultra)

```
✓ [[BLK-<ID>]] resolved by [[@<agent>]] → [[DEC-<NEW-ID>]]
dependents warned: <n>
```
