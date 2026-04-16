---
description: Security audit — each finding gets an AUD-ID
argument-hint: [--agent <agent>] [--scope files|deps|secrets|all]
model: claude-opus-4-6
---

Args: $ARGUMENTS

Default scope: `all`. Parse `--scope` and `--agent` flags. Delegate to **security** agent (see `.hivemind/agents/07-security.md`).

### Scope actions

- `files` — scan recent diffs for OWASP top 10 patterns
- `deps` — check manifests for CVEs / unmaintained libs
- `secrets` — scan for tokens, keys, `.env` leakage
- `all` — run all three

### Generate IDs

One `AUD-<YYYYMMDD>-<NN>` per **finding** (not per audit run). Read MANIFEST, increment per finding.

### Write findings

**Compression SUSPENDED for CRITICAL/HIGH findings.**

Append to `.hivemind/reports/audit-log.md`:
```
## Audit run — YYYY-MM-DD | scope=<scope> | agent=[[@<agent>]]

### AUD-<YYYYMMDD>-<NN> [CRITICAL] #security <tags>
- **Finding**: <description>
- **File**: <path>:<line>
- **Fix**: <remediation>
- **References**: <[[ID]] list or none>

### AUD-<YYYYMMDD>-<NN+1> [HIGH] ...

### Summary
  critical: <n> | high: <n> | medium: <n> | low: <n>
```

### Update MANIFEST

1. Append rows to `## Link Index` (one per finding)
2. Tag Index: every AUD carries `#security` plus domain tag
3. Set `audit_last_run` counter to today
4. For each CRITICAL finding → auto-generate a `BLK-...` entry linking `[[AUD-...]]` (reuse `/blocker` logic)
5. Append to `## Update log`

### Output

If any CRITICAL → suspended-compression alert. Else ultra summary:
```
✓ audit done | crit=<n> high=<n> med=<n> low=<n>
ids: AUD-...001 to AUD-...<NN>
```
