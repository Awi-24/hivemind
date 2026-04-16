# 1 — Overview

## What HiveMind Is

HiveMind Protocol is a **drop-in framework folder** (`.hivemind/`) that sits at the root of any software project and imposes discipline on AI coding assistants. It turns stateless, forgetful LLM agents into a governed multi-agent system with persistent memory, role boundaries, token hygiene, and traceable decisions.

## What HiveMind Is Not

- **Not a coding agent.** HiveMind doesn't write code for you — your AI assistant does. HiveMind tells the assistant *how* to behave.
- **Not the project.** `.hivemind/` is infrastructure. Your project code lives in `src/`, `apps/`, `services/`, etc. at the repo root.
- **Not a lock-in.** Works with Claude, GPT, Gemini, Ollama, or any model that follows markdown instructions.
- **Not a replacement for git.** Memory is complementary to version control, not a substitute.

## Who It's For

- Solo developers tired of their AI assistant forgetting context between sessions
- Teams who want consistent AI behavior across members
- Projects with multiple concerns (backend/frontend/devops/security) that benefit from role separation
- Anyone burning tokens on an LLM that re-reads the same files every session

## Problem → Solution

| Problem | HiveMind solution |
|---------|-------------------|
| Agent forgets context between sessions | Tiered memory — MANIFEST holds self-sufficient Tier 0 snapshot |
| Agent loops on the same failing approach | 3-attempt railguard → escalate + log |
| Agent burns tokens on filler and re-reads | 4-level compression + link index (O(1) navigation) |
| Agent touches files it shouldn't | Code-boundaries map per role |
| Agent skips documentation | Append-only decisions + CHANGELOG protocol, MANIFEST-enforced |
| Agent silently does destructive ops | Auto-clarity suspension + confirmation gates |
| Custom slash commands don't appear in dropdown | Native `.claude/commands/*.md` integration |
| Line references break after compaction | Stable entry IDs (`DEC-20260416-001`) |

## Architecture at a Glance

```
┌──────────────────────────────────────────────────────────────────┐
│                       USER PROJECT ROOT                          │
│                                                                  │
│  ┌──────────────┐   ┌──────────────┐   ┌─────────────────────┐   │
│  │  CLAUDE.md   │   │  .claude/    │   │  .hivemind/         │   │
│  │  (protocol)  │──▶│  commands/   │──▶│  (framework)        │   │
│  └──────────────┘   │  (22 files)  │   │                     │   │
│                     └──────────────┘   │  ├─ agents/ (12)    │   │
│                                        │  ├─ memory/         │   │
│  ┌──────────────────────────────┐      │  │   ├─ MANIFEST    │   │
│  │  YOUR PROJECT CODE           │      │  │   ├─ decisions   │   │
│  │  src/ apps/ services/ …      │      │  │   ├─ blockers    │   │
│  └──────────────────────────────┘      │  │   ├─ handoffs    │   │
│                                        │  │   └─ agent-states│   │
│                                        │  ├─ reports/        │   │
│                                        │  ├─ tools/          │   │
│                                        │  ├─ docs/           │   │
│                                        │  └─ project.json    │   │
│                                        └─────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

## Core Concepts

| Concept | One-line definition |
|---------|---------------------|
| **Agent** | Role-scoped persona with profile, default model tier, and code ownership |
| **Tier** | Memory loading depth (0–3) or model routing depth (lite/standard/heavy) |
| **MANIFEST** | Self-sufficient Tier 0 index — read first, always |
| **Entry ID** | Stable immutable reference like `DEC-20260416-001` |
| **Wiki-link** | `[[ID]]`, `[[#tag]]`, or `[[@agent]]` — resolves via MANIFEST |
| **Tag** | Domain classifier (`#auth`, `#db`, …) — required on every entry |
| **Compression level** | Output density (normal / lite / heavy / ultra) |
| **Handoff** | Formal task transfer between agents, tracked in a queue |
| **Blocker** | Recorded impediment with severity and ownership |
| **Railguard** | Hard-coded limit that prevents loops, waste, or unsafe ops |

## Reading Order

If you're new: **01 → 02 → 05 → 09**. That covers install, memory model, and command reference — enough to operate.

If you're building on top: add **03, 06, 10, 12**.

If you're porting to another model: jump to **13**.
