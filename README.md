<p align="center">
  <img src="assets/logo.png" alt="HiveMind Protocol" width="160" />
</p>

# HiveMind Protocol

**A multi-agent context and behavior framework for AI-assisted software development.**  
**Drop it into any repo as `.hivemind/` — give your agents persistent memory, role discipline, and token hygiene.**

```bash
npx create-hivemind-protocol my-project
```

HiveMind is a **framework folder** (`.hivemind/`) you place at the root of any project. It turns any AI coding assistant into a governed multi-agent system with persistent memory, defined roles, behavioral railguards, and a 4-level token compression protocol — preventing hallucinations, context loss, and the classic agent failure modes: forgetting, looping, drifting, and burning tokens.

Works natively with **Claude Code** (hooks + slash commands). Also supports **Cursor**, **Windsurf**, **GitHub Copilot**, **OpenAI Codex**, and **Gemini CLI** via platform-specific instruction files installed automatically by the scaffolder.

---

## Why HiveMind

| Pain | HiveMind fix |
|------|--------------|
| Agent forgets project context every session | Tiered memory system (MANIFEST-led) |
| Agent loops on same failing approach | Anti-loop railguards (3-attempt limit → escalate) |
| Agent burns tokens on filler and re-reads | 4-level compression + tier-gated file reads |
| Agent touches files it shouldn't | Code-boundaries map per agent role |
| Agent skips documentation | Append-only decisions + CHANGELOG protocol |
| Agent does destructive ops silently | Confirmation gates + auto-clarity suspension |
| Commands collide with other tools | All HiveMind commands use `/hm-*` prefix |
| Framework ≠ project confusion | SessionStart hook injects boundary rule as system context |
| Instructions reset between sessions | Hook injection + MANIFEST Tier 0 persist across turns |

---

## Installation

### Option A — New project from template (recommended)

```bash
npx create-hivemind-protocol my-project
cd my-project
```

Scaffolds `.hivemind/`, `.claude/commands/`, `.claude/settings.json` (with hooks pre-wired), `CLAUDE.md`, plus platform adapters for Cursor, Windsurf, Copilot, Codex, and Gemini.

The SessionStart hook (`hooks/hivemind-activate.js`) injects framework rules into system context so they persist across all turns, not just as document context.

### Option B — Clone into existing project

```bash
cd my-project/
git clone --depth 1 https://github.com/Awi-24/HiveMind-Protocol .hivemind-seed
mv .hivemind-seed/.hivemind ./.hivemind
mv .hivemind-seed/.claude ./.claude
mv .hivemind-seed/CLAUDE.md ./CLAUDE.md
mv .hivemind-seed/hooks ./hooks
rm -rf .hivemind-seed
```

Then wire hooks into `.claude/settings.json`:

```json
{
  "hooks": {
    "SessionStart": [{"hooks": [{"type": "command", "command": "node hooks/hivemind-activate.js", "timeout": 5}]}],
    "UserPromptSubmit": [{"hooks": [{"type": "command", "command": "node hooks/hivemind-compress-tracker.js", "timeout": 5}]}]
  }
}
```

### Initialize

Open your AI tool at the project root and run:

```
/hm-init
```

The CTO agent presents an onboarding form (project name, stack, active agents, compression level, language). Answers populate `.hivemind/project.json` and bootstrap the memory system.

---

## Repository Layout (after install)

