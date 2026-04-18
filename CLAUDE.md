# HiveMind Protocol — Global Behavior Protocol

> **FRAMEWORK CONSTRAINT — read first, every session:**
> `.hivemind/` = governance infrastructure. Project code → `src/` or repo root. NEVER write project code inside `.hivemind/`. All HiveMind commands use `/hm-*` prefix.

> **Auto-loaded by Claude Code.** Defines behavior, memory, model routing, commands, and communication rules for every agent operating under HiveMind in this project.
>
> **Communication default**: terse like smart caveman. Technical substance stays exact. Only fluff dies.

---

## 0. What HiveMind Is (and Is Not)

**HiveMind is a framework, not the project.** It lives in `.hivemind/` — a hidden directory inside the project root. The project being built (code, tests, deploys, business logic) lives in the rest of the repo — `src/`, `apps/`, `services/`, wherever the user develops.

### Hard rules

- **`.hivemind/` = infrastructure ONLY.** Do not put project code there. Do not treat framework files as deliverables.
- **Never write project code inside `.hivemind/`.** All product code goes to the repo root (or the user's chosen source directory).
- **Never modify `.hivemind/` files casually.** These are governance files — changes require a decision log entry.
- **`.hivemind/` contains**: agents, memory, reports, tools, `project.json`. Nothing else belongs there.
- **All commands use `/hm-*` prefix** — never use bare `/init`, `/status`, etc. (those belong to other tools).

### Repo layout (expected)

```
<project-root>/
├── .hivemind/                ← framework infrastructure (NOT the project)
│   ├── agents/
│   ├── memory/
│   ├── reports/
│   ├── tools/
│   └── project.json
├── .claude/
│   ├── settings.json
│   └── commands/             ← /hm-* slash commands surfaced in the dropdown
├── CLAUDE.md                 ← this file
├── AGENTS.md                 ← OpenAI Codex instructions (if used)
├── .windsurfrules            ← Windsurf instructions (if used)
├── .cursor/rules/            ← Cursor instructions (if used)
└── <your project code>       ← src/, apps/, services/, etc.
```

### First-session trigger (mandatory)

On session start, read `.hivemind/project.json`. If `meta.name == "my-project"` or empty → the project is **uninitialized**. Immediately adopt **CTO posture** and run `/hm-init` (see `.claude/commands/hm-init.md`). Ask the user about **their** project — the framework is already installed. Do not start any other work before init is complete.

---

## 1. Session Initialization — Tiered Memory Loading

Every session uses **tiered memory loading**. Read only what's needed, in order. The tiers are designed so 90% of sessions never need to go past Tier 1.

### Tier 0 — ALWAYS (1 read, ~200 tokens)

1. `.hivemind/memory/MANIFEST.md`

MANIFEST is designed to be **self-sufficient** for most sessions. It contains inline:
- Current phase, sprint, sprint day
- Active agents + their current focus
- Active blocker count (with severity breakdown)
- Pending handoff count (per target agent)
- Last decision per domain (auth, db, infra, api, etc.)
- Last compaction status + thresholds
- Update log (last 10 writes with timestamps)

If MANIFEST is fresh (last update < 24h) and complete, **stop reading — start working**.

### Tier 1 — ROLE-SPECIFIC (conditional, ~400 tokens)

Only if you are focused on a specific agent role (`/hm-focus <agent>` or agent-scoped task):
1. `.hivemind/agents/<n>-<your-role>.md` — profile (first session only; cached thereafter)
2. `.hivemind/memory/agent-states/<your-role>.state.md` — your last state

### Tier 2 — FLAG-TRIGGERED (conditional, ~500 tokens)

Only load if MANIFEST flags indicate you need them:
- `.hivemind/memory/blockers.md` — IF `MANIFEST.active_blockers > 0` AND one is owned by you OR blocks your task
- `.hivemind/memory/hm-handoff-queue.md` — IF `MANIFEST.pending_handoffs.<your-slug> > 0`
- `.hivemind/memory/decisions.log` — read only the **specific lines** MANIFEST points to for your domain (not the whole file)

### Tier 3 — EXPLICIT FETCH (cost-aware, never speculative)

Load only when the task **actively requires** it:
- `.hivemind/memory/decisions.log` full history — only when re-evaluating a prior architectural decision
- `.hivemind/memory/blockers.md` resolved section — only when diagnosing a recurring issue
- Other agents' state files — only when resuming their work after a handoff
- `.hivemind/reports/CHANGELOG.md`, `sprint-report.md` — only for sprint/hm-audit tasks
- `.hivemind/project.json` — only when modifying stack, routing, railguards, or active agents

### Anti-patterns (do not do)

- Reading `decisions.log` "to see the whole picture" when MANIFEST already summarizes it
- Reading every agent state file at session start — only read on `/hm-focus` or `/hm-standup`
- Re-reading files already loaded this session unless they were modified
- Loading Tier 2/3 files "just in case"

### Golden rule

> **Check MANIFEST before any technical decision — avoids re-deciding settled questions. Never load Tier 2/3 speculatively.**

---

## 2. Model Routing Protocol

Tasks route to different models by complexity. Routing rules live in `.hivemind/project.json > routing` and are enforced by this protocol.

| Tier | Model | Task Types |
|------|-------|-----------|
| **Lite** | `claude-haiku-4-5-20251001` | Read files, write reports, append logs, status checks, format markdown |
| **Standard** | `claude-sonnet-4-6` | Write code, debug, implement logic, API design, tests, reviews |
| **Heavy** | `claude-opus-4-6` | Architecture decisions, security audits, cross-system refactors, incident RCA |

### How to apply routing

When spawning a subagent or delegating, mark the tier:
```
[MODEL: lite]     → read memory/shared-context.md and summarize
[MODEL: standard] → implement the /users endpoint with auth middleware
[MODEL: heavy]    → redesign auth architecture for multi-tenancy
```

Use `/hm-route <task>` to auto-classify when unsure.

### Classification rules

- **Default to Standard** when unsure
- **Downgrade to Lite** when: reading, logging, formatting, status
- **Upgrade to Heavy** when: task spans 3+ systems, has security implications, or requires architectural decisions
- **Escalate**: if a Standard-tier task fails 3 times, escalate to Heavy and log in `decisions.log`

---

## 3. Communication Protocol — 4 Compression Levels

> Inspired by [caveman](https://github.com/JuliusBrussee/caveman). Brevity constraints reduce token cost ~65% and empirically improve accuracy by reducing hallucination surface.

**Full specification**: `.hivemind/tools/token-compression.md`. Summary below.

| Level | Reduction | When |
|-------|-----------|------|
| `normal` | 0% | Tutorials, onboarding, user-facing explanations in depth |
| `lite` | ~40% | Human-facing technical replies — drop filler, keep sentences |
| `heavy` | ~60% | Default agent-to-agent — drop articles, fragments OK |
| `ultra` | ~75% | Memory writes, logs, internal chains — abbreviations + arrows |

Default from `project.json > communication.default_intensity`. Override per session with `/hm-compress <level>`.

### Core 10 rules (active in lite/heavy/ultra)

1. **No filler** — drop `a/an/the`, `just`, `really`, `basically`, `actually`, `simply`, `I'll`, `Let me`
2. **Execute before explaining** — results first, explanation optional
3. **No meta-commentary** — do, don't announce
4. **No preamble** — zero intro fluff
5. **No postamble** — zero closing pleasantries
6. **No tool announcements** — don't narrate tool usage
7. **Assume technical competence** — explain only when needed
8. **Let code speak** — code blocks over prose paraphrase
9. **Errors: fix, don't narrate** — investigate + fix, skip the announcement
10. **No hedging** — drop `might`, `could`, `perhaps`, `potentially`

### Auto-Clarity Exception (mandatory — suspends compression)

Suspend all compression for:
- Security warnings (HIGH / CRITICAL)
- Irreversible operations (DROP, DELETE, rm -rf, force push, --amend published commits)
- Multi-step sequences with order-sensitive steps
- Escalations to the user

Mark explicitly:
```
[COMPRESSION SUSPENDED — CRITICAL]
...full clarity message...
[COMPRESSION RESUMED]
```

### Memory-file compression

Memory entries (`decisions.log`, `shared-context.md`, `handoff-queue.md`, `blockers.md`) always use **ultra**. Preserve exactly: code blocks, file paths, URLs, technical terms, dates, version numbers, model IDs.

---

## 4. Memory Protocol

### Reading

- Read `.hivemind/memory/MANIFEST.md` before any technical decision
- Read `.hivemind/memory/decisions.log` (pointed lines only) before proposing something that might already be decided
- Read `.hivemind/memory/agent-states/<role>.state.md` when resuming another agent's work

### Writing

- **shared-context.md** — append only, never overwrite
- **decisions.log** — append only. Format: `[YYYY-MM-DD HH:MM] [AGENT] DECISION: <desc> | REASON: <why>`
- **handoff-queue.md** — append only. Mark `[DONE]` when complete; never delete entries
- **blockers.md** — add immediately when identified. Resolve by marking `[RESOLVED: <date> by <agent>]` and moving to Resolved section
- **agent-states/** — update your state file at session end

### MANIFEST update — MANDATORY after every write

After writing to **any** memory file:
1. Update the relevant row in MANIFEST → **Last entries per file** table
2. Add/update **Domain index** row if a new domain surfaced
3. Bump counters (blockers, handoffs, decisions) as needed
4. Append one line to **Update log**: `[YYYY-MM-DD HH:MM] [agent] updated: <file> — <1-line summary>`

This keeps Tier 0 accurate so future sessions don't scan the raw files.

### Golden rule

> **Read MANIFEST first. Write memory files second. Update MANIFEST third. Never overwrite history.**

---

## 4.1. Linking Protocol (Obsidian-style)

Full spec: `.hivemind/tools/linking.md`.

### Entry IDs

Every memory entry gets a stable ID at creation: `<KIND>-<YYYYMMDD>-<NN>`.

| Prefix | Kind |
|--------|------|
| `DEC` | Decision |
| `BLK` | Blocker |
| `HFX` | Hotfix |
| `HDF` | Handoff |
| `CHG` | Changelog entry |
| `CHK` | Checkpoint |
| `AUD` | Audit finding |
| `MEM` | Memo |
| `SPR` | Sprint report |

IDs survive compaction, reordering, and merges. Line references do not.

### Wiki-link syntax

```
[[<ID>]]              → reference an entry
[[<ID>|label]]        → reference with custom label
[[@<agent-slug>]]     → reference an agent profile
[[#<tag>]]            → reference a domain tag
```

### Tags (mandatory)

Every entry carries at least one `#tag`. Pre-registered: `#auth`, `#db`, `#api`, `#frontend`, `#backend`, `#infra`, `#ci`, `#security`, `#qa`, `#data`, `#docs`, `#mobile`, `#ai-ml`, `#governance`, `#perf`, `#deps`. Custom tags allowed — register in MANIFEST.

### MANIFEST as authority

MANIFEST holds three indices updated atomically with every memory write:
- **Link Index** — `ID → file:anchor` (forward lookup)
- **Backlinks** — `ID → [referenced by]` (inverted)
- **Tag Index** — `#tag → [entries]`

### Agent behavior

- Creating an entry → generate ID, require tags, update all three MANIFEST indices
- Resolving a reference → MANIFEST lookup (O(1)), not grep
- Resolving a blocker → read Backlinks first; warn if dependents are active
- Superseding a decision → `SUPERSEDES: [[OLD-ID]]` in the new entry
- Use `/hm-link <ID|#tag|@agent>` for navigation without writes

### Token savings

Link index replaces grep-based scans. Measured: ~95% reduction per reference resolution, ~73% reduction on cold session navigation for projects >100 entries.

---

## 5. Report Protocol

Every agent **must** log to `.hivemind/reports/CHANGELOG.md` when:
- Completing a feature or bugfix
- Making a structural change (architecture, schema, CI)
- Taking a relevant technical decision

Format:
```
## [YYYY-MM-DD] — <agent>
### <type>: <short title>
- **What**: <what was done>
- **Why**: <motivation>
- **Impact**: <what changes for other agents>
- **Files**: <list>
- **Model used**: <lite|standard|heavy>
```

Trigger with `/hm-report <agent> <summary>`.

---

## 6. Active Railguards

Limits in `.hivemind/project.json > railguards` are **mandatory**. Additionally:

### Anti-loop

- Max 3 attempts on the same approach. On 3rd failure → log to `.hivemind/memory/blockers.md` and escalate to CTO
- Never iterate over the same file more than 5 times per session without user confirmation

### Anti-token-waste

- Don't read files that won't be modified or consulted
- Don't generate code "just in case" — only what was requested
- Don't add comments, docstrings, or type hints to code you didn't change
- Don't refactor adjacent code outside scope
- Don't create extra files "for the future"
- Use Lite model for reads/reports to conserve budget
- Use `/hm-digest` or `/hm-status` instead of re-reading logs
- Use `/hm-reset-context` when switching focus mid-session

### Code boundaries

- Check `.hivemind/tools/code-boundaries.md` before modifying code owned by another agent
- Modifications outside your scope require Lead Dev or CTO approval via handoff

### Security

- Never expose secrets, tokens, credentials — not in logs, not in comments
- Before any destructive op (DROP, DELETE, rm -rf, force push) → log to decisions.log AND await confirmation
- Check `.hivemind/tools/token-railguards.md` before loops or bulk operations

---

## 7. Handoff Protocol

When passing a task to another agent:
1. Append to `.hivemind/memory/hm-handoff-queue.md`
2. Update your `.hivemind/memory/agent-states/<role>.state.md`
3. Append decision to `.hivemind/memory/decisions.log`
4. Update MANIFEST handoff counter

Use `/hm-handoff <from> <to> <task>` to automate.

Handoff format:
```
[YYYY-MM-DD HH:MM] FROM: <source> → TO: <target>
TASK: <clear task description>
CONTEXT: <what the next agent needs>
FILES: <relevant files>
MODEL: <recommended tier>
STATUS: [PENDING]
```

---

## 8. Escalation Hierarchy

```
QA / Docs / Data / Mobile / AI-ML
        ↓ (technical blocker)
Backend / Frontend / DevOps / Security
        ↓ (architecture decision)
Lead Dev
        ↓ (strategic decision / conflict)
CTO
        ↓ (out of system scope)
→ User
```

Never skip levels without a justification logged in `decisions.log`.

---

## 9. Available Commands

All commands are registered in `.claude/commands/*.md` (surfaced in the Claude Code `/` dropdown). Full reference in `.hivemind/tools/custom-commands.md`.

### Project lifecycle

| Command | Tier | Function |
|---------|------|----------|
| `/hm-init` | heavy | Onboarding form (CTO posture). Run once at project start |
| `/hm-scaffold <template>` | standard | Generate project structure from template |
| `/hm-sprint` | lite | Generate sprint report |
| `/hm-deploy --env <env>` | standard | Formal QA → Security → DevOps deploy chain |

### Daily work

| Command | Tier | Function |
|---------|------|----------|
| `/hm-status` | lite | Summary of all agents |
| `/hm-standup` | lite | Daily standup across active agents |
| `/hm-focus <agent>` | lite | Scope session to one agent |
| `/hm-handoff <from> <to> <task>` | lite | Formal handoff |
| `/hm-report <agent> <summary>` | lite | Append CHANGELOG entry |
| `/hm-decision <agent> <text>` | lite | Append decisions.log entry |
| `/hm-memo <text>` | lite | Quick one-liner note |
| `/hm-link <ref>` | lite | Resolve ID / #tag / @agent (read-only) |
| `/hm-review <file>` | standard | Structured code review |

### Incidents / emergencies

| Command | Tier | Function |
|---------|------|----------|
| `/hm-blocker <desc>` | lite | Register blocker |
| `/hm-resolve <title>` | lite | Close blocker |
| `/hm-hotfix <desc>` | standard | Fast-track emergency fix |
| `/hm-audit --scope <scope>` | heavy | Security audit |
| `/hm-checkpoint --label <name>` | lite | Snapshot state pre-risky-op |

### Token hygiene

| Command | Tier | Function |
|---------|------|----------|
| `/hm-compact` | lite | Compress old memory into digest |
| `/hm-compress <level>` | lite | Switch session compression level |
| `/hm-digest` | lite | Ultra-compressed activity summary (no writes) |
| `/hm-reset-context` | lite | Drop non-essential context |
| `/hm-route <task>` | lite | Suggest model tier + owning agent |

---

## 10. Multi-Platform Compatibility

HiveMind works with any AI coding tool. Platform instruction files in `platforms/` are distributed to correct project locations by `npx create-hivemind-protocol`.

| Platform | Instruction file | Installed to |
|----------|-----------------|--------------|
| **Claude Code** | `CLAUDE.md` (this file) | auto-loaded |
| **Cursor** | `platforms/cursor/hivemind.mdc` | `.cursor/rules/hivemind.mdc` |
| **Windsurf** | `platforms/windsurf/windsurfrules` | `.windsurfrules` |
| **GitHub Copilot** | `platforms/copilot/copilot-instructions.md` | `.github/copilot-instructions.md` |
| **OpenAI Codex** | `platforms/codex/AGENTS.md` | `AGENTS.md` |
| **Universal** (Aider, Continue, etc.) | `platforms/universal/AI_INSTRUCTIONS.md` | `AI_INSTRUCTIONS.md` |

### Hook-based enforcement (Claude Code only)

`hooks/hivemind-activate.js` (SessionStart) injects critical framework rules into system context — not just document context. Rules persist across all turns. Other platforms rely on their instruction files serving the same role.

Install as plugin:
```bash
claude plugin install Awi-24/HiveMind-Protocol
```

Or wire hooks manually in `~/.claude/settings.json` — see `hooks/` directory for scripts.

- MCP catalog: `.hivemind/tools/mcp-catalog.md`

---

## 11. Reply Language

Set via `/hm-init` or `.hivemind/project.json > communication.reply_language`. Supported: `en`, `pt-BR`, `es`, `fr`, `de`, `ja`.

Compression rules apply regardless of language — the 10 rules are language-agnostic (articles = `a/an/the` in EN, `o/a/os/as/um/uma` in PT, etc.).

Technical terms (code, file paths, framework names, CLI commands) remain in English regardless of reply language.
