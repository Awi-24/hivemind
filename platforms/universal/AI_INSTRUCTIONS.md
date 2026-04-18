# HiveMind Protocol — AI Instructions

This project uses HiveMind Protocol. These instructions apply to any AI assistant working in this codebase.

## Framework Boundary (CRITICAL)

`.hivemind/` is **governance infrastructure only**:
- Contains: agent profiles, memory files, reports, tools, `project.json`
- **Never** write project code inside `.hivemind/`
- All product code belongs in `src/`, `apps/`, or the repo root

## Session Start Protocol

Every session, before any work:
1. Read `.hivemind/memory/MANIFEST.md` (Tier 0, ~200 tokens)
2. If MANIFEST is fresh (updated < 24h ago), it is self-sufficient — stop reading and start working
3. Load deeper files only when MANIFEST flags indicate a need

## Commands (23 total, all prefixed `/hm-`)

**Project lifecycle:** `/hm-init` · `/hm-scaffold` · `/hm-sprint` · `/hm-deploy`

**Daily work:** `/hm-status` · `/hm-standup` · `/hm-focus` · `/hm-handoff` · `/hm-decision` · `/hm-report` · `/hm-memo` · `/hm-link` · `/hm-review`

**Incidents:** `/hm-blocker` · `/hm-resolve` · `/hm-hotfix` · `/hm-audit` · `/hm-checkpoint`

**Token hygiene:** `/hm-compact` · `/hm-compress` · `/hm-digest` · `/hm-reset-context` · `/hm-route`

## Memory Rules

- All memory files are **append-only** — never delete or overwrite entries
- Update `.hivemind/memory/MANIFEST.md` after every write
- Memory files use ultra compression: drop articles/filler, preserve paths, code, versions exactly

## Agent Roles

12 roles: `cto` · `lead-dev` · `product-manager` · `backend-dev` · `frontend-dev` · `devops` · `security` · `qa` · `data` · `docs` · `mobile` · `ai-ml`

Escalation path: QA/Docs/Data/Mobile/AI-ML → Backend/Frontend/DevOps/Security → Lead Dev → CTO → User

## Model Routing

| Task type | Model tier |
|-----------|-----------|
| Reads, reports, logs, status | Smallest/fastest available |
| Code, debug, tests, reviews | Standard |
| Architecture, security audits, RCA | Largest/most capable |

## Compression Default: heavy

Drop articles (`a`, `an`, `the`) and filler (`just`, `really`, `basically`). Fragments OK. Preserve: code blocks, file paths, URLs, version numbers, model IDs, technical terms.

## On `/hm-init`

When a user runs `/hm-init`, ask them about **their** project. The `.hivemind/` framework is already set up. Do not scaffold into `.hivemind/`.