```
your-project/
├── .hivemind/                    ← HiveMind framework (NOT your project code)
│   ├── agents/                   ← 12 role profiles
│   ├── memory/
│   │   ├── MANIFEST.md           ← Tier 0 — self-sufficient session snapshot
│   │   ├── shared-context.md
│   │   ├── decisions.log
│   │   ├── handoff-queue.md
│   │   ├── blockers.md
│   │   └── agent-states/
│   ├── reports/
│   │   ├── CHANGELOG.md
│   │   ├── sprint-report.md
│   │   └── audit-log.md
│   ├── tools/
│   │   ├── token-compression.md
│   │   ├── code-boundaries.md
│   │   ├── token-railguards.md
│   │   ├── mcp-catalog.md
│   │   ├── custom-commands.md
│   │   └── scaffold-templates/
│   └── project.json              ← filled by /hm-init
│
├── .claude/
│   ├── settings.json
│   └── commands/                 ← 23 /hm-* slash commands (appear in / dropdown)
│
├── hooks/                        ← Claude Code hook scripts
│   ├── hivemind-activate.js      ← SessionStart: injects rules as system context
│   └── hivemind-compress-tracker.js
│
├── .claude-plugin/               ← Claude Code plugin manifest
│   ├── plugin.json
│   └── marketplace.json
│
├── skills/hivemind/SKILL.md      ← Claude Code skill registration
│
├── CLAUDE.md                     ← auto-loaded behavior protocol (Claude Code)
├── GEMINI.md                     ← Gemini CLI instructions
├── AGENTS.md                     ← OpenAI Codex instructions
├── .windsurfrules                ← Windsurf instructions
├── .cursor/rules/hivemind.mdc    ← Cursor instructions (alwaysApply: true)
├── .github/copilot-instructions.md ← GitHub Copilot instructions
│
└── src/ apps/ services/ …        ← YOUR project code
```

**Hard rule**: `.hivemind/` is the framework, not the project. Project code never goes inside it.

---

## Multi-Platform Support

The scaffolder installs instruction files for each platform automatically. All share the same core rules — framework boundary, MANIFEST-first loading, `/hm-*` commands, append-only memory.

| Platform | Instruction file | How it loads |
|----------|-----------------|--------------|
| **Claude Code** | `CLAUDE.md` + `hooks/hivemind-activate.js` | Auto-loaded + system context injection |
| **Cursor** | `.cursor/rules/hivemind.mdc` | `alwaysApply: true` — active in all chats |
| **Windsurf** | `.windsurfrules` | Auto-loaded at workspace open |
| **GitHub Copilot** | `.github/copilot-instructions.md` | Auto-loaded for all Copilot interactions |
| **OpenAI Codex** | `AGENTS.md` | Read by Codex agent on session start |
| **Gemini CLI** | `GEMINI.md` | Auto-loaded in project directory |
| **Universal** | `AI_INSTRUCTIONS.md` | Manual include (Aider, Continue, custom) |

---

## The 12 Agents

Role-based profiles under `.hivemind/agents/`. Activate only what you need via `/hm-init`.

| Slug | Role | Default tier |
|------|------|--------------|
| `cto` | Chief Technology Officer — governance, final escalation | heavy |
| `lead-dev` | Lead Developer — architecture, cross-agent coordination | standard |
| `product-manager` | Specs, backlog, acceptance criteria | lite |
| `backend-dev` | APIs, services, databases | standard |
| `frontend-dev` | UI, components, client state | standard |
| `devops` | CI/CD, infra, deploys | standard |
| `security` | Audits, threat modeling, blocks | heavy |
| `qa` | Test plans, E2E, release gates | standard |
| `data` | Pipelines, analytics, schemas | standard |
| `docs` | Guides, API docs, ADRs | lite |
| `mobile` | iOS, Android, React Native | standard |
| `ai-ml` | LLMs, RAG, embeddings | heavy |

Each agent has scoped read/write permissions, a default model tier, and an escalation path defined in its profile.

---

## Tiered Memory System

Designed so 90% of sessions never read past Tier 0.

| Tier | Load | Size | When |
|------|------|------|------|
| **Tier 0** | `MANIFEST.md` | ~200 tok | Always — self-sufficient snapshot with counters, last decisions, link index, backlinks, tag index |
| **Tier 1** | agent profile + own state | ~400 tok | On `/hm-focus` or agent-scoped task |
| **Tier 2** | blockers / handoffs / decisions | ~500 tok | Only if MANIFEST flags signal you need them |
| **Tier 3** | full logs, cross-agent states, reports | variable | Explicit fetch only — never speculative |

MANIFEST is updated after **every** memory write, so it stays the single source of truth.

---

## Linking System (Obsidian-style)

Every memory entry gets a stable ID. MANIFEST holds the forward + backlink + tag indices, so agents navigate in **O(1)** without grep.

### Entry IDs

