---
description: Change compression level for the rest of the session
argument-hint: normal|lite|heavy|ultra
model: claude-haiku-4-5-20251001
---

Args: $ARGUMENTS

Validate against the 4 levels defined in `.hivemind/tools/token-compression.md`:
- `normal` — 0% reduction, full clarity
- `lite`   — ~40% reduction
- `heavy`  — ~60% reduction (default agent-to-agent)
- `ultra`  — ~75% reduction (logs/memory/internal)

Does NOT write to `project.json` (that is the default, not session override).

Set session-scoped compression to the requested level. From this point forward, apply the rules in `.hivemind/tools/token-compression.md` matching the chosen level.

Auto-clarity exceptions still apply (see CLAUDE.md § 3) — compression always suspends for CRITICAL security, irreversible ops, and order-sensitive sequences.

Output (matching new level):
- `normal`: `Compression level set to normal. Full clarity active for the rest of the session.`
- `lite`: `Compression: lite. Human-facing clarity.`
- `heavy`: `compression: heavy. fragments allowed.`
- `ultra`: `compr: ultra. abbr+arrows.`
