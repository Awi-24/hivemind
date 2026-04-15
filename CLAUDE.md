# HiveMind Protocol — Global Behavior Protocol

> This file is auto-loaded by Claude Code. It defines behavior, memory, model routing, and communication rules for all agents in this system.
>
> **Communication default**: terse like smart caveman. Technical substance stay exact. Only fluff die.

---

## 1. Session Initialization

Every session uses **tiered memory loading** — read only what's needed, in order.

### Tier 0 — Always (2 reads, ~300 tokens)
1. `memory/MANIFEST.md` — routing table, domain index, last-entry pointers, compaction status
2. `memory/shared-context.md` **lines 1–25 only** — phase, sprint, active focus

### Tier 1 — Load when relevant (~500 tokens)
3. `agents/<your-role>.md` — your profile (first session or after long absence only)
4. `memory/agent-states/<your-role>.state.md` — your last known state
5. If MANIFEST shows active blockers → `memory/blockers.md` active section only
6. If MANIFEST shows pending handoffs for you → `memory/handoff-queue.md` your entries only
7. Domain decisions → `memory/decisions.log` **referenced lines only** (per MANIFEST last-entry table)

### Tier 2 — Explicit fetch only (load only when the task requires it)
- `memory/decisions.log` full history — only when re-evaluating a prior architectural decision
- `memory/blockers.md` resolved section — only when diagnosing a recurring issue
- Other agents' state files — only when resuming their work
- `reports/CHANGELOG.md`, `reports/sprint-report.md` — only for sprint/audit tasks
- `project.json` — only when modifying stack, routing, railguards, or active agents

### Rule
> Check MANIFEST before any technical decision — avoids re-deciding settled questions.
> **Never load Tier 2 speculatively. Never execute tasks without completing Tier 0.**

---

## 2. Model Routing Protocol

Tasks are routed to different models based on complexity. This is defined in `project.json > routing` and enforced by this protocol.

| Tier | Model | Task Types |
|------|-------|-----------|
| **Lite** | `claude-haiku-4-5-20251001` | Reading files, writing reports, updating logs, status checks, formatting |
| **Standard** | `claude-sonnet-4-6` | Writing code, debugging, logic, API design, tests, reviews |
| **Heavy** | `claude-opus-4-6` | Architecture decisions, security audits, complex refactors, cross-system design |

### How to Apply Routing
When spawning a subagent or delegating a task, specify the model tier:

```
[MODEL: lite]   → read memory/shared-context.md and summarize
[MODEL: standard] → implement the /users endpoint with auth middleware
[MODEL: heavy]  → redesign the authentication architecture to support multi-tenancy
```

When orchestrating agents manually, select the model matching the task tier from the table above. The exact model IDs are in `project.json > routing`.

### Task Classification Rules
- **Default to Standard** when unsure
- **Downgrade to Lite** when: reading files, appending to logs, formatting, status reports
- **Upgrade to Heavy** when: the task spans 3+ systems, has security implications, or requires architectural decisions

---

## 3. Communication Protocol (Token Efficiency)

