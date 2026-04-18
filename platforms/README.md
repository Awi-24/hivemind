# Platform Adapters

HiveMind Protocol instruction files for AI tools beyond Claude Code. `npx create-hivemind-protocol` distributes these to the correct locations in your project automatically.

| Platform | Source file | Installed to |
|----------|-------------|--------------|
| **Cursor** | `cursor/hivemind.mdc` | `.cursor/rules/hivemind.mdc` |
| **Windsurf** | `windsurf/windsurfrules` | `.windsurfrules` |
| **GitHub Copilot** | `copilot/copilot-instructions.md` | `.github/copilot-instructions.md` |
| **OpenAI Codex** | `codex/AGENTS.md` | `AGENTS.md` |
| **Universal** | `universal/AI_INSTRUCTIONS.md` | `AI_INSTRUCTIONS.md` |

## What each file does

Each adapter contains the same core HiveMind rules adapted for the platform's instruction-file format:

1. **Framework boundary** — `.hivemind/` ≠ project code
2. **Session start protocol** — read MANIFEST first
3. **Command reference** — all `/hm-*` prefixed commands
4. **Memory rules** — append-only protocol
5. **Compression default** — heavy
6. **Model routing** — Haiku/Sonnet/Opus tier guidance

## Manual installation

If you're not using the scaffolder, copy the adapter for your tool:

```bash
# Cursor
mkdir -p .cursor/rules && cp platforms/cursor/hivemind.mdc .cursor/rules/

# Windsurf
cp platforms/windsurf/windsurfrules .windsurfrules

# GitHub Copilot
mkdir -p .github && cp platforms/copilot/copilot-instructions.md .github/

# Codex
cp platforms/codex/AGENTS.md AGENTS.md

# Universal / Aider / Continue / other
cp platforms/universal/AI_INSTRUCTIONS.md AI_INSTRUCTIONS.md
```

## Adding a new platform

1. Create `platforms/<tool>/` with the appropriate instruction file
2. Add a mapping to the `platformMappings` array in `bin/create.js`
3. Add a row to this README and to `platforms/README.md`
