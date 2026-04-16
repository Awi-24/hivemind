# 4 — Agents

## The 12 Roles

| Slug | Role | Default tier | Layer |
|------|------|--------------|-------|
| `cto` | Chief Technology Officer | heavy | Governance |
| `lead-dev` | Lead Developer | standard | Governance |
| `product-manager` | Product Manager | lite | Product |
| `backend-dev` | Backend Developer | standard | Implementation |
| `frontend-dev` | Frontend Developer | standard | Implementation |
| `devops` | DevOps / SRE | standard | Infrastructure |
| `security` | Security Engineer | heavy | Governance / Review |
| `qa` | QA Engineer | standard | Review |
| `data` | Data Engineer | standard | Implementation |
| `docs` | Technical Writer | lite | Support |
| `mobile` | Mobile Developer | standard | Implementation |
| `ai-ml` | AI/ML Engineer | heavy | Implementation |

## Profile Format

Every agent profile (`.hivemind/agents/<N>-<slug>.md`) follows this schema:

```markdown
# <Role> — Agent Profile

## Identity
| Role / Slug / Tier / Default model tier / Reports to / Coordinates with |

## Purpose
<one paragraph — what this agent exists to do>

## Responsibilities
<bullet list — what they own>

## Capabilities
<what files they can read/write, what decisions they can make unilaterally>

## Boundaries
<what they MUST NOT do — escalation required>

## Model Routing
<task type → tier mapping>

## Memory Protocol
<what to read on session start, write during, update on end>

## Communication
<who they escalate to / receive from / send to>

## Behavioral Rules
<hard rules, numbered>

## Output Format
<template for structured output>
```

## Activation

Only active agents consume routing budget. Controlled via `.hivemind/project.json`:

```json
"agents": {
  "active":    ["cto", "lead-dev", "backend-dev", "frontend-dev", "devops", "security", "qa"],
  "available": ["cto", "lead-dev", "product-manager", "backend-dev", "frontend-dev",
                "devops", "security", "qa", "data", "docs", "mobile", "ai-ml"]
}
```

Change at any time; CTO is always implicitly active regardless of config.

## Escalation Chain

```
QA / Docs / Data / Mobile / AI-ML / Product-Manager
        ↓ (technical blocker)
Backend / Frontend / DevOps / Security
        ↓ (architecture decision)
Lead Dev
        ↓ (strategic / conflict)
CTO
        ↓ (out of scope)
→ User
```

Never skip a level without logging the reason in `decisions.log`.

## Agent Boundaries (Summary)

| Agent | MUST | MUST NOT |
|-------|------|----------|
| `cto` | Govern, decide, log every decision | Write implementation code |
| `lead-dev` | Coordinate across agents, review architecture | Approve prod deploys without security sign-off |
| `product-manager` | Own specs, backlog, acceptance criteria | Touch code |
| `backend-dev` | Own `src/api/**`, `src/services/**`, DB migrations | Touch frontend components or CI configs |
| `frontend-dev` | Own `src/components/**`, `src/pages/**`, client state | Touch API routes or DB |
| `devops` | Own `Dockerfile`, `.github/workflows/**`, infra IaC | Merge app code |
| `security` | Audit, threat-model, block risky merges | Deploy |
| `qa` | Own `tests/**`, `e2e/**`, release gates | Write production code |
| `data` | Own pipelines, schemas, ETL | Modify application code outside data layer |
| `docs` | Own `docs/**`, ADRs, API docs | Touch runtime code |
| `mobile` | Own `mobile/**`, platform-specific configs | Web/desktop |
| `ai-ml` | Own `ml/**`, prompts, embeddings, RAG | Production infrastructure |

Full ownership map: `.hivemind/tools/code-boundaries.md`.

## Working With an Agent

### Scope a session

```
/focus backend-dev
```

This loads:
1. `.hivemind/agents/04-backend-dev.md` (profile)
2. `.hivemind/memory/agent-states/backend-dev.state.md` (resume state)
3. MANIFEST entries tagged for this agent's domains

The agent now operates within its boundaries. Switching requires another `/focus`.

### Resolve a reference to an agent

```
/link @backend-dev
```

Returns: role, tier, current focus, pending handoffs to them, recent decisions authored.

### Hand work off

```
/handoff backend-dev devops "deploy /auth service to staging" #infra
```

Creates an `HDF-*` entry, links source and target agents, updates MANIFEST.

## Adding a Custom Agent

1. Copy `.hivemind/agents/_AGENT_TEMPLATE.md` → `.hivemind/agents/13-<role>.md`
2. Fill every section (don't leave placeholders)
3. Create `.hivemind/memory/agent-states/<role>.state.md` from `_STATE_TEMPLATE.md`
4. Add `<role>` to `.hivemind/project.json > agents.available` and `.active`
5. Add ownership rules in `.hivemind/tools/code-boundaries.md`
6. Verify with `/focus <role>` — the profile must load cleanly

### Naming rules

- Slug: lowercase kebab-case (`data-scientist`, not `dataScientist`)
- File prefix: next available 2-digit number (`13-data-scientist.md`)
- Do not reuse a retired slug; add a suffix (`qa-v2`)

## Removing an Agent

1. Remove from `project.json > agents.active` (keep in `available` for history)
2. Resolve or reassign any open handoffs to/from them
3. Archive their state file: prepend `_archived_` to the filename
4. Log a `DEC-*` entry explaining the removal

Never delete an agent's profile or state outright — MANIFEST references them by slug.

## Agent Templates

- `_AGENT_TEMPLATE.md` — blank profile schema
- Existing profiles are real templates — copy from the closest match

## Anti-Patterns

- Activating all 12 agents by default → adds routing overhead and decision noise. Activate only what you need.
- Letting one agent do cross-boundary work → defeats the purpose. Hand off instead.
- Editing a profile mid-sprint without logging a `DEC` → agents confused about current rules.
- Adding custom agents without ownership in `code-boundaries.md` → overlapping writes, conflicts.
