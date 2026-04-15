<p align="center">
  <img src="assets/logo.png" alt="HiveMind Protocol" width="160" />
</p>

# HiveMind Protocol

**A multi-agent context and behavior framework for AI-assisted software development.**

HiveMind Protocol is an open-source repository template that structures how AI agents collaborate on a software project. It gives any LLM (Claude, GPT, Gemini, or others) persistent memory, defined roles, behavioral boundaries, and a shared communication protocol — preventing hallucinations, token waste, and context loss across sessions.

---

## Core Concepts

| Concept | What it does |
|---------|-------------|
| **Agent profiles** | 12 role-based `.md` files that define behavior, ownership, and responsibilities |
| **Shared memory** | A file-based memory system that persists state across sessions and between agents |
| **Model routing** | Automatic model selection by task complexity (Haiku → Sonnet → Opus) |
| **Token compression** | Caveman-inspired output (~65% reduction) + memory compression (~46% input reduction) |
| **Railguards** | Rules that prevent loops, token waste, and dangerous operations |
| **Reports** | A living changelog and audit log written collaboratively by all agents |
| **Tools** | MCP catalog, code ownership map, scaffold templates, and custom commands |

---

## Repository Structure

```
.
├── CLAUDE.md                          ← Global behavior protocol (auto-loaded by Claude Code)
├── project.json                       ← Project definition: stack, agents, routing, railguards
│
├── agents/
│   ├── _AGENT_TEMPLATE.md             ← Template for creating new agents
│   ├── 01-cto.md                      ← CTO — strategic decisions, final escalation
│   ├── 02-lead-dev.md                 ← Lead Developer — architecture, cross-agent coordination
│   ├── 03-product-manager.md          ← Product Manager — specs, backlog, acceptance criteria
│   ├── 04-backend-dev.md              ← Backend Developer — APIs, databases, services
│   ├── 05-frontend-dev.md             ← Frontend Developer — UI, components, client state
│   ├── 06-devops.md                   ← DevOps/SRE — CI/CD, infra, deployments
│   ├── 07-security.md                 ← Security Engineer — audits, threat modeling, blocks
│   ├── 08-qa.md                       ← QA Engineer — test plans, E2E, release gates
│   ├── 09-data.md                     ← Data Engineer — pipelines, analytics, schemas
│   ├── 10-docs.md                     ← Technical Writer — guides, API docs, ADRs
│   ├── 11-mobile.md                   ← Mobile Developer — iOS, Android, React Native
│   └── 12-ai-ml.md                   ← AI/ML Engineer — LLMs, RAG, embeddings
│
├── memory/
│   ├── shared-context.md              ← Global project state (all agents read at start)
│   ├── decisions.log                  ← Append-only decision log
│   ├── handoff-queue.md               ← Cross-agent task queue
│   ├── blockers.md                    ← Active blockers and impediments
│   └── agent-states/
│       └── <role>.state.md            ← Per-agent session state (resume context)
│
├── tools/
│   ├── mcp-catalog.md                 ← MCP server recommendations + setup guide
│   ├── code-boundaries.md             ← File ownership map + cross-agent rules
│   ├── token-railguards.md            ← Anti-waste and anti-loop rules
│   ├── custom-commands.md             ← Available slash commands and their behavior
│   └── scaffold-templates/
│       ├── nextjs.md                  ← Next.js 14 App Router scaffold
│       ├── fastapi.md                 ← FastAPI + SQLAlchemy scaffold
│       ├── node-api.md                ← Express + TypeScript scaffold
│       ├── react-native.md            ← Expo React Native scaffold
│       └── monorepo.md                ← Turborepo monorepo scaffold
│
└── reports/
    ├── CHANGELOG.md                   ← Agent-authored changelog (living document)
    ├── sprint-report.md               ← Sprint summaries by Product Manager
    └── audit-log.md                   ← Security findings and resolutions
```

---

## Model Routing

HiveMind Protocol routes tasks to different models based on complexity, keeping costs low while maintaining quality.

| Tier | Model | Use for |
|------|-------|---------|
| **Lite** | `claude-haiku-4-5-20251001` | Reading files, writing logs, status checks, formatting |
| **Standard** | `claude-sonnet-4-6` | Writing code, debugging, tests, API design |
| **Heavy** | `claude-opus-4-6` | Architecture, security audits, cross-system design |

