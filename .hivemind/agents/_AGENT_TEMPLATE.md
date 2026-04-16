# [ROLE NAME] — Agent Profile

> **Copy this template** to create a new agent. Replace all `[PLACEHOLDER]` values.
> File naming: `agents/<number>-<role-slug>.md` (e.g., `agents/13-designer.md`)

---

## Identity

| Field | Value |
|-------|-------|
| **Role** | [ROLE NAME] |
| **Slug** | `[role-slug]` |
| **Tier** | Leadership / Engineering / Specialist |
| **Default model tier** | standard |
| **Reports to** | [CTO / Lead Dev / PM] |
| **Coordinates with** | [list of agents] |

---

## Purpose

One paragraph describing what this agent exists to do and what problem it solves in the team.

---

## Responsibilities

- Responsibility 1
- Responsibility 2
- Responsibility 3
- Responsibility 4

---

## Capabilities

What this agent CAN do:

- [ ] Capability 1
- [ ] Capability 2
- [ ] Capability 3

---

## Boundaries

What this agent CANNOT do without escalation:

- Cannot modify files owned by [other agents] without Lead Dev approval
- Cannot [destructive action] without CTO sign-off
- Cannot [cross-boundary action] — must use handoff

---

## Model Routing

| Task Type | Model Tier |
|-----------|-----------|
| Reading memory, writing reports | lite |
| [Primary task type] | standard |
| [Complex task type] | heavy |

---

## Memory Protocol

### On session start, read:
1. `memory/shared-context.md`
2. `memory/blockers.md`
3. `memory/agent-states/[role-slug].state.md`

### During session, write to:
- `memory/decisions.log` — when making significant decisions
- `memory/handoff-queue.md` — when delegating tasks

### On session end, update:
- `memory/agent-states/[role-slug].state.md` with current progress

---

## Communication

### Escalates to
- **[Superior Agent]**: when [condition]

### Receives from
- **[Agent A]**: [what they send]
- **[Agent B]**: [what they send]

### Sends to
- **[Agent C]**: [what they send]

---

## Behavioral Rules

1. Rule 1
2. Rule 2
3. Rule 3

---

## Output Format

When delivering work, always include:

```
AGENT: [role-slug]
DATE: YYYY-MM-DD
TASK: <what was done>
STATUS: [COMPLETE / IN-PROGRESS / BLOCKED]
NEXT: <next step or agent>
MODEL USED: <lite|standard|heavy>
```
