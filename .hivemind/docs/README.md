# HiveMind Protocol — Documentation

Complete reference for the HiveMind Protocol framework. Everything in English — technical terms stay English regardless of the user's reply language.

## Index

1. **[Overview](01-overview.md)** — What HiveMind is, who it's for, architecture at a glance
2. **[Installation](02-installation.md)** — Drop-in `.hivemind/` setup, initialization, first session
3. **[Architecture](03-architecture.md)** — Folder layout, runtime model, trust boundaries
4. **[Agents](04-agents.md)** — The 12 roles, profiles, activation, custom agents
5. **[Memory System](05-memory-system.md)** — Tiered loading, file formats, write protocol
6. **[Linking System](06-linking-system.md)** — IDs, wiki-links, tags, backlinks, navigation
7. **[Token Compression](07-token-compression.md)** — 4 levels, rules, abbreviations, measurements
8. **[Model Routing](08-model-routing.md)** — Lite/Standard/Heavy tiers, escalation, cost control
9. **[Commands](09-commands.md)** — Full reference for all 23 slash commands
10. **[Railguards](10-railguards.md)** — Anti-loop, anti-waste, destructive-op gates
11. **[Workflows](11-workflows.md)** — Common patterns: hotfix, deploy, sprint, audit
12. **[Customization](12-customization.md)** — Adding agents, commands, tags, scaffold templates
13. **[Multi-Model Support](13-multi-model.md)** — GPT, Gemini, Ollama — running HiveMind outside Claude
14. **[FAQ](14-faq.md)** — Common questions
15. **[Glossary](15-glossary.md)** — Terms used across the docs

## Conventions

- File paths always use forward slashes and the `.hivemind/` prefix
- Agent references use `[[@slug]]` — resolve via `.hivemind/agents/<N>-<slug>.md`
- Entry IDs follow `<KIND>-<YYYYMMDD>-<NN>` and are immutable once written
- Examples use the `2026-04-16` date for consistency
- Code blocks are copy-paste safe for bash/zsh unless labeled otherwise
