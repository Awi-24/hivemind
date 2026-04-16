---
description: Ultra-compressed digest of recent activity (no file writes)
argument-hint: [--since <days>]
model: claude-haiku-4-5-20251001
---

Args: $ARGUMENTS

Default: `--since 7` (last 7 days).

Read only:
- `.hivemind/memory/MANIFEST.md`
- Entries newer than threshold in `decisions.log`, `CHANGELOG.md`, `blockers.md`

Generate ultra-compressed summary (NO file writes — output only):

```
=== DIGEST — last <n>d ===
decisions:  <n>  (key: <top 3 one-liners>)
delivered:  <n>  (key: <top 3 one-liners>)
blockers:   open=<n> closed=<n>
handoffs:   done=<n> pending=<n>
agents:     most active=<slug>(<n>) | idle=<slugs>
trend:      <velocity up|flat|down vs prior window>
```

Use this for quick cold-start context restoration instead of re-reading logs.

Rules:
- No file writes (read-only command)
- Ultra compression always — abbreviations allowed: dec, blk, hdf, agt
- Max 12 lines output