```
DEC-20260416-001   ← decision
BLK-20260416-003   ← blocker
HDF-20260416-002   ← handoff
CHG-20260416-007   ← changelog
HFX-20260416-001   ← hotfix
CHK-20260416-001   ← checkpoint
AUD-20260416-001   ← audit finding
MEM-20260416-001   ← memo
SPR-20260416-001   ← sprint report
```

### Wiki-links

```
[[DEC-20260416-001]]           → reference an entry
[[BLK-20260412-003|migration]] → reference with custom label
[[@backend-dev]]               → reference an agent
[[#auth]]                      → reference a domain tag
```

### Example entry

```
[2026-04-16 14:30] DEC-20260416-001 [[@backend-dev]] #auth #db
DECISION: JWT refresh via Redis sessions
REASON: stateful revocation requirement from [[AUD-20260410-002]]
SUPERSEDES: [[DEC-20260201-005]]
REFERENCES: [[BLK-20260412-003]]
```

### Navigation

```
/hm-link DEC-20260416-001   → full entry + backlinks + forward refs
/hm-link #auth              → all entries tagged #auth, grouped by kind
/hm-link @backend-dev       → agent profile + state + workload
```

### Domain tags (pre-registered)

`#auth` `#db` `#api` `#frontend` `#backend` `#infra` `#ci` `#security` `#qa` `#data` `#docs` `#mobile` `#ai-ml` `#governance` `#perf` `#deps`

Custom tags allowed — register in MANIFEST Tag Registry on first use. Every entry requires at least one tag.

### Why it matters

| Operation | Without linking | With linking | Saving |
|-----------|----------------:|-------------:|-------:|
| Resolve a reference | ~800 tok (grep + read) | ~40 tok (MANIFEST row) | ~95% |
| Find all `#auth` entries | ~1,200 tok | ~30 tok | ~97% |
| Check blocker impact | ~600 tok | ~25 tok | ~96% |
| Cold nav (200 entries) | ~3,000 tok | ~800 tok | ~73% |

Full spec: [`.hivemind/tools/linking.md`](.hivemind/tools/linking.md).

---

## Model Routing

```
┌──────────┬──────────────────────────────┬────────────────────────────────┐
│  Tier    │            Model             │          Use for               │
├──────────┼──────────────────────────────┼────────────────────────────────┤
│ lite     │ claude-haiku-4-5-20251001    │ reads, logs, status, formatting│
│ standard │ claude-sonnet-4-6            │ code, debug, tests, reviews    │
│ heavy    │ claude-opus-4-6              │ architecture, audits, RCAs     │
└──────────┴──────────────────────────────┴────────────────────────────────┘
```

Use `/hm-route <task>` when unsure. Escalation rule: 3 failed attempts at a tier → escalate one tier up, log in `decisions.log`.

For non-Claude platforms, replace model IDs in `.hivemind/project.json > routing` with equivalents (e.g. `gpt-4o-mini`, `gemini-2.0-flash`, `llama3.1:70b`).

---

## Token Compression — 4 Levels

