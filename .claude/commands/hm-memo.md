---
description: Quick one-liner memo with MEM-ID
argument-hint: <text> [#tag]
model: claude-haiku-4-5-20251001
---

Args: $ARGUMENTS

Low-ceremony append. Unlike `/hm-decision`, this does NOT trigger domain routing. Use for casual notes ("remember to…", "idea: …").

### Generate ID

`MEM-<YYYYMMDD>-<NN>` (read MANIFEST for counter).

### Tag requirement

Require at least one `#tag` (inherits linking protocol rule). If none given, ask user.

### Write

Append to `.hivemind/memory/shared-context.md` under `## Memos`:
```
- MEM-<YYYYMMDD>-<NN> [<date>] [[@<agent>]] <tags> <text>
```

If memo contains actionable verbs (fix, add, refactor, check, test) → also add to active agent's `agent-states/<slug>.state.md` `## Backlog`:
- `[[MEM-<YYYYMMDD>-<NN>]] <text>`

### Update MANIFEST

- Append to `## Link Index` (Kind: memo, File: shared-context.md)
- Append to `## Tag Index`
- Append to `## Update log`

### Rules

- Max 20 memos kept in shared-context; oldest pruned (IDs remain in MANIFEST with Status=archived)
- Ultra compression on memo text

### Output (ultra)

```
✓ [[MEM-<YYYYMMDD>-<NN>]] saved | tags=<list>
```