Configure model IDs in `project.json > routing`. Agents select the appropriate tier based on the task type rules defined there and in `CLAUDE.md`.

---

## Token Compression

HiveMind Protocol uses a two-sided compression strategy inspired by [caveman](https://github.com/JuliusBrussee/caveman):

| Side | Technique | Reduction |
|------|-----------|-----------|
| **Output** | Caveman communication rules — no filler, no preamble, execute before explaining | ~65% |
| **Input** | Memory files written in compressed prose — drop articles, filler, hedging | ~46% per session |

In multi-agent systems, costs cascade: verbose output from agent A becomes input to agent B. Compression attacks both sides.

**Three intensity levels** (set in `project.json > communication.default_intensity`):

```
lite  (~40%) → human-facing output, user explanations
full  (~60%) → agent-to-agent communication (default)
ultra (~75%) → memory writes, log entries, internal chains
```

**Auto-Clarity Exception**: compression is automatically suspended for security warnings and irreversible operations, then resumed. Safety is never sacrificed for brevity.

Research shows brevity constraints don't just save money — they improve accuracy by reducing the hallucination surface area in long verbose responses.

---

## Getting Started

### 1. Clone or use as template
```bash
git clone https://github.com/your-org/hivemind-protocol my-project
cd my-project
```

### 2. Configure your project
Edit `project.json`:
- Set `meta` (name, stack, team)
- Set `agents.active` to the agents your project needs
- Set `mcps.enabled` to the MCP servers you will use

### 3. Initialize with Claude Code
Open Claude Code in this directory and run:
```
/init
```

Or manually tell any agent to start:
```
You are the CTO agent. Read your profile at agents/01-cto.md and begin session initialization.
```

### 4. Enable MCPs (optional, Claude Code)
Follow the setup guide in `tools/mcp-catalog.md` to configure MCP servers in your `~/.claude/settings.json`.

### 5. Start working
Each agent will:
1. Read initialization files on session start
2. Select the correct model tier for each task
3. Update memory files as they work
4. Log completed work to `reports/CHANGELOG.md`

---

## Using with Other Models

HiveMind Protocol works with any LLM that can follow markdown instructions:

| Platform | How to load CLAUDE.md |
|----------|-----------------------|
| **Claude Code** | Auto-loaded from project root |
| **API (any model)** | Include as `system` message or first `user` message |
| **GPT / ChatGPT** | Paste into system prompt or Custom Instructions |
| **Gemini** | Include in system instructions |
| **Open-source (Ollama, etc.)** | Include in system prompt |

For non-Claude models, replace `claude-haiku-*`, `claude-sonnet-*`, and `claude-opus-*` in `project.json > routing` with the equivalent model IDs for your provider.

---

## Key Commands

| Command | Description | Model Tier |
|---------|-------------|-----------|
| `/init` | Configure the project and initialize all agents | standard |
| `/status` | Show current state of all agents | lite |
| `/focus <agent>` | Scope session to a specific agent | lite |
| `/standup` | Daily standup summary across all agents | lite |
| `/checkpoint [--label]` | Snapshot state before risky operations | lite |
| `/handoff <from> <to> <task>` | Transfer a task between agents | lite |
| `/report <agent> <summary>` | Log to CHANGELOG | lite |
| `/blocker <description>` | Register a blocker | lite |
| `/resolve <blocker-title>` | Close an active blocker | lite |
| `/decision <agent> <text>` | Log a decision | lite |
| `/review <file>` | Structured code review by owning agent | standard |
| `/hotfix <description>` | Emergency fix workflow | standard |
| `/deploy [--env]` | Formalize QA → Security → DevOps handoff | standard |
| `/scaffold <template>` | Generate project structure | standard |
| `/audit [--scope <scope>]` | Run security audit | heavy |
| `/sprint` | Generate sprint report | lite |

---

## Adding a New Agent

1. Copy `agents/_AGENT_TEMPLATE.md` to `agents/13-<role>.md`
2. Fill in all fields
3. Create `memory/agent-states/<role>.state.md` from the template
4. Add the agent slug to `project.json > agents.available`
5. Activate by adding to `project.json > agents.active`

---

## Contributing

Contributions are welcome. Please follow the conventions in `tools/code-boundaries.md` when submitting PRs.

- Agent profiles: keep them precise, actionable, and LLM-readable
- Memory format: never break the append-only protocol
- Commands: every command must specify its model tier

---

## License

MIT — use freely, customize fully.
