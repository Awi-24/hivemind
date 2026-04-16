# 14 — FAQ

## General

### Why not just use a single CLAUDE.md with rules?

A single file doesn't solve: persistent memory across sessions, role boundaries between tasks, token compression, traceable decisions with backlinks, or dropdown-integrated commands. HiveMind is the plumbing under the rules.

### Is HiveMind a coding agent?

No. HiveMind tells your AI coding assistant *how* to behave. The assistant (Claude, GPT, etc.) is the runtime.

### Can I use HiveMind on an existing project?

Yes. Drop `.hivemind/`, `.claude/`, and `CLAUDE.md` at your repo root. Your existing code is untouched.

### Does HiveMind replace version control?

No. Memory is complementary to git. Commit `.hivemind/memory/*` alongside your code so history survives across machines.

## Installation

### Where does HiveMind get installed?

Three places at your project root:
- `.hivemind/` — framework files
- `.claude/commands/` — slash commands
- `CLAUDE.md` — behavior protocol

### Can I move `.hivemind/` somewhere else?

Not recommended. CLAUDE.md hardcodes the path. Changing it requires editing CLAUDE.md, `project.json` memory/reports paths, and every command file.

### Do I commit `.hivemind/` to git?

Yes. It's your project's governance and memory. Commit it.

## Memory

### Why do I need MANIFEST?

Without it, every session has to scan every memory file to know the current state. MANIFEST is a self-sufficient snapshot updated on every write — cold sessions read one file instead of ten.

### What if MANIFEST gets out of sync?

Run `/compact --file all`. It rebuilds Link Index / Backlinks / Tag Index from the inline IDs in the memory files.

### Why can't I just use line references?

Line numbers shift whenever an entry is added, a digest is inserted, or a file is reformatted. IDs are immutable. MANIFEST maps `ID → current file:line` so the indirection handles shift for you.

### How big can memory files get before they slow things down?

Compact at ~30 decisions or 30 days old (configurable: `meta.compaction_threshold_days`). After compaction, cold-start cost is roughly O(1) regardless of project age.

## Commands

### Why don't my custom commands appear in the `/` dropdown?

Claude Code reads `.claude/commands/*.md` at the repo root. The file must:
- Have a `---` frontmatter with `description:`
- Be a valid markdown file (no syntax errors at the top)
- Be readable (`.gitignore` must not exclude it)

### Can I run commands from other directories?

`/init`, `/status`, etc. are session-scoped to Claude Code's working directory. Open Claude Code at your project root.

### Can I chain commands?

Yes. Write a wrapper command that calls multiple underlying commands. Example `.claude/commands/day-start.md`:

```markdown
---
description: Morning routine — status + standup + pending handoffs
---
Run /status, then /standup, then /link @<current-agent>.
```

### How do I pass arguments?

Use `$ARGUMENTS` in the command file. Claude Code substitutes it at runtime.

## Token Usage

### How much do the 4 compression levels actually save?

Measured on a mid-sized project:

| Scenario | Baseline | HiveMind |
|----------|---------:|---------:|
| Cold session start | ~2,400 tok | ~1,300 tok |
| Agent-to-agent handoff | ~800 tok | ~320 tok |
| Daily standup | ~1,800 tok | ~450 tok |
| Per-session average | 100% | ~35% |

### Ultra abbreviations confuse me

Use `heavy` as default. Only the memory files and internal chains use ultra. Your user-facing output uses heavy or lite.

### Can I disable compression entirely?

Set `communication.default_intensity = "normal"`. All responses stay full-length. Internal memory writes still use ultra for efficiency.

## Agents

### Do I need all 12 agents?

No. Activate only what your project needs. CTO and Lead Dev are always active; the rest are opt-in via `project.json > agents.active`.

### What if an agent starts writing outside its scope?

Code boundaries are soft (markdown-defined). The agent should ask for a handoff instead. If it doesn't:
1. Reject the change in review
2. Log a `DEC-*` correcting the behavior
3. Tighten the ownership rule in `code-boundaries.md`

### Can I make a custom agent?

Yes. See `docs/12-customization.md §1`.

### What if two agents disagree?

Escalate to Lead Dev. If Lead Dev can't resolve, CTO. If CTO escalates, user decides. Every escalation logs a `DEC-*`.

## Linking

### What happens to IDs after compaction?

They survive. The entry body moves into a `[DIGEST]` block; the ID stays referenced in MANIFEST Link Index with `Status: archived, Anchor: DIGEST`. Backlinks still resolve.

### Can I reuse an ID?

No. IDs are immutable. If you need to "re-decide" something, create a new `DEC-*` with `SUPERSEDES: [[OLD-ID]]`.

### Can I rename a tag?

Not safely — it's tracked in MANIFEST Tag Index and referenced inline in entries. Better: create the new tag, stop using the old one, and let compaction eventually retire it.

### Why require at least one tag on every entry?

Without tags, the Tag Index is useless and `/link #<domain>` returns nothing. One tag minimum is the cost of navigability.

## Railguards

### The 3-attempt loop limit is too aggressive

Increase in `project.json > railguards.max_loop_depth`. Log the change via `/decision`.

### My agent keeps asking for destructive-op confirmation

Switch to `railguards.destructive_mode = "relaxed"`. Confirmation is then required only in production contexts.

### Can I add custom forbidden operations?

Yes. Append to `railguards.forbidden_operations` in `project.json`.

## Multi-Model

### Does this work with GPT?

Yes — see `docs/13-multi-model.md`. You need an orchestrator to enforce tier routing since OpenAI's API doesn't natively honor `[MODEL: ...]` hints.

### Does this work with local models?

Yes, with caveats:
- Use hosted small models (Haiku/gpt-4o-mini) for Tier 0/1 if local ones struggle with MANIFEST atomicity
- Enable aggressive compaction
- Use `ultra` as default compression

### Can I mix providers across tiers?

Yes. Example:
```json
"lite":     { "model": "claude-haiku-4-5-20251001" },
"standard": { "model": "gpt-4o" },
"heavy":    { "model": "o1" }
```

Your orchestrator has to know how to dispatch to each provider.

## Troubleshooting

### `/init` creates `project.json` but it's empty

The agent skipped the form. Force re-run: delete `project.json`, run `/init` again, answer each question explicitly.

### `/status` shows `my-project` after init

Init didn't write. Check:
1. `.hivemind/project.json > meta.name` — is it still `my-project`?
2. `.hivemind/memory/decisions.log` — is there an init `DEC-*`?

If both are unchanged, re-run `/init` with explicit answers.

### `/link <ID>` returns "not found"

MANIFEST may be stale. Run `/compact --file all` to rebuild the index.

### The `/` dropdown doesn't show my commands

- Claude Code must be started at the repo root
- `.claude/commands/*.md` must have valid frontmatter (`---\ndescription: ...\n---`)
- Restart Claude Code to force re-scan
