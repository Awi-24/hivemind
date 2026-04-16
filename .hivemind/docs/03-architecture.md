# 3 — Architecture

## Runtime Model

HiveMind is **stateless code + stateful memory**. The framework itself (markdown files) doesn't execute. The runtime is whatever LLM agent reads the files.

```
┌──────────────────────┐
│  LLM Agent (runtime) │  ← Claude Code, GPT, Gemini, Ollama…
└────────┬─────────────┘
         │ reads
         ▼
┌──────────────────────┐
│  CLAUDE.md           │  ← protocol (how to behave)
└────────┬─────────────┘
         │ references
         ▼
┌──────────────────────┐
│  .hivemind/          │  ← framework files
│  ├─ agents/          │  ← role definitions
│  ├─ memory/          │  ← state (read/write)
│  ├─ reports/         │  ← append-only logs
│  ├─ tools/           │  ← specs (compression, linking, railguards)
│  ├─ docs/            │  ← human documentation
│  └─ project.json     │  ← config
└──────────────────────┘
```

## Trust Boundaries

| Boundary | Policy |
|----------|--------|
| User code ↔ `.hivemind/` | `.hivemind/` is read-only to code generation. Only governance commands write to it. |
| Agent ↔ Agent | Handoffs are formal — always via `handoff-queue.md` + logged in `decisions.log` |
| Agent ↔ External (deploy, destructive ops) | Auto-clarity suspension + explicit confirmation gate |
| Agent ↔ Memory | Append-only for logs; MANIFEST is atomic with writes |
| `.claude/commands/` ↔ `.hivemind/` | Commands are the only path that writes to memory |

## Folder Layout (deep)

```
your-project/
│
├── CLAUDE.md                              # Auto-loaded protocol
│
├── .claude/
│   ├── settings.json                      # Permissions, model, MCP config
│   └── commands/                          # Slash commands (dropdown registration)
│       ├── init.md
│       ├── status.md
│       ├── standup.md
│       ├── focus.md
│       ├── handoff.md
│       ├── report.md
│       ├── decision.md
│       ├── memo.md
│       ├── link.md
│       ├── review.md
│       ├── blocker.md
│       ├── resolve.md
│       ├── hotfix.md
│       ├── audit.md
│       ├── checkpoint.md
│       ├── scaffold.md
│       ├── sprint.md
│       ├── deploy.md
│       ├── compact.md
│       ├── compress.md
│       ├── digest.md
│       ├── reset-context.md
│       └── route.md
│
└── .hivemind/
    ├── project.json                       # Project config (stack, agents, routing, compression)
    │
    ├── agents/                            # 12 role profiles + template
    │   ├── _AGENT_TEMPLATE.md
    │   ├── 01-cto.md
    │   ├── 02-lead-dev.md
    │   ├── 03-product-manager.md
    │   ├── 04-backend-dev.md
    │   ├── 05-frontend-dev.md
    │   ├── 06-devops.md
    │   ├── 07-security.md
    │   ├── 08-qa.md
    │   ├── 09-data.md
    │   ├── 10-docs.md
    │   ├── 11-mobile.md
    │   └── 12-ai-ml.md
    │
    ├── memory/
    │   ├── MANIFEST.md                    # Tier 0 — always loaded
    │   ├── shared-context.md              # Project state, memos, recent changes
    │   ├── decisions.log                  # Append-only decisions (with DEC-IDs)
    │   ├── handoff-queue.md               # Cross-agent task queue (HDF-IDs)
    │   ├── blockers.md                    # Active + resolved blockers (BLK/HFX-IDs)
    │   └── agent-states/                  # Per-agent resume state
    │       ├── _STATE_TEMPLATE.md
    │       ├── cto.state.md
    │       ├── lead-dev.state.md
    │       ├── backend-dev.state.md
    │       ├── frontend-dev.state.md
    │       ├── devops.state.md
    │       ├── security.state.md
    │       ├── qa.state.md
    │       ├── data.state.md
    │       ├── docs.state.md
    │       ├── mobile.state.md
    │       ├── ai-ml.state.md
    │       └── product-manager.state.md
    │
    ├── reports/
    │   ├── CHANGELOG.md                   # Living changelog (CHG-IDs)
    │   ├── sprint-report.md               # Sprint summaries (SPR-IDs)
    │   └── audit-log.md                   # Security findings (AUD-IDs)
    │
    ├── tools/
    │   ├── token-compression.md           # 4-level compression spec
    │   ├── linking.md                     # Entry IDs + wiki-links + backlinks
    │   ├── token-railguards.md            # Anti-waste, anti-loop
    │   ├── code-boundaries.md             # File ownership per role
    │   ├── custom-commands.md             # Command reference (mirrors .claude/commands/)
    │   ├── mcp-catalog.md                 # MCP server catalog
    │   └── scaffold-templates/
    │       ├── nextjs.md
    │       ├── fastapi.md
    │       ├── node-api.md
    │       ├── react-native.md
    │       └── monorepo.md
    │
    └── docs/                              # This human documentation
        ├── README.md
        ├── 01-overview.md
        ├── 02-installation.md
        ├── 03-architecture.md             ← you are here
        ├── 04-agents.md
        ├── 05-memory-system.md
        ├── 06-linking-system.md
        ├── 07-token-compression.md
        ├── 08-model-routing.md
        ├── 09-commands.md
        ├── 10-railguards.md
        ├── 11-workflows.md
        ├── 12-customization.md
        ├── 13-multi-model.md
        ├── 14-faq.md
        └── 15-glossary.md
```