Inspired by [caveman](https://github.com/JuliusBrussee/caveman). Full spec in `.hivemind/tools/token-compression.md`.

| Level | Reduction | When |
|-------|-----------|------|
| `normal` | 0% | Onboarding, tutorials, user-facing depth |
| `lite` | ~40% | Human-facing technical — drop filler |
| `heavy` | ~60% | Default agent-to-agent — drop articles |
| `ultra` | ~75% | Memory writes, logs — abbr + arrows |

**Abbreviation dictionary** (ultra): `db`, `auth`, `cfg`, `env`, `deps`, `infra`, `repo`, `fn`, `param`, `resp`, `req`, `var`, `prod`, `stg`, `dev`, `mig`, `creds`, `perf`, `txn`, `app`, `cmp`, `msg`, `ref`, `impl`, `tmp`, `notif`, `valid`, `sess`.

**Arrows**: `→` causes, `←` depends on, `↔` syncs, `⚠` warning, `✗` failed, `✓` done, `∅` idle.

**Auto-clarity suspension**: compression automatically stops for CRITICAL security warnings, irreversible ops, and order-sensitive sequences. Resumes after the critical section.

Switch per session: `/hm-compress <level>`.

---

## Slash Commands (23 total, all `/hm-*` prefixed)

The `/hm-` prefix avoids collisions with commands from other tools.

### Lifecycle
| Command | Tier | Purpose |
|---------|------|---------|
| `/hm-init` | heavy | CTO onboarding form (run once per project) |
| `/hm-scaffold <template>` | standard | Generate project structure |
| `/hm-sprint` | lite | Generate sprint report |
| `/hm-deploy --env <env>` | standard | QA → Security → DevOps chain |

### Daily work
| Command | Tier | Purpose |
|---------|------|---------|
| `/hm-status` | lite | Cross-agent summary |
| `/hm-standup` | lite | Daily standup |
| `/hm-focus <agent>` | lite | Scope session to one agent |
| `/hm-handoff <from> <to> <task>` | lite | Formal handoff |
| `/hm-report <agent> <summary>` | lite | Append CHANGELOG |
| `/hm-decision <agent> <text>` | lite | Append decisions.log |
| `/hm-memo <text>` | lite | Quick one-liner note |
| `/hm-link <ref>` | lite | Resolve ID, `#tag`, or `@agent` (read-only) |
| `/hm-review <file>` | standard | Structured code review |

### Incidents
| Command | Tier | Purpose |
|---------|------|---------|
| `/hm-blocker <desc>` | lite | Register blocker |
| `/hm-resolve <title>` | lite | Close blocker |
| `/hm-hotfix <desc>` | standard | Fast-track emergency fix |
| `/hm-audit --scope <scope>` | heavy | Security audit |
| `/hm-checkpoint --label <name>` | lite | Snapshot pre-risky-op |

### Token hygiene
| Command | Tier | Purpose |
|---------|------|---------|
| `/hm-compact` | lite | Compress old memory into digest |
| `/hm-compress <level>` | lite | Change session compression |
| `/hm-digest [--since <days>]` | lite | Activity summary (no writes) |
| `/hm-reset-context [--keep <agent>]` | lite | Drop non-essential context |
| `/hm-route <task>` | lite | Suggest tier + owning agent |

---

## Railguards

Defined in `.hivemind/project.json > railguards`. Enforced globally by every agent.

- **Anti-loop**: 3 attempts same approach → escalate + log
- **Anti-waste**: no speculative reads, no "just-in-case" code, no adjacent refactors
- **Destructive ops**: `DROP`, `DELETE`, `rm -rf`, `git push --force`, `terraform destroy` → log + confirm before run
- **Forbidden patterns**: `eval(`, `exec(`, `shell=True`, `innerHTML =`, inline passwords
- **Framework protection**: `.hivemind/` is read-only to all non-governance operations
- **Secret exposure**: never in logs, comments, or CHANGELOG

---

## Adding a New Agent

1. Copy `.hivemind/agents/_AGENT_TEMPLATE.md` → `.hivemind/agents/13-<role>.md`
2. Create `.hivemind/memory/agent-states/<role>.state.md` from template
3. Add slug to `.hivemind/project.json > agents.available` and `agents.active`
4. Optionally add code-ownership rules in `.hivemind/tools/code-boundaries.md`
5. Run `/hm-focus <role>` to verify

---

## Adding a Slash Command

1. Create `.claude/commands/hm-<name>.md` with frontmatter:
   ```markdown
   ---
   description: One-line description (appears in dropdown)
   argument-hint: <arg1> [--opt <value>]
   model: claude-haiku-4-5-20251001
   ---

   Instructions for the agent when this command runs.
   Use $ARGUMENTS to reference passed args.
   ```
2. Register in `.hivemind/project.json > commands` with its tier
3. Document in `.hivemind/tools/custom-commands.md`

The command appears in the Claude Code `/` dropdown immediately.

---

## Supported Reply Languages

`en` (default), `pt-BR`, `es`, `fr`, `de`, `ja`. Set via `/hm-init` or `.hivemind/project.json > communication.reply_language`. Technical terms always remain in English.

---

## Contributing

- Keep agent profiles precise, actionable, LLM-readable
- Never break the append-only memory protocol
- Every new command must declare its model tier and use the `/hm-` prefix
- Run `/hm-audit --scope all` before opening a PR

---

## License

GPL-3.0
