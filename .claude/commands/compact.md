---
description: Compress old memory entries into a digest block
argument-hint: [--older-than <days>] [--file decisions|blockers|all]
model: claude-haiku-4-5-20251001
---

Args: $ARGUMENTS

Defaults: `--older-than 30`, `--file decisions`.

Compaction threshold can be overridden via `meta.compaction_threshold_days` in `.hivemind/project.json`.

For each target file:
1. Read entries older than threshold
2. Group by domain (auth, db, infra, api, frontend, etc.)
3. Replace those entries with a single `[DIGEST]` block at the TOP of the file:
   ```
   [DIGEST: <oldest-date> → <newest-date> | compacted by <agent> on <date>]
   auth:     <compressed summary>
   db:       <compressed summary>
   infra:    <compressed summary>
   api:      <compressed summary>
   [END DIGEST]
   ```
4. Keep all entries newer than threshold untouched
5. Update `.hivemind/memory/MANIFEST.md` compaction-status table:
   - entries_count: <after>
   - digest_range: <oldest → newest compacted>
   - last_compact: <date>
6. Append to decisions.log:
   `[<date>] [<agent>] COMPACT: <file> | entries_compacted=<n>`

Compression for the digest: **ultra** — preserve paths/versions/model IDs exactly; drop everything else.

Output (ultra): `compact <file>: <n> entries → 1 digest | saved ~<n> tokens`
