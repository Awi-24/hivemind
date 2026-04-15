# Custom Commands

> All commands below are available to every agent. They standardize common operations and ensure consistent memory/report updates.
> In Claude Code, prefix with `/` in the chat. For other models, treat these as structured instruction patterns.

---

## Core Commands

### `/status`
**Model tier**: lite
**Description**: Print a summary of the current state of all active agents.

**What it does**:
1. Read `memory/shared-context.md`
2. Read `memory/blockers.md`
3. Read `memory/handoff-queue.md`
4. Read each active agent's state from `memory/agent-states/`
5. Output a structured summary

**Output format**:
```
=== HiveMind Protocol Status — YYYY-MM-DD ===

PROJECT: <name> | PHASE: <phase> | SPRINT: <n>

ACTIVE AGENTS:
  cto          → <current focus or IDLE>
  lead-dev     → <current focus or IDLE>
  backend-dev  → <current focus or IDLE>
  ...

BLOCKERS: <count> active
  [CRITICAL] <title> — owned by <agent>

PENDING HANDOFFS: <count>
  <from> → <to>: <task summary>

LAST DECISION: [YYYY-MM-DD] <summary>
```

---

### `/handoff <from-agent> <to-agent> <task-description>`
**Model tier**: lite
**Description**: Formalize a task transfer between agents.

**What it does**:
1. Append to `memory/handoff-queue.md` with the structured format
2. Update source agent's state file with handoff note
3. Log in `memory/decisions.log`

**Example**:
```
/handoff backend-dev devops "Deploy the new /auth service to staging with env vars DB_HOST and AUTH_SECRET_KEY"
```

---

### `/report <agent> <summary>`
**Model tier**: lite
**Description**: Append an entry to `reports/CHANGELOG.md`.

**What it does**:
1. Append a CHANGELOG entry with today's date, agent name, and summary
2. Update `memory/shared-context.md` recent changes section

**Example**:
```
/report backend-dev "Added JWT refresh token endpoint POST /auth/refresh — updates auth flow, see src/api/auth.ts"
```

---

### `/blocker <description> [--owner <agent>] [--severity <critical|high|medium|low>]`
**Model tier**: lite
**Description**: Register a blocker in `memory/blockers.md`.

**What it does**:
1. Append blocker entry with date, description, severity, and owner
2. If severity is critical — also log in `memory/decisions.log` with `[BLOCKER-CRITICAL]` tag

**Example**:
```
/blocker "PostgreSQL migration fails on staging — column type mismatch in users table" --owner backend-dev --severity high
```

---

### `/decision <agent> <decision-text>`
**Model tier**: lite
**Description**: Append a decision to `memory/decisions.log`.

**Example**:
```
/decision lead-dev "Use Zod for runtime validation across all API boundaries — replaces manual type guards"
```

---

### `/scaffold <template> [--name <project-name>] [--out <directory>]`
**Model tier**: standard
**Description**: Generate a project scaffold from a template in `tools/scaffold-templates/`.

**Available templates**:
- `nextjs` — Next.js 14+ App Router with TypeScript
- `fastapi` — FastAPI with SQLAlchemy and Alembic
- `node-api` — Node.js + Express + TypeScript
- `react-native` — React Native with Expo
- `monorepo` — Turborepo monorepo with apps/ and packages/

**What it does**:
1. Read the template from `tools/scaffold-templates/<template>.md`
2. Generate the directory structure and base files
3. Log the scaffold action in `memory/decisions.log`

**Example**:
```
/scaffold nextjs --name my-app --out ./apps/web
```

---

### `/audit [--agent <agent>] [--scope <files|deps|secrets|all>]`
**Model tier**: heavy
**Description**: Trigger a security audit by the Security agent.

**What it does**:
1. Delegate to Security agent with specified scope
2. Log audit initiation in `reports/audit-log.md`
3. Results appended to `reports/audit-log.md`

**Example**:
```
/audit --scope secrets
/audit --agent backend-dev --scope files
```

---

### `/sprint [--week <YYYY-Www>]`
**Model tier**: lite
**Description**: Generate or update the sprint report in `reports/sprint-report.md`.

**What it does**:
1. Read `reports/CHANGELOG.md` for the sprint period
2. Read `memory/blockers.md` for resolved/open items
3. Read `memory/handoff-queue.md` for completed handoffs
4. Write a structured sprint summary

---

### `/init`
**Model tier**: standard
**Description**: Initialize a new project using this HiveMind Protocol template.

**What it does**:
1. Prompt for project details (name, stack, active agents)
2. Fill in `project.json` with provided values
3. Update `memory/shared-context.md` with project context
4. Log initialization in `memory/decisions.log`
5. Create initial sprint report structure

**Run this once at project start.**

---

---

### `/focus <agent>`
**Model tier**: lite
**Description**: Scope the current session to a specific agent — reads that agent's profile and state, sets context for the session.

**What it does**:
1. Read `agents/<agent>.md`
2. Read `memory/agent-states/<agent>.state.md`
3. Read `memory/shared-context.md` filtered to that agent's domains
4. Output focused session header confirming active agent and current task

**Example**:
```
/focus backend-dev
/focus security
```

---

### `/standup`
**Model tier**: lite
**Description**: Generate a daily standup summary across all active agents — replaces manual reads of every state file.

