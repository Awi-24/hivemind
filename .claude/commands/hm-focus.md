---
description: Scope session to one agent — loads profile + state + domain
argument-hint: <agent>
model: claude-haiku-4-5-20251001
---

Args: $ARGUMENTS

Agent slug expected. Validate against `agents.available` in `.hivemind/project.json`.

Load in order:
1. `.hivemind/agents/<n>-<slug>.md` — role profile
2. `.hivemind/memory/agent-states/<slug>.state.md` — last state
3. `.hivemind/memory/MANIFEST.md` — filter to entries tagged `[<slug>]`

From now on:
- Adopt that agent's identity, scope, boundaries, and default model tier
- Apply compression level from `communication.per_agent_overrides.<slug>` if set, else default
- Read only memory files relevant to this agent's domain

Output:
```
=== FOCUS: <slug> ===
role: <role>
tier: <default model tier>
compression: <level>
last task: <from state file>
current focus: <from shared-context>
pending handoffs to me: <n>
```

Rules:
- Switching agent requires explicit new `/hm-focus` — don't drift
- If agent not in `active` list, warn user and ask to activate via `/hm-init` edit
