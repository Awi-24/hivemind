# Token Railguards

> Rules and patterns to prevent token waste, infinite loops, and runaway AI costs.
> Inspired by [caveman](https://github.com/JuliusBrussee/caveman) — terse like smart caveman. Technical substance stay. Only fluff die.
>
> These rules apply to ALL agents. Violations must be logged in `memory/blockers.md`.

---

## Why This Matters

Token costs cascade in multi-agent systems:
- Verbose output from agent A becomes input to agent B becomes input to agent C
- Each hop multiplies cost: a 1,000-token verbose response × 10 agent hops = 10,000 tokens of overhead
- Output tokens cost ~1.25–6× input tokens depending on the model
- Brevity constraints don't sacrifice quality — they **improve accuracy** by reducing hallucination surface area (see [research](https://github.com/JuliusBrussee/caveman))

Target: **65-75% output token reduction** via compression + **~46% input reduction** via memory compression.

---

## 1. Output Communication Protocol (Caveman Rules)

All agent responses follow these 10 rules. Technical substance is always preserved exactly.

### The 10 Rules

| # | Rule | Bad (wasteful) | Good (terse) |
|---|------|----------------|-------------|
| 1 | **No filler phrases** | "I'll just go ahead and basically fix this" | "Fixed." |
| 2 | **Execute before explaining** | "I'll now read the file to understand..." | [reads file, then reports finding] |
| 3 | **No meta-commentary** | "I'll start by looking at the auth module" | [looks at auth module] |
| 4 | **No preamble** | "Sure! I'd be happy to help you with that." | [does the thing] |
| 5 | **No postamble** | "Let me know if you need anything else!" | [silence] |
| 6 | **No tool announcements** | "I'm now going to run the tests..." | [runs tests] |
| 7 | **Explain only when needed** | Explain every line of obvious code | Explain only non-obvious logic |
| 8 | **Let code speak** | Paraphrase what code does in prose | Show the code |
| 9 | **Errors: fix, don't narrate** | "I see an error occurred. Let me investigate..." | [fixes error] |
| 10 | **Drop hedging** | "It might potentially be possible that..." | "Yes." / "No." / state the fact |

**Response pattern**: `[thing] [action] [reason]. [next step].`

Drop: `a`, `an`, `the`, `just`, `really`, `basically`, `actually`, `simply`, `sure`, `certainly`, `of course`, `I'll`, `Let me`, `going to`, `I think`, `perhaps`, `might`, `could potentially`.

---

## 2. Compression Intensity Levels

Agents select compression level based on context. Configure default in `project.json > communication.default_intensity`.

| Level | Token reduction | Rules |
|-------|----------------|-------|
| **lite** | ~40% | Keep articles; full sentences OK; drop filler only |
| **full** | ~60% | Drop articles; fragments allowed; no pleasantries |
| **ultra** | ~75% | Use abbreviations (DB, auth, cfg, deps); arrows for causality (`→`); max compression |

### When to use each level

```
lite   → human-facing explanations, user-visible output, onboarding
full   → standard agent-to-agent communication (default)
ultra  → internal chains, memory updates, log entries, status checks
```

### Auto-Clarity Exception (mandatory)

**Suspend all compression** for:
- Security warnings (severity HIGH or CRITICAL)
- Irreversible operation confirmations (DROP, DELETE, rm -rf, force push)
- Multi-step sequences where fragment order could cause misunderstanding
- Escalations to the user

Resume compression after the critical section completes.

```
# Example: destructive op requires full clarity
[SECURITY ESCALATION — COMPRESSION SUSPENDED]
This operation will permanently delete the production database.
It cannot be undone. All user data will be lost.
Please confirm explicitly before proceeding.
[COMPRESSION RESUMED]
```

---

## 3. Model Selection (Cost Control)

Always use cheapest model for the job. Refer to `project.json > routing`.

```
Lite  (Haiku)    → Reading, logging, formatting, status, reports
Standard (Sonnet) → Writing code, debugging, API design, tests
Heavy (Opus)     → Architecture, security audits, complex cross-system design
```

**Relative cost ratios** (approximate):
- Lite: 1×
- Standard: ~15×
- Heavy: ~75×

**Never use Heavy when Standard works. Never use Standard when Lite works.**

---

## 4. Memory File Compression (Input Token Reduction)

Every agent session re-reads memory files from disk. A 1,000-token `shared-context.md` × 100 sessions = 100,000 tokens of unnecessary input cost.

**Solution**: Keep memory files in compressed caveman-style prose. ~46% input reduction per session.

### Memory compression rules

When writing to any memory file, apply these:

```
# DROP from memory entries:
- Articles: a, an, the
- Filler: just, really, basically, actually, simply
- Hedging: might, could, possibly, perhaps
- Meta-phrases: "It is worth noting that...", "As mentioned above..."
- Redundant context: don't repeat what's already in the file header

# PRESERVE exactly:
- Code blocks (fenced and indented)
- Inline code (`backtick content`)
- File paths (/src/components/...)
- URLs and links
- Technical terms, library names, API names
- Dates, version numbers, model IDs
- Headings and structural markers
- Bullet points and list structure
```

### Memory write examples

```markdown
# BAD (verbose):
[2026-04-15 14:30] [backend-dev] DECISION: After careful consideration 
and reviewing the existing codebase, I have decided that it would be 
best to use Zod for runtime validation across all of the API boundaries 
because it provides better TypeScript integration | REASON: The current 
approach of manual type guards is leading to inconsistencies

# GOOD (compressed, ~60% fewer tokens):
[2026-04-15 14:30] [backend-dev] DECISION: Use Zod for runtime validation 
at all API boundaries | REASON: Manual type guards → inconsistencies; Zod → 
better TS integration
```

---

## 5. Loop Prevention

### Hard limits
- Max **3 attempts** on same approach → stop, escalate to blockers
- Max **5 iterations** over same file in one session
- Max **3 levels** of agent delegation depth (A → B → C → stop)

### Loop detection — before retrying, check:
1. Is this the exact same approach as last attempt?
2. Is the error different from last time?
3. Do I have new information?

If all NO → stop immediately. Log to `memory/blockers.md`. Escalate.

### Anti-patterns

```
# BAD: blind retry
while not success:
    try_same_thing()

# GOOD: bounded retry with escalation
for attempt in range(3):
    result = try_approach(attempt)
    if result.success: break
    log_failure(attempt, result.error)
else:
    escalate_to_blockers()
```

---

## 6. Context Window Conservation

### Do NOT read unnecessarily
- Don't read file just to confirm existence → use glob/search
- Don't re-read file already read this session → use your context
- Don't read full large files for a single section → use offset/limit
- Don't read test files unless writing or debugging tests
- Don't read config files unless directly relevant

### Do NOT write unnecessarily
- No boilerplate "just in case"
- No comments on code you didn't change
- No fallback handlers for impossible scenarios
- No helper functions for one-time use
- No type annotations on untouched code
- No extra files "for the future"

---

## 7. Session Length Management

When a session is growing long (many tool calls, many iterations):

1. Write state to `memory/agent-states/<role>.state.md` (compressed)
2. Write pending items to `memory/handoff-queue.md`
3. Log progress in `reports/CHANGELOG.md`
4. **End session. Start fresh.**

Long sessions degrade quality and pay for repeated context. Brevity + frequent commits beats verbose marathons.

---

## 8. Batch Operation Protocol

Before bulk ops (mass file edits, large DB queries):

1. Log intent in `memory/decisions.log`
2. Test on single item first
3. Confirm result is correct
4. User confirmation required for 10+ files

---

## 9. Forbidden Patterns (Immediate Stop)

Stop and log to `memory/blockers.md` on any of:

```bash
rm -rf /              # or dangerous rm
DROP DATABASE         # unqualified destructive SQL
git push --force main # force push to main/master
while true; do        # infinite loop
SELECT * FROM big_table  # without LIMIT
```

Full list: `project.json > railguards.forbidden_operations`

---

## 10. Escalation Thresholds

Auto-escalate (don't keep trying) when:
- Same error 3× in a row
- Task in handoff-queue 2+ sessions without progress
- Token usage for single task exceeds `project.json > routing.<tier>.max_tokens`
- Blocker OPEN for 1+ sprint

---

## Quick Reference Card

```
OUTPUT:   terse. no filler. execute first. code > prose. errors → fix.
MODEL:    lite=reads/logs  standard=code  heavy=architecture
LOOP:     3 attempts max → blocker → escalate
MEMORY:   compressed prose. append only. preserve code/paths/URLs.
CONTEXT:  read only what's needed. write only what was asked.
CRITICAL: suspend compression for security + destructive ops.
```
