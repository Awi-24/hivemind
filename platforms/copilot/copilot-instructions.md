# HiveMind Protocol — GitHub Copilot Instructions

## Framework Boundary (CRITICAL)
This project uses HiveMind Protocol. `.hivemind/` is governance infrastructure only.
All project code belongs in `src/`, `apps/`, or the repo root — **never** inside `.hivemind/`.

## Session Start
Always read `.hivemind/memory/MANIFEST.md` first (~200 tokens). Stop there if it's fresh (< 24h old). Only load deeper files when MANIFEST flags indicate they're needed.

## Commands
All HiveMind commands use the `/hm-` prefix to avoid collisions:
`/hm-init` `/hm-status` `/hm-standup` `/hm-focus` `/hm-handoff` `/hm-decision` `/hm-report`
`/hm-blocker` `/hm-resolve` `/hm-memo` `/hm-link` `/hm-route` `/hm-audit` `/hm-hotfix`
`/hm-deploy` `/hm-review` `/hm-scaffold` `/hm-sprint` `/hm-checkpoint` `/hm-digest`
`/hm-compact` `/hm-compress` `/hm-reset-context`

## Memory Rules
- All memory files are **append-only** — never overwrite `decisions.log`, `handoff-queue.md`, `blockers.md`, or `shared-context.md`
- Update `.hivemind/memory/MANIFEST.md` after every write

## Compression: heavy (default)
Drop articles/filler. Fragments OK. Technical terms and code blocks always verbatim.

## Model Routing
- Fast/small model: reads, reports, logs, status
- Standard model: code, debug, tests, reviews
- Large model: architecture, security audits, RCA

## On `/hm-init`
Ask the user about **their** project. The framework is already installed — do not treat `.hivemind/` as the project to initialize.
