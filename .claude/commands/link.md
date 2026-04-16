---
description: Resolve any ID / #tag / @agent — returns target + backlinks
argument-hint: <ID or #tag or @agent>
model: claude-haiku-4-5-20251001
---

Args: $ARGUMENTS

Read-only command. No file writes. Pure navigation helper.

### Resolution

Parse `$ARGUMENTS` into one of three forms:

#### Form 1 — Entry ID (`DEC-...`, `BLK-...`, `HDF-...`, `CHG-...`, `HFX-...`, `CHK-...`, `AUD-...`, `MEM-...`, `SPR-...`)

1. Read `.hivemind/memory/MANIFEST.md` → `## Link Index` → find row
2. Jump to `<File>:<Anchor>` and read the entry
3. Read `## Backlinks` for this ID
4. Output:
   ```
   === [[<ID>]] ===
   kind:    <kind>
   file:    <file>:<anchor>
   status:  <status>
   agent:   <slug>
   tags:    <list>
   date:    <date>

   --- entry ---
   <entry body, ultra compression>

   --- referenced by (<n>) ---
   - [[<ID1>]] <one-line>
   - [[<ID2>]] <one-line>

   --- references (<n>) ---
   - [[<ID3>]] <one-line>
   ```

#### Form 2 — Tag (`#<tag>`)

1. Read MANIFEST `## Tag Index` → `<tag>` row
2. Output IDs grouped by kind:
   ```
   === #<tag> ===
   decisions:   [[DEC-...]], [[DEC-...]]
   blockers:    [[BLK-...]]
   handoffs:    [[HDF-...]]
   changelog:   [[CHG-...]]
   total: <n> entries
   ```

#### Form 3 — Agent (`@<slug>`)

1. Resolve `.hivemind/agents/<N>-<slug>.md`
2. Read `.hivemind/memory/agent-states/<slug>.state.md`
3. Output:
   ```
   === [[@<slug>]] ===
   role:        <role>
   tier:        <default model tier>
   status:      <from state file>
   current focus: <from state>
   entries authored: <n>  (grep MANIFEST for agent column)
   pending handoffs to: <n>
   ```

### Compression

Output uses current session compression (default heavy). Entry body inside the dump is preserved verbatim.

### Not found

If the ID/tag/agent cannot be resolved via MANIFEST:
1. Warn: MANIFEST may be stale
2. Grep the memory files for the literal ID string as fallback
3. If still not found → report explicitly: `not found: <ref>. MANIFEST may need rebuild — run /compact or check update log.`
