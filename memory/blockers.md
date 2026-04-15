# Blockers

> **Protocol**: Add blockers immediately when identified. Resolve by marking `[RESOLVED: YYYY-MM-DD]`.
> Use `/blocker <description>` to add. Mark resolved when fixed.

---

## Active Blockers

_None — project is freshly initialized._

---

## Resolved Blockers

<!-- Move resolved blockers here with their resolution date and notes -->

---

## Format

```
### [YYYY-MM-DD] [SEVERITY] <Title>
**Reported by**: <agent>
**Blocking**: <what can't proceed>
**Description**: <details>
**Escalated to**: <agent if applicable>
**Status**: [OPEN] / [IN-PROGRESS] / [RESOLVED: YYYY-MM-DD by <agent>]
**Resolution**: <how it was resolved, if applicable>
```

### Severity Levels
- `[CRITICAL]` — halts all progress on the affected system
- `[HIGH]` — blocks a specific agent or feature
- `[MEDIUM]` — workaround exists, but should be fixed soon
- `[LOW]` — minor inconvenience, low urgency
