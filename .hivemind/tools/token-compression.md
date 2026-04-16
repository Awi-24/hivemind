# Token Compression Protocol

> Inspired by [caveman](https://github.com/JuliusBrussee/caveman). Compression reduces input and output tokens while preserving technical substance. The rule: **only fluff dies. Technical content stays exact.**

---

## The 4 Levels

| Level | Output reduction | When to use |
|-------|-----------------:|-------------|
| `normal` | 0% | Onboarding, tutorials, user explanations requiring full clarity |
| `lite` | ~40% | Human-facing technical replies — drop filler, keep sentence structure |
| `heavy` | ~60% | Default agent-to-agent — drop articles, fragments allowed, no pleasantries |
| `ultra` | ~75% | Memory writes, logs, internal agent chains — abbreviations + arrows + maximum density |

Default is set in `.hivemind/project.json > communication.default_intensity`. Override per session with `/compress <level>`.

---

## What always survives (all levels)

These are **never** dropped, regardless of compression:

- Code blocks — verbatim
- File paths — `src/api/auth.ts`
- URLs — `https://example.com/api/v1`
- Technical terms — React, PostgreSQL, JWT, HTTPS, OAuth2
- Library names — express, fastapi, prisma
- Dates — `2026-04-16`
- Version numbers — `14.2.3`, `v1.0.0-beta`
- Model IDs — `claude-opus-4-6`
- Env vars — `DATABASE_URL`, `AWS_REGION`
- Error messages — quoted verbatim
- SQL / shell commands — verbatim

---

## Level 1 — `normal`

**No compression.** Used for:
- First-time user onboarding
- Explaining how HiveMind itself works
- Tutorials and walkthroughs
- Error explanations for beginners
- Anything marked `[normal]` by the user

Full sentences, articles, natural flow. Still avoid pleasantries (`I'd be happy to`, `Of course!`, `Great question!`). Even `normal` drops those.

### Example

> "To add a new agent to your project, edit the `agents.active` array in `.hivemind/project.json` and include the agent's slug. After that, run `/focus <slug>` to verify the agent loads its profile correctly."

---

## Level 2 — `lite` (~40% reduction)

**Trim filler, keep sentences.** Used for human-facing technical output where clarity > density.

### Drop

- Filler: `just`, `really`, `basically`, `actually`, `simply`, `quite`, `pretty much`
- Hedging: `might want to`, `could potentially`, `perhaps`, `I think`
- Pleasantries: `Sure!`, `Of course`, `Certainly`, `Happy to`
- Meta-announcements: `Let me`, `I'll`, `I'm going to`, `Here is`, `What I'll do is`
- Closing filler: `Let me know`, `Hope this helps`, `Feel free to`

### Keep

- Articles (`a`, `an`, `the`)
- Full sentences
- Natural conjunctions (`and`, `but`, `so`)

### Example (same message as `normal`)

> "To add a new agent, edit the `agents.active` array in `.hivemind/project.json` and include the agent's slug. Run `/focus <slug>` to verify the profile loads."

---

## Level 3 — `heavy` (~60% reduction)

**Default agent-to-agent.** Fragments OK. Drop articles. No preamble, no postamble.

### Drop

- Everything from `lite`
- Articles: `a`, `an`, `the` (EN); `o`, `a`, `os`, `as`, `um`, `uma` (PT); etc.
- Auxiliary verbs when clear from context: `is`, `are`, `will be` → collapse
- Subject pronouns when obvious: `I`, `you`, `we` (in imperative/fragment contexts)
- Redundant connectors: `in order to` → `to`, `at this point in time` → `now`

### Keep

- Nouns, verbs, technical terms, all protected content
- Enough structure for unambiguous parsing

### Example (same message)

> "Add agent: edit `agents.active` in `.hivemind/project.json`, include slug. Run `/focus <slug>` — verifies profile loads."

---

## Level 4 — `ultra` (~75% reduction)

**Maximum density.** Abbreviations allowed. Arrows for causality. Minimum viable for unambiguous interpretation.

### Drop

- Everything from `heavy`
- Linking words: `and`, `but`, `so`, `then`, `also` → replace with punctuation or arrows
- Verb endings when context carries tense: `updated` → `upd`, `configuration` → `cfg`
- Explanatory phrasing: collapse to `X: Y` or `X → Y`

### Abbreviation dictionary (canonical)

Use these consistently so other agents can parse:

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

### Arrow semantics

| Symbol | Meaning |
|--------|---------|
| `→` | causes / leads to / handoff |
| `←` | depends on / reads from |
| `↔` | bidirectional / syncs |
| `⚠` | warning / caution |
| `✗` | failed / rejected |
| `✓` | done / approved |
| `∅` | none / empty / idle |

### Example (same message)

> "add agent: edit `agents.active` @ `.hivemind/project.json` + slug → `/focus <slug>` verifies."

### Further ultra examples

Before (heavy):
> "Deployment failed: migration script tried to drop `users.email` column but foreign key on `sessions.user_email` blocks it. Fix: drop FK first, then re-run migration."

After (ultra):
> "deploy✗: mig drops `users.email`, blocked by FK `sessions.user_email`. fix: drop FK → rerun mig."

Before (heavy):
> "Read MANIFEST, confirmed sprint 3 is active, 2 critical blockers open — both owned by security agent. Handing off to security for triage."

After (ultra):
> "MANIFEST: sprint=3, blk=2 crit [owner: sec]. → sec for triage."

---

## Auto-Clarity Exception (mandatory — suspends compression)

Compression **always suspends** for:

- Security warnings: severity = `HIGH` or `CRITICAL`
- Irreversible operations: `DROP`, `DELETE`, `rm -rf`, `git push --force`, `git reset --hard`, amending published commits
- Multi-step sequences with order-sensitive steps (wrong order = data loss / corruption)
- User-facing escalations

Mark the suspension explicitly:
```
[COMPRESSION SUSPENDED — CRITICAL]
<full clarity message here>
[COMPRESSION RESUMED]
```

After the critical section, return to the active compression level.

---

## Memory-file compression (always ultra)

Every write to `.hivemind/memory/*` uses **ultra** compression. This gives ~46% cold-start token savings across all future sessions that read these files.

Files affected:
- `decisions.log`
- `shared-context.md`
- `handoff-queue.md`
- `blockers.md`
- `agent-states/*.state.md`
- `MANIFEST.md`

Preserve exactly: paths, URLs, technical terms, dates, version numbers, model IDs, code blocks, env var names.

---

## Reply language

The level applies regardless of reply language (`en`, `pt-BR`, `es`, `fr`, `de`, `ja`). Articles to drop in non-English:

| Language | Articles to drop (heavy/ultra) |
|----------|-------------------------------|
| EN | a, an, the |
| PT-BR | o, a, os, as, um, uma, uns, umas |
| ES | el, la, los, las, un, una, unos, unas |
| FR | le, la, les, un, une, des |
| DE | der, die, das, ein, eine, einen |
| JA | (no articles — focus on dropping particles that carry no info) |

Technical terms stay in English regardless of reply language.

---

## Verification

When producing output, before sending, self-check:

1. Any `a/an/the` / `o/a/os/as` remaining in heavy/ultra? Drop.
2. Any `just/really/basically` in any level < normal? Drop.
3. Any `Let me` / `I'll` / `Here is` at message start? Drop.
4. Any pleasantry at message end? Drop.
5. Did I protect all file paths, code, version numbers? Verify.
6. Is this a CRITICAL or irreversible op? Suspend compression if yes.

If any check fails → rewrite before sending.

---

## Expected savings (measured baselines)

| Scenario | Baseline | After HiveMind | Savings |
|----------|---------:|---------------:|--------:|
| Cold session start (read memory) | ~2,400 tok | ~1,300 tok | ~46% |
| Agent-to-agent handoff | ~800 tok | ~320 tok | ~60% |
| Standup (12 agents) | ~1,800 tok | ~450 tok | ~75% |
| Decision log entry | ~180 tok | ~45 tok | ~75% |
| Per-session average output | 100% | ~35% | ~65% |

Measured on projects with ~30 decision entries and ~8 active agents. Your mileage varies with project size.
