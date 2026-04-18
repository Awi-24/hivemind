# HiveMind Protocol — Agent Instructions

This project uses HiveMind Protocol for multi-agent governance. Read this file before taking any action.

## Framework Boundary (CRITICAL)

`.hivemind/` is **governance infrastructure only**. It contains agent profiles, memory files, reports, and tools.

- **Never** write project code inside `.hivemind/`
- All project code goes in `src/`, `apps/`, or the repo root
- `.hivemind/` files are configuration — they are not deliverables

## Session Initialization

Before doing anything else:

1. Read `.hivemind/memory/MANIFEST.md` (Tier 0, ~200 tokens)
2. If MANIFEST was updated in the last 24 hours, it is self-sufficient — use it as the sole context source
3. Only read deeper files when MANIFEST explicitly flags a need for them

## Commands

All HiveMind commands use the `/hm-` prefix:

| Command | Purpose |
|---------|---------|
| `/hm-init` | Initialize project — ask user about THEIR project |
| `/hm-status` | Summary of all agents, blockers, handoffs |
| `/hm-focus <agent>` | Scope session to one agent role |
| `/hm-handoff <from> <to> <task>` | Formal task handoff |
| `/hm-decision <agent> <text>` | Append to decisions.log |
| `/hm-report <agent> <summary>` | Append CHANGELOG entry |
| `/hm-blocker <desc>` | Register blocker |
| `/hm-resolve <title>` | Close blocker |
| `/hm-audit` | Security audit |
| `/hm-hotfix <desc>` | Emergency fix fast-track |
| `/hm-scaffold <template>` | Bootstrap project structure |
| `/hm-review <file>` | Structured code review |

## Memory Rules

All memory files are **append-only**:
- `decisions.log` — never edit past entries
- `handoff-queue.md` — mark done with `[DONE]`, never delete
- `blockers.md` — mark resolved with `[RESOLVED: date by agent]`
- `shared-context.md` — append only

After every write, update `.hivemind/memory/MANIFEST.md`.

## Agent Roles

cto · lead-dev · product-manager · backend-dev · frontend-dev · devops · security · qa · data · docs · mobile · ai-ml

Escalation: QA/Docs/Data/Mobile → Backend/Frontend/DevOps/Security → Lead Dev → CTO → User

## Compression: heavy (default)

Drop articles and filler words. Fragments are acceptable. All technical terms, file paths, code blocks, and version numbers must be preserved exactly.
