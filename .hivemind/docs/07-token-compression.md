# 7 — Token Compression

Full machine-readable spec: `.hivemind/tools/token-compression.md`. This document is the human-readable companion.

## Why

In multi-agent systems, costs cascade: verbose output from agent A becomes input to agent B. Compression attacks both sides — output density and input size. Measured baseline: ~65% token reduction on output, ~46% on input (memory files).

Beyond cost, compression improves accuracy: shorter outputs have smaller hallucination surfaces.

## The 4 Levels

| Level | Output reduction | When |
|-------|-----------------:|------|
| `normal` | 0% | Onboarding, tutorials, user-facing in depth |
| `lite` | ~40% | Human-facing technical — drop filler, keep sentences |
| `heavy` | ~60% | **Default** — agent-to-agent, drop articles, fragments OK |
| `ultra` | ~75% | Memory writes, logs, internal chains — abbreviations + arrows |

Set default in `.hivemind/project.json > communication.default_intensity`. Override per session with `/compress <level>`.

## Always Protected (all levels)

Never dropped regardless of compression:

- Code blocks (verbatim)
- File paths (`src/api/auth.ts`)
- URLs (`https://example.com/api/v1`)
- Technical terms (React, PostgreSQL, JWT, HTTPS, OAuth2)
- Library names (`express`, `fastapi`, `prisma`)
- Dates (`2026-04-16`)
- Version numbers (`14.2.3`, `v1.0.0-beta`)
- Model IDs (`claude-opus-4-6`)
- Env vars (`DATABASE_URL`, `AWS_REGION`)
- Error messages (quoted verbatim)
- SQL / shell commands (verbatim)

## Side-by-Side Example

Same message, four levels:

### `normal`

> "To add a new agent to your project, edit the `agents.active` array in `.hivemind/project.json` and include the agent's slug. After that, run `/focus <slug>` to verify the agent loads its profile correctly."

### `lite`

> "To add a new agent, edit the `agents.active` array in `.hivemind/project.json` and include the agent's slug. Run `/focus <slug>` to verify the profile loads."

### `heavy`

> "Add agent: edit `agents.active` in `.hivemind/project.json`, include slug. Run `/focus <slug>` — verifies profile loads."

### `ultra`

> "add agent: edit `agents.active` @ `.hivemind/project.json` + slug → `/focus <slug>` verifies."

## Drop Rules by Level

### `lite` drops

- Filler: `just`, `really`, `basically`, `actually`, `simply`, `quite`
- Hedging: `might want to`, `could potentially`, `perhaps`, `I think`
- Pleasantries: `Sure!`, `Of course`, `Certainly`, `Happy to`
- Meta-announcements: `Let me`, `I'll`, `I'm going to`, `Here is`, `What I'll do is`
- Closing filler: `Let me know`, `Hope this helps`, `Feel free to`

### `heavy` drops (everything from lite, plus)

- Articles: `a`, `an`, `the`
- Auxiliary verbs when clear: `is`, `are`, `will be`
- Subject pronouns in imperative/fragment contexts: `I`, `you`, `we`
- Redundant connectors: `in order to` → `to`, `at this point in time` → `now`

### `ultra` drops (everything from heavy, plus)

- Linking words: `and`, `but`, `so`, `then`, `also` → punctuation or arrows
- Verb endings when context carries tense
- Explanatory phrasing: collapse to `X: Y` or `X → Y`

## Ultra Abbreviation Dictionary

| Full | Ultra |
|------|-------|
| database | db |
| authentication | auth |
| authorization | authz |
| configuration | cfg |
| environment | env |
| dependencies | deps |
| infrastructure | infra |
| repository | repo |
| directory | dir |
| function | fn |
| parameter | param |
| argument | arg |
| response | resp |
| request | req |
| variable | var |
| production | prod |
| staging | stg |
| development | dev |
| migration | mig |
| credentials | creds |
| documentation | docs |
| performance | perf |
| operation | op |
| transaction | txn |
| application | app |
| component | cmp |
| message | msg |
| reference | ref |
| implementation | impl |
| temporary | tmp |
| notification | notif |
| validation | valid |
| session | sess |

