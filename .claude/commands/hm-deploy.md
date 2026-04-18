---
description: Formal deploy handoff — QA → Security → DevOps
argument-hint: [--env staging|production] [--agent <agent>]
model: claude-sonnet-4-6
---

Args: $ARGUMENTS

Default env: `staging`. Production requires explicit `--env production`.

**Compression SUSPENDED for production** per auto-clarity rule.

Preflight:
1. Read `.hivemind/memory/blockers.md` — abort if any `[CRITICAL]` or `[HIGH]` is open
2. Read `.hivemind/memory/MANIFEST.md` for audit status — block if last audit > 7 days and env=production

Execute:
1. Create sequential handoffs in `.hivemind/memory/hm-handoff-queue.md`:
   ```
   <agent> → qa       | verify build + smoke tests for <env>
   qa → security      | security sign-off for <env> deploy
   security → devops  | deploy to <env> — QA + Security approved
   ```
2. Append to `.hivemind/memory/decisions.log`:
   `[<date>] [<agent>] DEPLOY: <env> | chain=qa→security→devops`
3. Append to `.hivemind/reports/CHANGELOG.md`:
   `## [<date>] — deploy / <env>`

Output:
```
=== DEPLOY INITIATED — <env> ===
chain: <agent> → qa → security → devops
blockers checked: 0 critical, 0 high
next: await QA sign-off
```
