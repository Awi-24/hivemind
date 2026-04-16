# 12 — Customization

HiveMind is template-first: you own the copy in your repo. Every part is customizable.

## 1 — Adding an Agent

Step by step:

```
# 1. Copy the template
cp .hivemind/agents/_AGENT_TEMPLATE.md \
   .hivemind/agents/13-data-scientist.md
```

Edit `13-data-scientist.md`:
- Fill every section (Identity, Purpose, Responsibilities, Capabilities, Boundaries, Model Routing, Memory Protocol, Communication, Behavioral Rules, Output Format)
- Slug: lowercase kebab-case
- File prefix: next available 2-digit number

```
# 2. Create state file
cp .hivemind/memory/agent-states/_STATE_TEMPLATE.md \
   .hivemind/memory/agent-states/data-scientist.state.md
```

```
# 3. Register in project.json
```

Edit `.hivemind/project.json`:

```json
"agents": {
  "active":    [..., "data-scientist"],
  "available": [..., "data-scientist"]
}
```

```
# 4. Add code ownership
```

Edit `.hivemind/tools/code-boundaries.md`:

```
## data-scientist
owns:
  - ml/experiments/**
  - ml/features/**
  - notebooks/**
shares:
  - tests/ml/** with qa
```

```
# 5. Log the change
/decision cto "added data-scientist agent for ML experiment ownership" #governance
```

```
# 6. Verify
/focus data-scientist
```

Should load the profile and state cleanly.

## 2 — Adding a Slash Command

```
# 1. Create the command file
```

Write `.claude/commands/my-command.md`:

```markdown
---
description: One-line description (appears in dropdown)
argument-hint: <arg1> [--flag <value>]
model: claude-haiku-4-5-20251001
---

# Instructions for the agent

When the user runs `/my-command <args>`, do the following:

1. Parse `$ARGUMENTS` as `<arg1>` (and any flags)
2. Validate arguments
3. Perform the action
4. Update memory (if applicable) with stable IDs
5. Update MANIFEST (if memory was touched)
6. Output confirmation in <current compression level>
```

```
# 2. Register in project.json
```

Edit `.hivemind/project.json > commands`:

```json
"my-command": {
  "syntax":      "/my-command <arg1> [--flag <value>]",
  "tier":        "lite",
  "description": "One-line description"
}
```

```
# 3. Reference in docs
```

Add a row to `.hivemind/tools/custom-commands.md` and `.hivemind/docs/09-commands.md`.

```
# 4. Log the addition
/decision docs "added /my-command — <purpose>" #governance
```

The command appears in the Claude Code `/` dropdown immediately.

## 3 — Adding a Domain Tag

Tags self-register on first use — no config change needed. Best practice:

```
# 1. Use the tag in an entry
/decision ai-ml "chose pgvector over pinecone for embeddings" #rag #ai-ml

# 2. Register in MANIFEST Tag Registry
```

Edit `.hivemind/memory/MANIFEST.md > ## Custom tag registry`:

```
| #rag | RAG pipelines, vector DBs, retrieval strategies |
```

## 4 — Adding a Scaffold Template

```
# 1. Create the template file
```

Write `.hivemind/tools/scaffold-templates/django.md`:

````markdown
# Django + DRF Scaffold

## Structure
```
<out>/
├── manage.py
├── pyproject.toml
├── <project>/
│   ├── settings/
│   ├── urls.py
│   └── wsgi.py
└── apps/
    └── core/
        ├── models.py
        └── views.py
```

## Dependencies
- django>=5.0
- djangorestframework>=3.14
- psycopg[binary]>=3.1

## Files

### manage.py
```python
<file contents>
```

### <project>/settings/base.py
```python
<file contents>
```

## Post-install
1. `python manage.py migrate`
2. `python manage.py createsuperuser`
3. `python manage.py runserver`
````

```
# 2. Register in project.json
```

Edit `.hivemind/project.json > commands.scaffold.templates`:

```json
"templates": ["nextjs", "fastapi", "node-api", "react-native", "monorepo", "django"]
```

```
# 3. Use it
/scaffold django --name api --out apps/api
```

## 5 — Changing Compression Defaults

Edit `.hivemind/project.json > communication`:

```json
"default_intensity": "lite",          // for user-facing projects
"default_intensity": "heavy",         // default (agent-to-agent)
"default_intensity": "ultra",         // when token budget is critical
```

Per-agent overrides:

```json
"per_agent_overrides": {
  "cto":              "lite",         // human-facing governance
  "product-manager":  "lite",         // needs to communicate clearly
  "docs":             "normal",       // writing documentation
  "backend-dev":      "heavy",        // default agent-to-agent
  "devops":           "ultra"         // internal ops output
}
```

## 6 — Changing Model Routing

Edit `.hivemind/project.json > routing`:

```json
"routing": {
  "lite":     { "model": "claude-haiku-4-5-20251001", "max_tokens": 4096 },
  "standard": { "model": "claude-sonnet-4-6",         "max_tokens": 8192 },
  "heavy":    { "model": "claude-opus-4-6",           "max_tokens": 16384 }
}
```

Or for a different provider:

```json
"routing": {
  "lite":     { "model": "gpt-4o-mini" },
  "standard": { "model": "gpt-4o" },
  "heavy":    { "model": "o1" }
}
```

Non-Claude providers require your orchestrator to honor the tier hints (Claude Code does it natively).

## 7 — Changing Railguards

Edit `.hivemind/project.json > railguards`:

```json
"railguards": {
  "max_loop_depth": 5,                        // more permissive
  "max_file_iterations_per_session": 10,
  "destructive_mode": "relaxed",              // require confirm only in prod
  "forbidden_operations": [
    ...existing,
    "docker system prune"                     // add your own
  ]
}
```

Every railguard change is a `DEC-*` decision — log it.

## 8 — Changing Reply Language

Edit `.hivemind/project.json > communication`:

```json
"reply_language": "pt-BR"
```

Supported: `en`, `pt-BR`, `es`, `fr`, `de`, `ja`.

Technical terms stay English regardless. Compression rules apply per-language (different articles).

## 9 — Customizing MANIFEST

Add custom sections to MANIFEST as your project grows:

- `## KPI Snapshot` — project-specific metrics
- `## Release Cadence` — upcoming release dates
- `## External Dependencies` — third-party services status

Keep Tier 0 Snapshot compact — don't push past ~300 tokens or you defeat the purpose of tiered loading.

## 10 — Adding MCP Servers

Edit `.hivemind/project.json > mcps.enabled` and `.claude/settings.json` for the actual MCP config.

Catalog: `.hivemind/tools/mcp-catalog.md`.

## Anti-patterns

- Copy-pasting agent profiles without adjusting boundaries → overlapping ownership
- Adding a command without `.claude/commands/<name>.md` → doesn't appear in dropdown
- Changing railguards without a `DEC-*` → future sessions confused
- Overwriting `_AGENT_TEMPLATE.md` → breaks future agent creation
- Editing MANIFEST manually instead of re-running commands → index corruption