## Arrow Semantics (ultra)

| Symbol | Meaning |
|--------|---------|
| `→` | causes / leads to / handoff |
| `←` | depends on / reads from |
| `↔` | bidirectional / syncs |
| `⚠` | warning / caution |
| `✗` | failed / rejected |
| `✓` | done / approved |
| `∅` | none / empty / idle |

## Ultra Example — Before and After

**Before (heavy):**

> "Deployment failed: migration script tried to drop `users.email` column but foreign key on `sessions.user_email` blocks it. Fix: drop FK first, then re-run migration."

**After (ultra):**

> "deploy✗: mig drops `users.email`, blocked by FK `sessions.user_email`. fix: drop FK → rerun mig."

## Auto-Clarity Exception (mandatory)

Compression **always suspends** for:

- Security warnings: severity HIGH or CRITICAL
- Irreversible operations: `DROP`, `DELETE`, `rm -rf`, `git push --force`, `git reset --hard`, amending published commits
- Multi-step sequences with order-sensitive steps (wrong order = data loss / corruption)
- User-facing escalations

Mark explicitly:

```
[COMPRESSION SUSPENDED — CRITICAL]
<full clarity message>
[COMPRESSION RESUMED]
```

After the critical section, return to the active compression level.

## Memory-File Compression (always ultra)

Every write to `.hivemind/memory/*` uses **ultra**. This gives ~46% cold-start savings across all future sessions that read these files.

Affected: `decisions.log`, `shared-context.md`, `handoff-queue.md`, `blockers.md`, `agent-states/*.state.md`, `MANIFEST.md`.

## Per-Language Rules

Compression applies regardless of reply language. Articles to drop in each language:

| Language | Articles to drop (heavy / ultra) |
|----------|---------------------------------|
| `en` | a, an, the |
| `pt-BR` | o, a, os, as, um, uma, uns, umas |
| `es` | el, la, los, las, un, una, unos, unas |
| `fr` | le, la, les, un, une, des |
| `de` | der, die, das, ein, eine, einen |
| `ja` | (no articles — drop info-less particles instead) |

Technical terms always remain in English regardless of reply language.

## Self-Check Before Sending

Before emitting output, the agent self-checks:

1. Any `a/an/the` / `o/a/os/as` remaining in heavy/ultra? → drop
2. Any `just/really/basically` in any level < normal? → drop
3. Any `Let me` / `I'll` / `Here is` at start? → drop
4. Any pleasantry at end? → drop
5. Did I protect all paths, code, version numbers? → verify
6. Is this CRITICAL or irreversible? → suspend compression

Failed check → rewrite before sending.

## Measured Impact

| Scenario | Baseline | HiveMind | Savings |
|----------|---------:|---------:|--------:|
| Cold session start (read memory) | ~2,400 tok | ~1,300 tok | ~46% |
| Agent-to-agent handoff | ~800 tok | ~320 tok | ~60% |
| Standup (12 agents) | ~1,800 tok | ~450 tok | ~75% |
| Decision log entry | ~180 tok | ~45 tok | ~75% |
| Per-session average output | 100% | ~35% | ~65% |

Measured on projects with ~30 decision entries and ~8 active agents. Scales with project size.

## Switching Levels Mid-Session

```
/compress lite    → human-facing work, extended clarity
/compress heavy   → back to default
/compress ultra   → writing a long log block or generating memory entries
```

Does not modify `project.json` — session-scoped override only.

## Anti-patterns

- Using ultra for user-facing replies → reads as unreadable jargon
- Using normal for internal logs → wastes tokens, drowns MANIFEST
- Ignoring auto-clarity suspension → users miss critical warnings
- Making up abbreviations not in the dictionary → other agents can't parse
