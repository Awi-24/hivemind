---
description: Structured code review of a file
argument-hint: <file> [--agent <agent>] [--scope logic|security|style|all]
model: claude-sonnet-4-6
---

Args: $ARGUMENTS

Default scope: `all`.

Flow:
1. Read target file
2. Determine owning agent via `.hivemind/tools/code-boundaries.md` unless `--agent` overrides
3. Load owner agent profile `.hivemind/agents/<n>-<slug>.md`
4. Review against:
   - **logic**: correctness, edge cases, error handling
   - **security**: OWASP top 10, input validation, secret leakage
   - **style**: follows `project.json.customization.code_style` rules
   - **coverage**: tests exist for changed paths

Output grouped by severity:
```
=== REVIEW: <file> | agent=<slug> | scope=<scope> ===
[CRITICAL] <line>: <desc> | fix: <remediation>
[HIGH]     ...
[MEDIUM]   ...
[LOW]      ...
[INFO]     ...

summary: crit=<n> high=<n> med=<n> low=<n> info=<n>
verdict: APPROVE | REQUEST_CHANGES | BLOCK
```

If any HIGH or CRITICAL security finding → also append to `.hivemind/reports/hm-audit-log.md`.
