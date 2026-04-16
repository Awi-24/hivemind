# 15 — Glossary

| Term | Definition |
|------|------------|
| **Agent** | Role-scoped persona with profile, default model tier, code ownership, escalation path |
| **Anchor** | Line-number hint in MANIFEST Link Index; advisory, not authoritative |
| **Append-only** | Memory protocol — new entries added, existing entries never overwritten |
| **Archived (status)** | Entry folded into a `[DIGEST]` block; ID remains valid, body consolidated |
| **Auto-clarity** | Automatic suspension of compression for CRITICAL / irreversible / order-sensitive output |
| **Backlink** | Inverted index entry: `target ID → [referenced by]` |
| **Boundary** | File scope owned by an agent; writing outside requires handoff |
| **Caveman** | Source protocol for compression philosophy — brevity reduces cost + hallucination |
| **Checkpoint** | Snapshot of session state before a risky op (`CHK-*` ID) |
| **Compaction** | Folding old entries into a digest block while preserving IDs |
| **Compression level** | Output density: normal (0%), lite (~40%), heavy (~60%), ultra (~75%) |
| **Cost tier** | Model routing class: lite / standard / heavy |
| **CTO posture** | Role adopted during `/init` — decisive governance, no filler |
| **DEC** | Decision entry prefix; stored in `decisions.log` |
| **Decision** | Formally logged architectural / governance choice |
| **Destructive op** | Irreversible command (`DROP`, `DELETE`, `rm -rf`, force push) gated by confirmation |
| **Digest block** | Compacted summary of old entries (`[DIGEST ... [END DIGEST]`) |
| **Domain tag** | `#kebab-case` classifier on every entry (`#auth`, `#db`, ...) |
| **Dropdown** | Claude Code `/` autocomplete — surfaces `.claude/commands/*.md` |
| **Entry ID** | Immutable stable reference: `<KIND>-<YYYYMMDD>-<NN>` |
| **Escalation** | Formal handoff up the role hierarchy (QA → Lead Dev → CTO → User) |
| **Flag** | MANIFEST counter / pointer that triggers Tier 2 loads |
| **Forbidden operation** | Destructive command requiring confirmation (`forbidden_operations` in railguards) |
| **Forbidden pattern** | Code pattern rejected on write (`eval(`, `innerHTML =`, etc.) |
| **Framework** | The `.hivemind/` folder — governance infrastructure, not project code |
| **Freshness** | MANIFEST flag: `fresh` (<24h) or `stale` (≥24h) |
| **Governance** | Cross-cutting domain: HiveMind protocol, process changes, project init |
| **HDF** | Handoff entry prefix; stored in `handoff-queue.md` |
| **HFX** | Hotfix entry prefix (blocker subclass); stored in `blockers.md` |
| **Handoff** | Formal task transfer between agents |
| **Hotfix** | Emergency fix with accelerated QA → Security → DevOps chain |
| **Index** | MANIFEST forward/backward/tag table supporting O(1) navigation |
| **Init** | One-time project setup via `/init` (CTO onboarding form) |
| **Kind (prefix)** | 3-letter entry-type code (DEC, BLK, HDF, CHG, HFX, CHK, AUD, MEM, SPR) |
| **Line ref** | Legacy reference style (`file.md:L12`) — fragile, replaced by IDs |
| **Link Index** | MANIFEST forward table: `ID → file:anchor` |
| **MANIFEST** | Tier 0 self-sufficient snapshot file; single source of truth for indices |
| **MCP** | Model Context Protocol — Anthropic's tool/context protocol for Claude |
| **MEM** | Memo entry prefix; stored in `shared-context.md` |
| **Model ID** | Exact model identifier (`claude-opus-4-6`, `gpt-4o`, ...) |
| **Obsidian-style** | Wiki-link syntax inspired by Obsidian: `[[target]]` |
| **Preamble** | Intro fluff at message start — dropped in lite/heavy/ultra |
| **Postamble** | Closing pleasantries at message end — dropped in lite/heavy/ultra |
| **Product code** | Code you're actually shipping — lives outside `.hivemind/` |
| **Protocol** | The behavioral contract in CLAUDE.md, auto-loaded by Claude Code |
| **Railguard** | Hard limit preventing loops, waste, boundary violations, destructive ops |
| **Reply language** | Language for user-facing output (`en`, `pt-BR`, `es`, `fr`, `de`, `ja`) |
| **Resolved (status)** | Blocker closed via `/resolve` |
| **Role** | One of the 12 agent slugs |
| **Scaffold** | Template-based project code generation via `/scaffold` |
| **Session** | One continuous interaction with the LLM (from open to close) |
| **Shared context** | `shared-context.md` — project-wide state, memos, recent changes |
| **Slug** | Agent identifier in kebab-case (`backend-dev`, `product-manager`) |
| **SPR** | Sprint report entry prefix; stored in `sprint-report.md` |
| **Stale** | MANIFEST ≥24h old — agents verify pointers before acting |
| **Subagent** | Delegated agent spawned for a bounded subtask |
| **Superseded (status)** | Entry replaced by a newer one (`SUPERSEDES: [[OLD-ID]]`) |
| **Tag Index** | MANIFEST table: `#tag → [entry IDs]` |
| **Template** | Either an agent profile (`_AGENT_TEMPLATE.md`) or a scaffold (`tools/scaffold-templates/*`) |
| **Tier (memory)** | Loading depth: 0 (MANIFEST) / 1 (role) / 2 (flag) / 3 (explicit) |
| **Tier (model)** | Routing class: lite / standard / heavy |
| **Ultra** | Maximum compression level (~75% reduction, abbreviations + arrows) |
| **Update log** | Append-only log in MANIFEST tracking every write |
| **Wiki-link** | `[[ID]]`, `[[#tag]]`, or `[[@agent]]` — Obsidian-style reference |
