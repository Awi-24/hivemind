# 10 — Railguards

Hard limits enforced by every agent. Defined in `.hivemind/project.json > railguards` and CLAUDE.md §6. Full spec: `.hivemind/tools/token-railguards.md`.

## Categories

1. **Anti-loop** — prevent infinite retries
2. **Anti-waste** — prevent speculative token burn
3. **Code boundaries** — prevent cross-role writes
4. **Destructive ops** — gate irreversible commands
5. **Forbidden patterns** — reject insecure code patterns
6. **Framework protection** — prevent accidental damage to `.hivemind/`
7. **Secret exposure** — prevent leaking credentials

## 1 — Anti-loop

```
max_loop_depth: 3
max_file_iterations_per_session: 5
```

If an agent attempts the same approach 3 times and fails → **escalate**:
1. Log to `blockers.md` with `BLK-*` ID
2. Notify CTO via handoff
3. Pause further attempts until unblocked

If an agent iterates over the same file 5 times without a meaningful change → stop and ask the user.

## 2 — Anti-waste

Hard rules:

- Don't read files that won't be modified or consulted
- Don't generate code "just in case" — only what was requested
- Don't add comments, docstrings, or type hints to code you didn't change
- Don't refactor adjacent code outside scope
- Don't create extra files "for the future"
- Use lite tier for reads and reports
- Use `/digest` or `/status` instead of re-reading logs
- Use `/reset-context` when switching focus mid-session

## 3 — Code Boundaries

Defined in `.hivemind/tools/code-boundaries.md`. Every agent has a scope of files it may write. Writing outside scope requires:

1. Handoff to the owning agent, OR
2. Lead Dev or CTO approval logged in `decisions.log`

Example: `backend-dev` cannot modify `src/components/**` without a handoff to `frontend-dev`.

## 4 — Destructive Ops

### Forbidden without confirmation

```
rm -rf
DROP TABLE
DROP DATABASE
TRUNCATE
git push --force
git reset --hard
kubectl delete namespace
terraform destroy
```

Before executing any of these:
1. **Suspend compression** (auto-clarity)
2. Write explanatory message with full clarity
3. Await user confirmation (`yes` or equivalent)
4. Log the intent to `decisions.log` with `DEC-*` ID
5. Only then execute

### Mode

`railguards.destructive_mode` in `project.json`:
- `strict` (default) — always confirm
- `relaxed` — confirm only in production-tagged contexts

## 5 — Forbidden Code Patterns

Auto-rejected on write:

```
eval(
exec(
shell=True
innerHTML =
dangerouslySetInnerHTML
password.*=.*['"][^'"]+['"]
```

If the agent must use one of these (legitimate use case):
1. Log to `decisions.log` with `#security` tag
2. Add a one-line inline comment explaining the justification
3. Request review from `security` via handoff

## 6 — Framework Protection

`.hivemind/` is **read-only to project code generation**. Only governance commands write to it:

- `/init`, `/decision`, `/report`, `/blocker`, `/resolve`, `/handoff`, `/memo`, `/checkpoint`, `/compact`, `/sprint`, `/audit`, `/hotfix`, `/compress` (session-only)

Project scaffolding (`/scaffold`) is explicitly forbidden from writing inside `.hivemind/`.

Setting: `railguards.protect_framework_dir = ".hivemind/"`

## 7 — Secret Exposure

Never expose secrets, tokens, or credentials:

- Not in code
- Not in logs
- Not in CHANGELOG
- Not in comments
- Not in decisions.log
- Not in shared-context.md

If an agent detects a secret in a file it's modifying:
1. **Suspend compression**
2. Alert the user immediately
3. Refuse to commit/write until the secret is rotated AND removed
4. Log as `AUD-*` with `[CRITICAL] #security` tag

## Escalation Chain

```
Railguard hit
    ↓
Agent logs to memory (blocker / decision / audit)
    ↓
If loop / waste / boundary → Lead Dev
If destructive / security → CTO or User
If forbidden pattern → Security
    ↓
Resolution logged in decisions.log before proceeding
```

## Monitoring

MANIFEST counters reflect railguard activity:
- `active_blockers` with `[HOTFIX]` or severity=critical → high railguard pressure
- `open_hotfixes` → recent emergencies
- `audit_last_run` > 7 days → production deploy blocked

## Configuration

All limits live in `.hivemind/project.json > railguards`:

```json
"railguards": {
  "max_loop_depth": 3,
  "max_file_iterations_per_session": 5,
  "require_memory_read_before_write": true,
  "require_report_on_change": true,
  "require_confirmation_before_destructive": true,
  "destructive_mode": "strict",
  "forbidden_operations": [...],
  "forbidden_patterns_in_code": [...],
  "on_loop_limit": "log to .hivemind/memory/blockers.md and escalate to CTO",
  "on_forbidden_operation": "stop immediately, log to .hivemind/memory/blockers.md, notify user",
  "protect_framework_dir": ".hivemind/"
}
```

Change with caution — loosening a railguard is a `DEC-*` decision, not a config tweak.

## Anti-patterns

- Disabling railguards to "move faster" → eventually blows up production
- Using `--no-verify` on git hooks → same problem, different form
- Letting an agent self-approve destructive ops → by design impossible
- Scoping framework-protection off because it's "annoying" → invites corruption of your own governance
