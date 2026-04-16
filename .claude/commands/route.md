---
description: Suggest the right model tier for a task (and which agent owns it)
argument-hint: <task-description>
model: claude-haiku-4-5-20251001
---

Args: $ARGUMENTS

Read `.hivemind/project.json > routing` rules. Analyze task description.

Classify by signals:
- **lite** (haiku): read, summarize, log, status, format, append
- **standard** (sonnet): implement, debug, test, review, refactor single file, API design
- **heavy** (opus): architecture, security audit, cross-system refactor, incident RCA, multi-agent orchestration

Identify owning agent via `.hivemind/tools/code-boundaries.md` + keyword match.

Output (ultra):
```
task: <first 60 chars>...
tier: <lite|standard|heavy>  → <model id>
agent: <slug>  (owner)
reason: <one-line justification>
cmd: <suggested slash command or direct delegation>
```

Use this before spawning a subagent to avoid wasting heavy-tier budget on lite tasks.