## Load Order (every session)

```
1. Claude Code auto-loads CLAUDE.md
2. CLAUDE.md § 1 — agent reads .hivemind/memory/MANIFEST.md (Tier 0)
3. IF MANIFEST fresh (< 24h) AND task is trivial → start work
   ELSE → read Tier 1 (role profile + own state)
4. IF MANIFEST flags active blockers/handoffs for you → read Tier 2
5. Tier 3 files loaded only if the specific task demands
```

## Write Order (any memory write)

```
1. Command file (.claude/commands/<name>.md) executes
2. Agent reads MANIFEST to get next entry ID
3. Agent writes entry to target file (with ID inline, tags, [[links]])
4. Agent updates MANIFEST atomically:
   - Link Index (new row)
   - Backlinks (for each [[ID]] in entry)
   - Tag Index (for each #tag)
   - Counters
   - Update log
5. Output confirmation to user (ultra compression)
```

If step 4 fails, step 3 is rolled back or flagged in the update log for repair.

## Lifecycle States

```
┌───────────┐  /init   ┌────────────┐  /focus  ┌─────────────┐
│  empty    │ ───────▶ │ initialized│ ───────▶ │  agent-scope│
└───────────┘          └────────────┘          └─────────────┘
                             │                        │
                             │ /scaffold              │ /report /decision
                             ▼                        ▼ /handoff
                       ┌────────────┐          ┌─────────────┐
                       │ has project│          │ active work │
                       │ code       │          └─────────────┘
                       └────────────┘
```

## Extension Points

- **New agent** → drop a file in `.hivemind/agents/13-<role>.md` + register in `project.json > agents.available`
- **New command** → drop a file in `.claude/commands/<name>.md` + register in `project.json > commands`
- **New scaffold** → drop a file in `.hivemind/tools/scaffold-templates/<name>.md`
- **New tag** → use it in an entry; MANIFEST registers it on first use
- **New compression level** → not recommended; the 4 levels are empirically tuned

## Design Principles

1. **Markdown over code.** The framework is editable, diffable, reviewable by humans.
2. **MANIFEST-first.** Single source of truth for navigation. Tiered reads save tokens.
3. **Append-only memory.** History is never overwritten — auditable and reversible.
4. **IDs over line refs.** Stable across compaction and reordering.
5. **Compression by default.** Tokens are the scarce resource; clarity suspends when safety requires.
6. **Railguards, not tutorials.** Hard limits catch runaway behavior; the framework doesn't ask nicely.
7. **Bring your own runtime.** No lock-in to Claude — the protocol works with any instruction-following LLM.