**What it does**:
1. Read all `memory/agent-states/*.state.md` files
2. Read `memory/blockers.md` for active blockers
3. Read `memory/handoff-queue.md` for pending items
4. Output structured standup per agent: yesterday / today / blockers

**Output format**:
```
=== HiveMind Protocol Standup — YYYY-MM-DD ===

<agent>
  DONE:     <last completed task>
  TODAY:    <current focus>
  BLOCKED:  <blocker or —>

PENDING HANDOFFS: <count>
ACTIVE BLOCKERS:  <count>
```

---

### `/checkpoint [--label <name>]`
**Model tier**: lite
**Description**: Snapshot current state before a risky operation — saves agent state, decisions, and context so the session can be resumed if something goes wrong.

**What it does**:
1. Write current task context to `memory/agent-states/<active-agent>.state.md`
2. Append checkpoint entry to `memory/decisions.log` with label and timestamp
3. Append summary to `memory/shared-context.md`
4. Confirm checkpoint saved with label

**Example**:
```
/checkpoint --label before-db-migration
/checkpoint --label pre-auth-refactor
```

---

### `/review <file> [--agent <agent>] [--scope <logic|security|style|all>]`
**Model tier**: standard
**Description**: Request a structured code review of a file by the appropriate agent.

**What it does**:
1. Read the target file
2. Check `tools/code-boundaries.md` to identify the owning agent (or use `--agent` override)
3. Review against: logic correctness, security patterns, style, and test coverage
4. Output findings grouped by severity; append summary to `reports/audit-log.md` if security findings exist

**Example**:
```
/review src/api/auth.ts
/review src/db/migrations/004_users.sql --scope security
/review src/components/LoginForm.tsx --agent frontend-dev
```

---

### `/hotfix <description> [--severity <critical|high>]`
**Model tier**: standard
**Description**: Emergency fix workflow — fast-tracks a fix through QA → Security → DevOps with minimal ceremony.

**What it does**:
1. Log blocker in `memory/blockers.md` with `[HOTFIX]` tag and severity
2. Append entry to `memory/decisions.log` documenting the hotfix decision
3. Create handoff in `memory/handoff-queue.md`: current agent → QA → Security → DevOps
4. Output the hotfix checklist: fix → test → security-check → deploy

**Example**:
```
/hotfix "Auth tokens not expiring on logout" --severity critical
/hotfix "XSS in comment field — unescaped user input" --severity critical
```

---

### `/resolve <blocker-title> [--resolution <text>]`
**Model tier**: lite
**Description**: Close an active blocker in `memory/blockers.md`.

**What it does**:
1. Find the matching blocker entry in `memory/blockers.md`
2. Mark it `[RESOLVED: YYYY-MM-DD by <agent>]`
3. Append resolution note
4. Log in `memory/decisions.log` with `[BLOCKER-RESOLVED]` tag
5. Move entry to the Resolved Blockers section

**Example**:
```
/resolve "PostgreSQL migration fails on staging" --resolution "Column type cast added in migration 005"
/resolve "Auth tokens not expiring on logout"
```

---

### `/deploy [--env <staging|production>] [--agent <agent>]`
**Model tier**: standard
**Description**: Formalize the QA → Security → DevOps deployment handoff chain.

**What it does**:
1. Verify no open `[CRITICAL]` or `[HIGH]` blockers in `memory/blockers.md`
2. Create sequential handoffs in `memory/handoff-queue.md`:
   - current agent → QA: "Verify build and run smoke tests for <env> deploy"
   - QA → Security: "Security sign-off for <env> deploy"
   - Security → DevOps: "Deploy to <env> — QA and Security approved"
3. Append deploy initiation to `memory/decisions.log`
4. Log entry in `reports/CHANGELOG.md`

**Example**:
```
/deploy --env staging
/deploy --env production --agent lead-dev
```

---

### `/compact [--older-than <days>] [--file <decisions|blockers|all>]`
**Model tier**: lite
**Description**: Compress memory entries older than N days into a digest block — reduces cold-start token cost as logs grow.

**What it does**:
1. Read target file(s) (default: `decisions.log` + `blockers.md` resolved section)
2. Group entries older than `--older-than` (default: 30 days) by domain/topic
3. Write a compressed `[DIGEST]` block replacing those entries at the top of the file
4. Keep all entries newer than the threshold inline and untouched
5. Update `memory/MANIFEST.md` compaction status table (entries count, digest range, last compact date)
6. Append compact action to `decisions.log`

**Digest format written into the file**:
```
[DIGEST: YYYY-MM-DD → YYYY-MM-DD | compacted by <agent> on YYYY-MM-DD]
auth: JWT chosen over sessions (Mar 12). Refresh endpoint added (Mar 28).
database: Postgres + Redis selected (Jan 15). Alembic for migrations (Feb 3).
infra: Docker Compose for local dev (Feb 20). K8s for staging/prod (Mar 1).
[END DIGEST]
```

**When to run**: when `decisions.log` exceeds ~30 entries, or MANIFEST compaction status shows `last compact: never` and the project is past Sprint 2.

**Example**:
```
/compact
/compact --older-than 14
/compact --older-than 60 --file all
```

---

## Adding Custom Commands

To add a project-specific command:

1. Add the command definition to this file following the format above
2. Add it to `project.json > commands`
3. Notify all agents via `memory/shared-context.md`

```
### `/my-command <args>`
**Model tier**: <lite|standard|heavy>
**Description**: <what it does>

**What it does**:
1. Step 1
2. Step 2
```
