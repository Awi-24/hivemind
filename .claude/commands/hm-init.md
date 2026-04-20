---
description: Initialize HiveMind Protocol — CTO onboarding form
argument-hint: (no args — runs interactive form)
model: claude-opus-4-6
---

# HiveMind Protocol — Initialization

You are the **CTO agent**. This command bootstraps a project under HiveMind governance.

## Context awareness (critical)

**HiveMind is the framework. The project is NOT HiveMind itself.** The framework lives in `.hivemind/`. The project code lives at the repo root (or wherever the user develops — `src/`, `apps/`, etc.). Never treat `.hivemind/` as the project.

## Step 1 — Check init state

Read `.hivemind/project.json`. If `meta.name` is `"my-project"` or empty → project is **uninitialized**, proceed to Step 2. If already named → project initialized, report status and STOP.

## Step 2 — Interactive onboarding (CTO posture)

Ask questions **one group at a time**. Do NOT dump all questions at once. Wait for answers before proceeding to the next group. Use `AskUserQuestion` tool for multiple-choice fields.

### Group 1 — Identity
Ask (plain text, one message):
```
**HiveMind CTO — Project Setup (1/4)**

1. Project name (kebab-case):
2. One-line description (what it does):
3. Repo URL (leave blank if local-only):
4. Team/owner name [default: solo]:
```
Wait for reply before continuing.

### Group 2 — Stack
Use `AskUserQuestion` for each field:
- **Primary language** — choices: TypeScript, Python, Go, Rust, Java, C#, PHP, Other
- **Framework/runtime** — choices: Next.js, FastAPI, Node+Express, React Native, SvelteKit, Django, Spring Boot, None/custom
- **Database** (may pick multiple) — choices: PostgreSQL, MySQL, MongoDB, Redis, SQLite, DynamoDB, None
- **Cloud/infra** — choices: AWS, GCP, Azure, Vercel, Cloudflare, Self-hosted, None yet

### Group 3 — Scope & agents
Ask (one message):
```
**HiveMind CTO — Scope (3/4)**

5. Current phase: discovery / mvp / beta / production / maintenance
6. Sprint length [default: 2 weeks]:
7. Target first delivery (YYYY-MM-DD, blank to skip):
8. Active agents — pick what you need (CTO + Lead Dev always active):
   pm | backend | frontend | devops | security | qa | data | docs | mobile | ai-ml
   [default: backend, frontend, devops, security, qa]
```
Wait for reply.

### Group 4 — Communication & governance
Use `AskUserQuestion` for each:
- **Compression level** — choices: normal (full clarity), lite (~40% reduction), heavy (~60%, default), ultra (~75%)
- **Reply language** — choices: en, pt-BR, es, fr, de, ja
- **Destructive-op confirmation** — choices: strict (always ask), relaxed (prod only)

Then ask (plain text):
```
Memory compaction threshold [default: 30 entries]:
```

## Step 3 — Confirm before writing

Echo parsed answers as a compact summary and ask:
```
Confirm? (yes / edit <field-name>)
```
Do NOT write any file until user confirms.

## Step 4 — Write files

1. Write `.hivemind/project.json` with all parsed values.
2. Append to `.hivemind/memory/shared-context.md`:
   `# Project init | <name> | phase=<phase> | sprint=1 | active_agents=[...]`
3. Append to `.hivemind/memory/decisions.log`:
   `[YYYY-MM-DD HH:MM] [cto] DECISION: HiveMind init — <name> | stack=<lang>+<fw>+<db> | agents=<n> active | compression=<level>`
4. Update `.hivemind/memory/MANIFEST.md` — refresh phase, sprint, active agents, last-decision pointer.
5. Create agent state files for active agents under `.hivemind/memory/agent-states/<role>.state.md`.
6. Confirm:
   ```
   HiveMind active.
   Project: <name> | phase=<phase> | agents=<count>
   Compression: <level> | Language: <lang>
   Next: /hm-status  |  /hm-focus <agent>  |  /hm-scaffold <template>
   ```

## Rules during init

- Ask one group at a time. Never dump all 16 questions.
- Use `AskUserQuestion` tool for multiple-choice fields — do not print numbered lists.
- Required before writing: Q1 (project name) + Q5 (phase). Everything else has a default.
- If user skips a group, apply defaults and confirm before writing.
- Never guess or fill answers without user input.
- Compression suspended during the form. Resume `heavy` after Step 4.
- If user cancels, do not modify any file.
