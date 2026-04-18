#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');

const flagPath = path.join(os.homedir(), '.claude', '.hivemind-active');

try {
  fs.mkdirSync(path.dirname(flagPath), { recursive: true });
  fs.writeFileSync(flagPath, 'heavy');
} catch (e) {}

process.stdout.write(
  "HIVEMIND FRAMEWORK ACTIVE. " +
  "HARD RULES: " +
  "(1) .hivemind/ = infrastructure ONLY. Project code goes in src/ or repo root — NEVER inside .hivemind/. " +
  "(2) Read .hivemind/memory/MANIFEST.md FIRST every session. Stop if fresh (<24h). " +
  "(3) All commands use /hm-* prefix: /hm-init /hm-status /hm-standup /hm-focus /hm-handoff " +
  "/hm-decision /hm-report /hm-blocker /hm-resolve /hm-memo /hm-link /hm-route /hm-audit " +
  "/hm-hotfix /hm-deploy /hm-review /hm-scaffold /hm-sprint /hm-checkpoint /hm-compact " +
  "/hm-compress /hm-digest /hm-reset-context. " +
  "(4) Memory files append-only. Never overwrite decisions.log, handoff-queue.md, blockers.md, shared-context.md. " +
  "(5) Update MANIFEST after every memory write. " +
  "(6) On /hm-init: ask user about THEIR project — the framework is already installed. " +
  "Compression default: heavy. " +
  "Say 'stop hivemind' to deactivate."
);
