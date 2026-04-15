# Code Boundaries

> Defines which agent owns which parts of the codebase. Before modifying files outside your ownership, you must get explicit approval via a handoff entry.

---

## Ownership Map

| Path Pattern | Owner Agent | Can Read | Needs Approval From |
|-------------|------------|----------|-------------------|
| `src/components/**` | frontend-dev | All | lead-dev |
| `src/pages/**`, `src/app/**` | frontend-dev | All | lead-dev |
| `src/styles/**`, `public/**` | frontend-dev | All | lead-dev |
| `src/server/**`, `src/api/**` | backend-dev | All | lead-dev |
| `src/db/**`, `migrations/**` | backend-dev | All | lead-dev + devops |
| `src/services/**` | backend-dev | All | lead-dev |
| `.github/workflows/**` | devops | All | devops |
| `docker/**`, `Dockerfile*` | devops | All | devops |
| `infra/**`, `terraform/**`, `k8s/**` | devops | All | devops + cto |
| `data/**`, `pipelines/**`, `dbt/**` | data | All | lead-dev |
| `ai/**`, `ml/**` | ai-ml | All | lead-dev |
| `mobile/**`, `ios/**`, `android/**` | mobile | All | lead-dev |
| `tests/**`, `e2e/**`, `__tests__/**` | qa | All | qa |
| `docs/**`, `*.md` (doc files) | docs | All | docs |
| `agents/**` | cto | All | cto |
| `memory/**` | All (shared) | All | Protocol in CLAUDE.md |
| `reports/**` | All (shared) | All | Protocol in CLAUDE.md |
| `tools/**` | docs + lead-dev | All | lead-dev |
| `project.json` | cto | All | cto |
| `CLAUDE.md` | cto | All | cto |

---

## Cross-Boundary Rules

### When you need to read code outside your domain
Reading is always allowed. No approval needed.

### When you need to modify code outside your domain

1. Create a handoff entry in `memory/handoff-queue.md`
2. State clearly: what you need changed, why, and what the expected output is
3. The owning agent reviews and implements
4. Exception: Lead Dev may directly edit any engineering file in urgent situations — must log in decisions.log

### Emergency Cross-Boundary Modifications (hotfix)
If a critical bug requires you to touch another agent's code immediately:
1. Make the minimal fix
2. Immediately log it in `memory/decisions.log` with `[EMERGENCY-CROSS-BOUNDARY]` tag
3. Create a handoff for the owning agent to review and own the fix properly
4. Notify Lead Dev

---

## Shared Files Protocol

These files are collaboratively edited by all agents:

| File | Protocol |
|------|----------|
| `memory/shared-context.md` | Append only. Update at session end. |
| `memory/decisions.log` | Append only. Format enforced. |
| `memory/handoff-queue.md` | Append only. Mark done, never delete. |
| `memory/blockers.md` | Add freely. Resolve by marking status. |
| `reports/CHANGELOG.md` | Append only. Format enforced. |
| `reports/sprint-report.md` | PM writes, others contribute sections. |
| `reports/audit-log.md` | Security writes primarily; others may add. |

---

## File Naming Conventions

```
# Branches
feat/<agent>/<short-description>     (e.g., feat/backend-dev/add-auth-endpoint)
fix/<agent>/<short-description>      (e.g., fix/frontend-dev/login-form-validation)
chore/<agent>/<short-description>

# Commits
<type>(<agent>): <description>
feat(backend-dev): add JWT refresh token endpoint
fix(frontend-dev): correct error state in login form
chore(devops): update Node.js version in CI

# Types: feat | fix | chore | docs | test | refactor | perf | security
```
