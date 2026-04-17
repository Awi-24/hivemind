#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Exclude from copy: git, node_modules, bin (this script), stale memory
// Keep: .hivemind (framework), .claude (commands), CLAUDE.md, README.md, assets, LICENSE, .gitignore, .gitattributes
const EXCLUDE = new Set([".git", "node_modules", "bin"]);

const target = process.argv[2] || "my-hivemind-project";
const targetDir = path.resolve(process.cwd(), target);

if (fs.existsSync(targetDir)) {
  console.error(`\nError: directory "${target}" already exists.\n`);
  process.exit(1);
}

const templateDir = path.join(__dirname, "..");

function copyDir(src, dest, relRoot = "") {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src)) {
    if (EXCLUDE.has(entry)) continue;
    const srcPath = path.resolve(src, entry);
    const destPath = path.join(dest, entry);
    // Skip if this entry IS the target (running from inside the template dir)
    if (srcPath === targetDir) continue;
    // Skip the stale memory state files; they are regenerated fresh below
    const rel = path.join(relRoot, entry).replace(/\\/g, "/");
    if (rel === ".hivemind/memory") continue;
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath, rel);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyDir(templateDir, targetDir);

// Scaffold fresh memory tree
const memDir = path.join(targetDir, ".hivemind", "memory");
fs.mkdirSync(path.join(memDir, "agent-states"), { recursive: true });

const today = new Date().toISOString().slice(0, 10);
const now = new Date().toISOString().slice(0, 16).replace("T", " ");

const memoryFiles = {
  ".hivemind/memory/shared-context.md":
`# Shared Context

> All agents read this at session start (Tier 0/1). Append only.

## Current Project State

**Last updated**: ${today} by [init]
**Phase**: discovery
**Sprint**: 0

### Active Focus
_Not yet defined — run /init to configure._

### Recent changes
_empty._

### Memos
_empty._
`,

  ".hivemind/memory/decisions.log":
`# Decisions Log

> Append-only. Format: \`[YYYY-MM-DD HH:MM] [AGENT] DECISION: <desc> | REASON: <why>\`
> Compression: ultra. Preserve paths, versions, model IDs exactly.

## Log

[${now}] [init] DECISION: HiveMind framework scaffolded | REASON: project kickoff via create-hivemind-protocol
`,

  ".hivemind/memory/handoff-queue.md":
`# Handoff Queue

> Append-only. Mark completed as [DONE].

## Queue

[${now}] FROM: init → TO: cto
TASK: Run /init to configure project.json and activate agents
CONTEXT: fresh scaffold, no agents active yet
FILES: .hivemind/project.json
MODEL: heavy
STATUS: [PENDING]
`,

  ".hivemind/memory/blockers.md":
`# Blockers

> Add blockers immediately when identified. Resolve with [RESOLVED: YYYY-MM-DD by <agent>].

## Active
_none._

## Resolved
_none._
`,

  ".hivemind/memory/MANIFEST.md":
`# Memory Manifest

> **Read this first. Always. Then fetch only what it points to.**
> Self-sufficient for Tier 0.

---

## Tier 0 Snapshot

\`\`\`
project:            my-project          ← filled by /init
phase:              discovery
sprint:             0 (day 0 / 0)
active_focus:       not configured — run /init
last_updated:       ${now}
manifest_freshness: fresh
compression:        heavy
reply_language:     en
\`\`\`

### Active agents + focus

| Agent | Status | Current focus | Last active |
|-------|--------|---------------|-------------|
| cto | idle | awaiting /init | — |
| lead-dev | idle | — | — |

### Counters

| Counter | Value | Notes |
|---------|------:|-------|
| active_blockers | 0 | crit=0 high=0 med=0 low=0 |
| pending_handoffs | 1 | cto=1 |
| open_hotfixes | 0 | — |
| decisions_total | 1 | since last compact |
| audit_last_run | never | — |

### Last decision per domain

| Domain | Last decision | Date | Line ref |
|--------|---------------|------|----------|
| governance | HiveMind scaffolded | ${today} | decisions.log:L5 |

---

## Tier 1 Pointers

| File | Last entry | Line ref |
|------|------------|----------|
| \`decisions.log\` | [init] HiveMind scaffolded | L5 |
| \`blockers.md\` | none active | — |
| \`handoff-queue.md\` | init → cto: run /init | L5-11 |
| \`shared-context.md\` | initialized | L1-20 |

### Pending handoffs per agent

| Target | Count | Line refs |
|--------|------:|-----------|
| cto | 1 | L5-11 |

---

## Tier 2 Triggers

See CLAUDE.md § 1 for rules.

## Tier 3 — Explicit Fetch Only

See CLAUDE.md § 1 for rules.

---

## Compaction Status

| File | Active | Digest | Last compact |
|------|-------:|--------|--------------|
| \`decisions.log\` | 1 | none | never |
| \`blockers.md\` | 0 | none | never |

---

## Update log

\`\`\`
[${now}] [init] scaffolded: all files — HiveMind Protocol template
\`\`\`
`,
};

for (const [relPath, content] of Object.entries(memoryFiles)) {
  const full = path.join(targetDir, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
}

console.log(`
╔══════════════════════════════════════════╗
║       HiveMind Protocol — Ready          ║
╚══════════════════════════════════════════╝

  Scaffolded into: ./${target}

  Layout:
    .hivemind/        ← framework (do NOT put project code here)
    .claude/commands/ ← slash commands surfaced in dropdown
    CLAUDE.md         ← behavior protocol (auto-loaded by Claude Code)

  Next steps:
    1. cd ${target}
    2. Open in Claude Code
    3. Run /init  (CTO onboarding form)
    4. Run /status to verify

  Docs: https://github.com/Awi-24/HiveMind-Protocol
`);
