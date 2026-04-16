# 11 — Common Workflows

Recipes for recurring tasks. Each workflow shows the commands in order plus the MANIFEST/memory side effects.

## 1 — First-time setup

```
/init
```

CTO onboarding form. 16 questions. Produces:
- `.hivemind/project.json` populated
- `DEC-YYYYMMDD-001` opening decision in `decisions.log`
- State files for each active agent
- `HDF-YYYYMMDD-001` optional first handoff (init → CTO)
- MANIFEST Tier 0 refreshed

Verify with `/status`.

---

## 2 — Normal implementation session

```
/focus backend-dev                # scope to an agent
/link #auth                       # see prior context for the domain
# ...work happens...
/report backend-dev "added POST /auth/refresh — JWT refresh flow" #auth #api
/decision backend-dev "chose 15-min access token lifetime" #auth
```

Result:
- `CHG-*` entry in CHANGELOG (with backlinks to DEC)
- `DEC-*` entry in decisions.log
- `shared-context.md > Recent changes` gains one entry
- MANIFEST Link Index + Tag Index + Domain table updated

---

## 3 — Handing off work

```
/focus backend-dev
# work done, needs deploy
/handoff backend-dev devops "deploy /auth service to staging with DB_HOST and AUTH_SECRET_KEY env vars" #infra
```

Result:
- `HDF-*` entry in handoff-queue
- Companion `DEC-*` in decisions.log
- `backend-dev.state.md > Outgoing` updated
- MANIFEST `pending_handoffs.devops += 1`

The devops agent, on next `/focus devops`, sees the pending handoff in MANIFEST without reading the full queue.

---

## 4 — Raising and resolving a blocker

Raise:
```
/blocker "PostgreSQL migration 0042 fails on staging — FK violation on sessions.user_email" --owner backend-dev --severity high #db #api
```

Result:
- `BLK-*` in blockers.md
- MANIFEST `active_blockers += 1` (high)

Resolve (after fix):
```
/resolve BLK-20260416-003 --resolution "added FK drop step before column drop in mig 0043"
```

Impact check runs — if dependents exist, warns before proceeding. On approval:
- `BLK-*` status → `resolved`
- New `DEC-*` logs the resolution
- `active_blockers -= 1`

---

## 5 — Emergency hotfix

```
/hotfix "Auth tokens not expiring on logout — PROD users can replay session after logout" --severity critical #auth #security
```

Compression suspends (critical severity). Creates:
- `HFX-*` blocker
- Companion `DEC-*`
- 3-step handoff chain: current-agent → QA → Security → DevOps
- 3 `HDF-*` entries
- MANIFEST counters: `active_blockers += 1`, `open_hotfixes += 1`

Checklist is presented to the user in full clarity:
```
[ ] implement fix
[ ] local verify
[ ] QA smoke test       → signs off [[HDF-...-001]]
[ ] security sign-off   → signs off [[HDF-...-002]]
[ ] deploy to prod      → signs off [[HDF-...-003]]
[ ] post-mortem logged
```

After all done:
```
/resolve HFX-20260416-001 --resolution "fixed token revocation in src/auth/logout.ts; deployed in CHG-..."
```

---

## 6 — Security audit before deploy

```
/audit --scope all
```

Runs through files / deps / secrets scopes. One `AUD-*` per finding. Updates `audit_last_run` counter.

CRITICAL findings auto-trigger `/blocker` → new `BLK-*` linking the `AUD-*`.

Then:
```
/deploy --env production
```

Preflight checks:
- `active_blockers` CRITICAL/HIGH = 0? (else abort)
- `audit_last_run` < 7 days? (else abort)

If clean, creates deploy handoff chain: current → QA → Security → DevOps.

---

## 7 — Sprint close

End of sprint window:

```
/sprint
```

Compiles:
- CHANGELOG entries in window (`CHG-*`)
- Blockers (active + resolved)
- Handoffs (done + pending)
- Decisions
- Velocity (tier budget used)

Writes `SPR-*` entry in `sprint-report.md`. MANIFEST sprint row updated.

Next sprint kickoff:
```
/memo "sprint 4 kickoff — focus on auth hardening and /users endpoints" #governance
```

---

## 8 — Context restoration after a long break

Cold session after weeks away:

```
/digest --since 30
```

Read-only ultra-compressed summary of the last 30 days. No file writes. You re-onboard yourself in ~800 tokens.

Then:
```
/standup             # per-agent status
/link #auth          # pull all auth-domain history
/focus backend-dev   # scope to continue work
```

---

## 9 — Refactor spanning multiple agents

High-level flow:

```
# 1. Propose at CTO level
/decision cto "approve multi-tenant auth refactor — spans backend + frontend + infra" #auth #governance

# 2. Break into tasks via handoffs
/handoff cto lead-dev "plan multi-tenant refactor" #governance
/handoff lead-dev backend-dev "add tenant_id to auth schema" #auth #db
/handoff lead-dev frontend-dev "update login flow with tenant context" #auth #frontend
/handoff lead-dev devops "multi-tenant DNS and env vars" #infra

# 3. Checkpoint before destructive migration
/checkpoint --label before-multitenant-migration #db

# 4. Work, log, report
# ...

# 5. When each piece is done
/report backend-dev "tenant-aware schema + auth middleware" #auth #db #api
/report frontend-dev "login flow detects tenant subdomain" #auth #frontend
/report devops "multi-tenant prod env provisioned" #infra

# 6. Security review before deploy
/audit --scope files
/deploy --env staging

# 7. Eventually
/deploy --env production
```

All linked via `[[DEC-...]]` references so the causal chain stays intact.

---

## 10 — Recovering from a broken MANIFEST

Symptoms: `/status` shows stale counters, `/link <ID>` returns "not found" for entries that exist.

Fix:
```
/compact --file all
```

Scans all memory files, rebuilds Link Index / Backlinks / Tag Index from inline ID strings. Appends to update log:

```
[<ts>] [docs] MANIFEST rebuilt from source files
```

Then verify:
```
/status
/link <known-ID>
```

---

## 11 — Compaction before long absence

Before stepping away for weeks:

```
/compact --older-than 30
```

Compresses old decisions/blockers into digest blocks. IDs preserved. MANIFEST counters reflect archived status. Cold-start cost drops for future sessions.

---

## 12 — Adding a new agent mid-project

```
# 1. Copy template
cp .hivemind/agents/_AGENT_TEMPLATE.md .hivemind/agents/13-data-scientist.md
# 2. Edit the profile (role, boundaries, ownership)
# 3. Add state file from template
cp .hivemind/memory/agent-states/_STATE_TEMPLATE.md .hivemind/memory/agent-states/data-scientist.state.md
# 4. Register in project.json
# Edit agents.available and agents.active
# 5. Log the decision
/decision cto "added data-scientist agent for ML pipeline ownership" #governance
# 6. Verify
/focus data-scientist
```

---

## Anti-patterns

- Skipping `/link` before modifying an entry's dependents → breaks backlinks silently
- Using `/hotfix` for non-emergencies → erodes the tag's signal value
- Not running `/audit` before production deploy → preflight blocks you anyway
- Manually editing MANIFEST instead of re-running the triggering command → inconsistency
