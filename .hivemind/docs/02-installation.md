# 2 — Installation

## Prerequisites

- A project directory (empty or existing)
- Claude Code (for first-class integration) OR any LLM that follows markdown system prompts
- Git (recommended — memory is append-only and benefits from version control)

## Install Options

### Option A — npx (cleanest for new projects)

```bash
npx create-hivemind-protocol my-project
cd my-project
```

Creates a new directory with the framework installed.

### Option B — Clone into an existing project

```bash
cd my-existing-project/
git clone --depth 1 https://github.com/Awi-24/hivemind-protocol /tmp/hm-seed
cp -r /tmp/hm-seed/.hivemind ./
cp -r /tmp/hm-seed/.claude ./
cp /tmp/hm-seed/CLAUDE.md ./
rm -rf /tmp/hm-seed
```

### Option C — Manual

Copy these three into your project root:
- `.hivemind/` — framework
- `.claude/commands/` — slash commands (dropdown registration)
- `CLAUDE.md` — behavior protocol

## What Got Installed

```
your-project/
├── .hivemind/                ← framework
│   ├── agents/               (12 role profiles)
│   ├── memory/               (MANIFEST + logs + agent states)
│   ├── reports/              (CHANGELOG + sprint + audit)
│   ├── tools/                (compression spec, linking spec, boundaries, railguards)
│   ├── docs/                 (this documentation)
│   └── project.json          (filled by /init)
├── .claude/
│   └── commands/             (22 slash commands)
└── CLAUDE.md                 (auto-loaded by Claude Code)
```

**Hard rule**: `.hivemind/` is the framework, not the project. Your code goes outside it.

## Initialize the Project

Open Claude Code at the project root and run:

```
/init
```

The CTO agent presents a 16-question onboarding form. Answer inline — no flags, no config files to edit first.

### Form fields (quick reference)

| Section | Fields |
|---------|--------|
| Identity | name, description, repo URL, team |
| Stack | language, framework, database, cloud |
| Scope | phase, sprint length, target first delivery |
| Agents | which of the 12 agents to activate |
| Communication | default compression level, reply language |
| Governance | destructive-op confirmation mode, compaction threshold |

### After init runs

The CTO agent:
1. Populates `.hivemind/project.json` with your answers
2. Writes the opening entry in `decisions.log` (with a stable `DEC-*` ID)
3. Creates state files for each active agent
4. Refreshes the MANIFEST Tier 0 snapshot
5. Confirms with:
   ```
   HiveMind active.
   Project: my-project | phase=discovery | agents=6
   Compression: heavy | Language: en
   Next: /status  |  /focus <agent>  |  /scaffold <template>
   ```

## Verify

```
/status
```

You should see:
- Project name (not `my-project`)
- Phase matching your answer
- Active agents listed with `IDLE` status
- One pending handoff: `init → cto`

If `/status` shows `my-project` or `not configured`, the init did not complete. Re-run `/init`.

## Optional — Scaffold the Project Code

If you need boilerplate code, run:

```
/scaffold nextjs --name web --out apps/web
/scaffold fastapi --name api --out apps/api
```

Available templates: `nextjs`, `fastapi`, `node-api`, `react-native`, `monorepo`.

Scaffolds write **outside** `.hivemind/` — always at the repo root or your chosen `--out` directory.

## Upgrade / Update HiveMind

HiveMind is template-first: you own the copy in your repo. To pick up upstream changes:

```bash
cd my-project/
git clone --depth 1 https://github.com/Awi-24/hivemind-protocol /tmp/hm-seed
# Diff, review, merge manually:
diff -u .hivemind/ /tmp/hm-seed/.hivemind/ | less
```

Files you should rarely touch (safe to merge upstream changes wholesale):
- `.hivemind/tools/*`
- `.hivemind/docs/*`
- `.hivemind/agents/_AGENT_TEMPLATE.md`
- `.hivemind/memory/agent-states/_STATE_TEMPLATE.md`

Files you've customized and must merge carefully:
- `.hivemind/project.json`
- `.hivemind/memory/*` (NEVER overwrite — these are your project's history)
- `.hivemind/agents/*.md` if you modified role boundaries

## Uninstall

```bash
rm -rf .hivemind .claude CLAUDE.md
```

Your project code is untouched. You lose the memory history — commit it to git first if you want to preserve it.
