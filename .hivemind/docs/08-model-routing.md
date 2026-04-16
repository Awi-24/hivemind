# 8 — Model Routing

## Goal

Send each task to the cheapest model that can handle it correctly. Over a long-running project, this compounds into significant cost savings without loss of quality.

## Three Tiers

| Tier | Model (default) | Use for |
|------|----------------|---------|
| **lite** | `claude-haiku-4-5-20251001` | Reads, logs, status, formatting, summaries |
| **standard** | `claude-sonnet-4-6` | Code, debug, tests, reviews, implementation |
| **heavy** | `claude-opus-4-6` | Architecture, audits, cross-system refactors, incident RCA |

Configured in `.hivemind/project.json > routing`. Swap models per tier by editing the `model` field — the tier names stay the same.

## Classification Rules

### Default to `standard`

When in doubt, use `standard`. It handles almost any coding task.

### Downgrade to `lite` when

- Reading and summarizing existing memory
- Appending to logs
- Formatting or transforming structured data
- Status checks
- Generating reports from existing data
- Running `/status`, `/standup`, `/digest`, `/memo`, `/report`, `/decision`, `/resolve`, `/blocker`, `/checkpoint`, `/focus`, `/link`, `/compact`, `/compress`, `/reset-context`, `/route`, `/sprint`

### Upgrade to `heavy` when

- Task spans 3+ systems (e.g., change requires backend + frontend + infra + DB)
- Task has direct security implications
- Task requires architectural decisions
- Task is an audit or RCA
- Task is cross-team design
- Running `/audit`, `/init` (CTO onboarding)

## Escalation Rule

If a `standard` task fails 3 times → escalate to `heavy` AND log the escalation in `decisions.log`.

If a `heavy` task fails 3 times → log to `blockers.md` and escalate to the user (this is an architecture limit, not a model limit).

## Use `/route` When Unsure

```
/route "refactor auth middleware to support multi-tenant"
```

Returns:

```
task:   refactor auth middleware to support multi-tenant
tier:   heavy  → claude-opus-4-6
agent:  backend-dev (owner), security (co-sign)
reason: spans auth + db + api, security implications, architectural change
cmd:    /handoff backend-dev security "review multi-tenant auth approach"
```

## Routing in Subagent Calls

When spawning a subagent programmatically, mark the tier inline:

```
[MODEL: lite]     → read memory/shared-context.md and summarize
[MODEL: standard] → implement the /users endpoint with auth middleware
[MODEL: heavy]    → redesign auth architecture for multi-tenancy
```

## Model ID Overrides

Change the actual model for each tier in `.hivemind/project.json`:

```json
"routing": {
  "lite": {
    "model": "claude-haiku-4-5-20251001",
    "use_for": ["reading files", "writing reports", "..."],
    "max_tokens": 4096
  },
  "standard": {
    "model": "claude-sonnet-4-6",
    "use_for": ["writing code", "debugging", "..."],
    "max_tokens": 8192
  },
  "heavy": {
    "model": "claude-opus-4-6",
    "use_for": ["architecture decisions", "security audits", "..."],
    "max_tokens": 16384
  },
  "default_tier": "standard",
  "escalation_rule": "If a standard task fails 3 times, escalate to heavy and log in decisions.log"
}
```

### For non-Claude providers

```json
"lite":     { "model": "gpt-4o-mini" },
"standard": { "model": "gpt-4o" },
"heavy":    { "model": "o1" }
```

or

```json
"lite":     { "model": "gemini-2.0-flash" },
"standard": { "model": "gemini-2.0-pro" },
"heavy":    { "model": "gemini-2.0-ultra" }
```

Enforcement shifts to your orchestrator — Claude Code does it natively; other runtimes need your code to honor the `[MODEL: ...]` hints.

## Cost vs Quality Tradeoffs

| Situation | Prefer |
|-----------|--------|
| Exploratory question, vague scope | heavy briefly, then standard |
| Small well-scoped bug fix | standard |
| Mass-reading 20 files to build a summary | lite |
| PR review, multiple files | standard |
| PR review with security-critical changes | heavy |
| Writing docs from existing code | lite |
| Writing new architecture ADR | heavy |
| Running unit tests, parsing output | lite |
| Debugging flaky integration test | standard |

## Per-Agent Tier Defaults

Every agent profile declares a **default tier** for that role:

| Agent | Default tier |
|-------|--------------|
| `cto` | heavy |
| `lead-dev` | standard |
| `product-manager` | lite |
| `backend-dev` | standard |
| `frontend-dev` | standard |
| `devops` | standard |
| `security` | heavy |
| `qa` | standard |
| `data` | standard |
| `docs` | lite |
| `mobile` | standard |
| `ai-ml` | heavy |

This is the tier the agent defaults to **unless the specific task classifies differently**. A standard-tier agent reading a file still uses lite for that task.

## Anti-patterns

- Running `/init` on lite → lacks depth for architectural onboarding
- Running `/status` on heavy → wastes budget on a read-only summary
- Escalating to heavy before exhausting standard retries → ignores the rule
- Overriding `default_tier` to `heavy` globally → burns budget
