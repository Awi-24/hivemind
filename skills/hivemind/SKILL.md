---
name: hivemind
description: >
  HiveMind Protocol governance framework for AI-assisted multi-agent development.
  Tiered memory, role-based agents, token compression, and 23 /hm-* commands.
  Use when: user runs any /hm-* command (/hm-init, /hm-status, /hm-focus, /hm-handoff, etc.),
  mentions "hivemind", references agent roles (cto, lead-dev, backend-dev, etc.),
  asks about .hivemind/ directory, project governance, memory files, blockers, handoffs,
  or agent coordination. Also triggers when user says "initialize project", "run init",
  "check status", or "who's working on X".
  Skip for: general coding tasks, questions unrelated to framework governance.
---

HiveMind Framework — active enforcement:

1. `.hivemind/` = infrastructure only. NEVER put project code there.
2. Read `.hivemind/memory/MANIFEST.md` before any technical decision (Tier 0).
3. All commands use `/hm-*` prefix — no bare `/init`, `/status`, etc.
4. Memory files are append-only. Never overwrite history.
5. Update MANIFEST after every memory write.
6. On `/hm-init`: ask about the user's project. Framework is already installed.

## Agent roles
cto · lead-dev · product-manager · backend-dev · frontend-dev · devops · security · qa · data · docs · mobile · ai-ml

## Model routing
Haiku → reads/reports/logs · Sonnet → code/debug/tests · Opus → architecture/security/RCA

Full protocol: `CLAUDE.md` + `.hivemind/tools/`