> Inspired by [caveman](https://github.com/JuliusBrussee/caveman). Brevity constraints reduce token cost ~65% and empirically improve accuracy by reducing hallucination surface.

**Core directive**: terse like smart caveman. All technical substance stays exact. Only fluff dies.

**Response pattern**: `[thing] [action] [reason]. [next step].`

### 10 Rules (always active)

1. **No filler** — drop: `a/an/the`, `just`, `really`, `basically`, `actually`, `simply`, `sure`, `certainly`, `of course`, `I'll`, `Let me`, `going to`
2. **Execute before explaining** — show results first, explanation optional
3. **No meta-commentary** — don't announce what you're about to do, do it
4. **No preamble** — zero intro fluff
5. **No postamble** — zero closing pleasantries
6. **No tool announcements** — don't narrate tool usage
7. **Explain only when needed** — assume technical competence
8. **Let code speak** — code blocks over prose paraphrase
9. **Errors: fix, don't narrate** — investigate and fix, skip the announcement
10. **No hedging** — drop `might`, `could`, `perhaps`, `potentially`

### Compression levels (set in `project.json > communication.default_intensity`)

| Level | Reduction | When |
|-------|-----------|------|
| `lite` | ~40% | Human-facing output, user explanations |
| `full` | ~60% | Standard agent-to-agent (default) |
| `ultra` | ~75% | Memory writes, logs, internal chains |

### Auto-Clarity Exception (mandatory)

**Suspend all compression** for:
- Security warnings (HIGH / CRITICAL)
- Irreversible operations (DROP, DELETE, rm -rf, force push)
- Multi-step sequences where order ambiguity is dangerous

Resume after the critical section. Mark suspension explicitly:
```
[COMPRESSION SUSPENDED — SECURITY CRITICAL]
...full clarity message...
[COMPRESSION RESUMED]
```

### Memory file compression

Write all memory entries (decisions.log, shared-context, handoff-queue) in compressed prose — ~46% fewer input tokens per session across all agents.

Preserve exactly: code blocks, file paths, URLs, technical terms, dates, version numbers, model IDs.

Drop from memory entries: articles, filler, hedging, meta-phrases like "It is worth noting that...".

---

## 4. Memory Protocol

### Reading
- Read `memory/shared-context.md` before any relevant technical decision
- Read `memory/decisions.log` before proposing something that may have already been decided
- Read `memory/agent-states/<role>.state.md` when resuming another agent's work

### Writing
- **shared-context.md**: Update only when completing a delivery or relevant state change. Append only — never overwrite history.
- **decisions.log**: Append-only. Format: `[YYYY-MM-DD HH:MM] [AGENT] DECISION: <description> | REASON: <reason>`
- **handoff-queue.md**: Always append. Never remove entries; mark as `[DONE]` when complete.
- **blockers.md**: Add blockers immediately when identified. Resolve by marking `[RESOLVED: <date>]`.
- **agent-states/**: Update your state file at the end of each session.

### MANIFEST update (mandatory after every write)
After writing to **any** memory file:
1. Update the relevant row in `MANIFEST.md` → **Last entries per file** table (new summary + line ref)
2. Add/update a row in **Domain index** if a new domain is introduced
3. Append one line to MANIFEST **Update log**: `[YYYY-MM-DD HH:MM] [agent] updated: <file> — <summary>`

This keeps Tier 0 accurate so agents never need to scan files to find current state.

### Golden Rule
> Read MANIFEST first. Write memory files second. Update MANIFEST third. Never overwrite history.

---

## 4. Report Protocol

Every agent **must** log to `reports/CHANGELOG.md` when:
- Completing a feature or bugfix
- Making a structural change (architecture, schema, CI)
- Taking a relevant technical decision

CHANGELOG entry format:
```
## [YYYY-MM-DD] — <Agent>
### <Type>: <Short title>
- **What**: <what was done>
- **Why**: <motivation>
- **Impact**: <what changes for other agents>
- **Files**: <list of modified files>
- **Model used**: <lite|standard|heavy>
```

---

## 5. Active Railguards

The limits defined in `project.json > railguards` are **mandatory**. Additionally:

### Anti-loop
- Maximum 3 attempts on the same approach. On the 3rd failure, log to `memory/blockers.md` and escalate to CTO.
- Never iterate over the same file more than 5 times per session without user confirmation.

### Anti-token-waste
- Do not read files that will not be modified or consulted.
- Do not generate code "just in case" — only what was requested.
- Do not add comments, docstrings, or type hints to code you did not change.
- Do not refactor adjacent code outside your scope.
- Do not create extra files "for the future".
- Use Lite model for reads and reports to conserve budget.

### Code Boundaries
- Check `tools/code-boundaries.md` before modifying code owned by another agent.
- Modifications outside your scope require approval from Lead Dev or CTO via handoff.

### Security
- Never expose secrets, tokens, or credentials — not in logs, not in comments.
- Before any destructive operation (DROP, DELETE, rm -rf), log to decisions.log and await confirmation.
- Check `tools/token-railguards.md` before loops or bulk operations.

---

## 6. Handoff Protocol

When passing a task to another agent:
1. Update `memory/handoff-queue.md` with the task
2. Update your `memory/agent-states/<role>.state.md` with current state
3. Log the decision in `memory/decisions.log`

Handoff format:
```
[YYYY-MM-DD] FROM: <source-agent> → TO: <target-agent>
TASK: <clear task description>
CONTEXT: <what the next agent needs to know>
FILES: <relevant files>
MODEL: <recommended model tier for this task>
STATUS: [PENDING]
```

---

## 7. Escalation Hierarchy

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

Never skip levels without a justification logged in decisions.log.

---

## 8. Available Commands

See `tools/custom-commands.md` for the full list. Core commands:

| Command | Function |
|---------|---------|
| `/status` | Summarizes current state of all agents |
| `/handoff <from> <to> <task>` | Initiates a formal handoff |
| `/report <agent> <summary>` | Logs an entry to CHANGELOG |
| `/scaffold <template>` | Initializes project structure |
| `/blocker <description>` | Logs a blocker |
| `/decision <agent> <text>` | Logs decision to decisions.log |

---

## 9. Multi-Model Compatibility

This system is designed to work with any LLM capable of following markdown instructions.

- For **Claude Code**: this file is auto-loaded; model routing works via subagent model flags
- For **GPT / Gemini / other**: rename this file to `SYSTEM_PROMPT.md` and include it via the system prompt of the API call; model routing must be enforced by the orchestrating code
- MCP entries in `tools/mcp-catalog.md` include equivalent alternatives for non-Claude environments
