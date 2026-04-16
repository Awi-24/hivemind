# Custom Commands — Reference

> **Implementation**: every command lives at `.claude/commands/<name>.md` (surfaced in Claude Code `/` dropdown).
> **Registry**: `.hivemind/project.json > commands`.
> **Philosophy**: commands are short, composable, tier-aware. Each one updates memory + MANIFEST consistently.

---

## Command index

| Command | Tier | Purpose | Touches |
|---------|------|---------|---------|
| `/init` | heavy | CTO onboarding form (run once) | `project.json`, `MANIFEST`, `shared-context`, `decisions.log`, `agent-states/*` |
| `/status` | lite | Cross-agent summary | reads MANIFEST only |
| `/standup` | lite | Daily standup | reads agent-states; writes MANIFEST |
| `/focus <agent>` | lite | Scope session to one agent | reads agent profile + state |
| `/handoff <from> <to> <task>` | lite | Formal handoff | `handoff-queue`, `decisions.log`, `MANIFEST` |
| `/report <agent> <summary>` | lite | Append CHANGELOG entry | `CHANGELOG.md`, `MANIFEST` |
| `/decision <agent> <text>` | lite | Append decisions.log | `decisions.log`, `MANIFEST` |
| `/memo <text>` | lite | Quick one-liner | `shared-context.md` |
| `/review <file>` | standard | Structured code review | reads target; may write `audit-log.md` |
| `/blocker <desc>` | lite | Register blocker | `blockers.md`, `MANIFEST` |
| `/resolve <title>` | lite | Close blocker | `blockers.md`, `decisions.log`, `MANIFEST` |
| `/hotfix <desc>` | standard | Fast-track emergency | `blockers.md`, `handoff-queue`, `decisions.log` |
| `/audit --scope <s>` | heavy | Security audit | `audit-log.md`, may trigger `/blocker` |
| `/checkpoint --label <n>` | lite | Snapshot state | `agent-states/*`, `decisions.log`, `MANIFEST` |
| `/scaffold <template>` | standard | Bootstrap project | repo root (NOT `.hivemind/`), `decisions.log` |
| `/sprint` | lite | Sprint report | `sprint-report.md`, `MANIFEST` |
| `/deploy --env <env>` | standard | QA→Security→DevOps chain | `handoff-queue`, `decisions.log`, `CHANGELOG` |
| `/compact` | lite | Compress old memory | target log file, `MANIFEST` |
| `/compress <level>` | lite | Switch compression | session-only (no writes) |
| `/digest --since <d>` | lite | Activity summary | read-only |
| `/reset-context` | lite | Drop non-essential context | session-only |
| `/route <task>` | lite | Suggest tier + agent | read-only |

---

## Command file format

Every file in `.claude/commands/` follows this shape:

```markdown
---
description: One-line description (appears in Claude Code dropdown)
argument-hint: <arg1> [--flag <value>]
model: <full model ID — lite|standard|heavy mapped via project.json>
---

Instructions for the agent executing this command.
Reference args with $ARGUMENTS.
Reference paths with .hivemind/ prefix (never bare paths).
State the memory + MANIFEST writes explicitly.
Output format must match CLAUDE.md compression level.
```

---

## Adding a new command

1. Create `.claude/commands/<name>.md` with frontmatter
2. Add entry to `.hivemind/project.json > commands`:
   ```json
   "<name>": {
     "syntax": "/<name> <args>",
     "tier": "lite|standard|heavy",
     "description": "one line"
   }
   ```
3. Add row to the table above
4. Log the addition in `decisions.log` under governance domain

---

## Conventions

- **Output compression**: each command states the level in its body (usually `ultra` for logs, `heavy` for agent-facing, `normal` only for `/init`)
- **MANIFEST update**: every command that writes memory MUST update MANIFEST counters and last-entry rows
- **Dry-run safety**: read-only commands (`/status`, `/digest`, `/route`, `/reset-context`) MUST NOT touch disk
- **Confirmation gates**: any command touching destructive ops (`/hotfix`, `/deploy --env production`) suspends compression and asks before acting
- **Framework protection**: no command may write inside `.hivemind/` except: `/init`, `/decision`, `/report`, `/blocker`, `/resolve`, `/handoff`, `/memo`, `/checkpoint`, `/compact`, `/sprint`, `/audit`

---

## Deprecated

Older versions of this file documented commands inline. They now live in `.claude/commands/*.md`. Do not duplicate the prompts here — edit the command files directly.
