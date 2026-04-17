#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Files/dirs that belong to the meta-repo (this scaffolder) and must NOT
// leak into the user's project.
const EXCLUDE = new Set([
  ".git",
  ".github",
  "node_modules",
  "bin",
  "assets",
  "package.json",
  "package-lock.json",
  ".npmignore",
  ".gitignore",
  "README.md",
  "LICENSE",
]);

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
    if (srcPath === targetDir) continue;
    const rel = path.join(relRoot, entry).replace(/\\/g, "/");
    // Memory and reports are regenerated fresh below — never copy from meta-repo
    if (rel === ".hivemind/memory") continue;
    if (rel === ".hivemind/reports") continue;
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath, rel);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyDir(templateDir, targetDir);

const today = new Date().toISOString().slice(0, 10);
const now = new Date().toISOString().slice(0, 16).replace("T", " ");

// Fresh .gitignore for the user's project (not the meta-repo's)
const userGitignore = `# dependencies
node_modules/

# build output
dist/
build/
*.tgz

# env
.env
.env.local
.env.*.local

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp

# Claude Code local overrides
.claude/settings.local.json
`;

fs.writeFileSync(path.join(targetDir, ".gitignore"), userGitignore);

// Fresh memory tree
const memDir = path.join(targetDir, ".hivemind", "memory");
fs.mkdirSync(path.join(memDir, "agent-states"), { recursive: true });

// Fresh reports tree
const reportsDir = path.join(targetDir, ".hivemind", "reports");
fs.mkdirSync(reportsDir, { recursive: true });

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

const reportFiles = {
  ".hivemind/reports/CHANGELOG.md":
`# CHANGELOG

> Collaborative changelog written by all agents. Append only — never delete entries.
> Use \`/report <agent> <summary>\` to add entries.

---

## Entry Format

\`\`\`markdown
## [YYYY-MM-DD] — <Agent>
### <Type>: <Short title>
- **What**: <what was done>
- **Why**: <motivation>
- **Impact**: <what changes for other agents>
- **Files**: <list of files>
- **Model used**: <lite|standard|heavy>
\`\`\`

Types: \`feat\` | \`fix\` | \`chore\` | \`docs\` | \`security\` | \`perf\` | \`refactor\` | \`test\` | \`infra\`

---

<!-- Add new entries above this line, newest first -->
`,

  ".hivemind/reports/audit-log.md":
`# Security Audit Log

> Maintained primarily by the Security agent. All agents may add entries for security-relevant findings.
> Entries are never deleted. Resolved findings are marked with their resolution.

---

## Entry Format

\`\`\`markdown
## [YYYY-MM-DD HH:MM] Security Finding — <Agent or System>

**Severity**: CRITICAL / HIGH / MEDIUM / LOW / INFO
**Type**: <OWASP category, CVE, or custom label>
**Finding**: <clear description of the vulnerability or concern>
**Affected**: <files, endpoints, services, or systems>
**Recommendation**: <specific fix or mitigation>
**Status**: [OPEN] / [IN-PROGRESS] / [RESOLVED: YYYY-MM-DD by <agent>] / [ACCEPTED-RISK: <reason>]
\`\`\`

---

## Findings

<!-- Add new findings below this line -->
`,

  ".hivemind/reports/sprint-report.md":
`# Sprint Report

> Generated by Product Manager using \`/sprint\`. Updated each sprint.
> Sources: \`reports/CHANGELOG.md\`, \`memory/blockers.md\`, \`memory/handoff-queue.md\`

---

## Report Format

\`\`\`markdown
## Sprint <N> — Week <YYYY-Www>

**Period**: YYYY-MM-DD to YYYY-MM-DD
**Generated by**: product-manager
**Model used**: lite

### Delivered
| Feature / Fix | Agent | Status |
|--------------|-------|--------|
| <item> | <agent> | Done |

### In Progress
| Feature / Fix | Agent | Blocker |
|--------------|-------|---------|
| <item> | <agent> | — |

### Blocked
| Item | Agent | Blocker | Escalated to |
|------|-------|---------|--------------|
| <item> | <agent> | <blocker> | <agent> |

### Quality Metrics
- Test coverage: —%
- Open bugs: <count> (Critical: 0, High: 0, Medium: 0)
- Security findings: <count> open

### Handoffs Completed
- <from> → <to>: <task>

### Decisions Made This Sprint
- [YYYY-MM-DD] <agent>: <decision>

### Next Sprint Focus
1. <priority item>
2. <priority item>
\`\`\`

---

_No sprints yet. Run \`/sprint\` after first sprint completes._
`,
};

for (const [relPath, content] of Object.entries({ ...memoryFiles, ...reportFiles })) {
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
