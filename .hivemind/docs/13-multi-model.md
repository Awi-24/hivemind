# 13 — Multi-Model Support

HiveMind works with any LLM that follows markdown instructions. The protocol is model-agnostic; the runtime is not.

## Matrix

| Platform | CLAUDE.md | Slash commands | Tier routing | MCPs | Effort |
|----------|-----------|----------------|--------------|------|--------|
| **Claude Code** | Auto-loaded | Native (`/` dropdown) | Native | Native | Zero |
| **Claude API** | Include as system | Emulate in orchestrator | Enforced by you | Via `computer-use` | Moderate |
| **GPT / ChatGPT** | Custom Instructions | Emulate in orchestrator | Enforced by you | N/A (use OpenAI tools) | Moderate |
| **Gemini** | System instructions | Emulate in orchestrator | Enforced by you | N/A (use Gemini tools) | Moderate |
| **Ollama / local** | System prompt | Emulate in orchestrator | Enforced by you | N/A | High |

"Emulate" = your orchestrator code parses `/command` from user input and runs the corresponding `.claude/commands/<name>.md` as a prompt injection.

## Claude Code (native)

No work required after install.

- `CLAUDE.md` auto-loads
- `.claude/commands/*.md` appears in `/` dropdown
- `.claude/settings.json` controls permissions + MCPs
- Model routing is honored by the Claude Code runtime

## Claude API (direct)

Minimal orchestrator pseudocode:

```python
import anthropic

def run(user_input: str, tier: str = "standard"):
    models = {
      "lite":     "claude-haiku-4-5-20251001",
      "standard": "claude-sonnet-4-6",
      "heavy":    "claude-opus-4-6",
    }
    system = open("CLAUDE.md").read()

    if user_input.startswith("/"):
        cmd, *args = user_input[1:].split(" ", 1)
        cmd_body = open(f".claude/commands/{cmd}.md").read()
        prompt = cmd_body.replace("$ARGUMENTS", " ".join(args))
    else:
        prompt = user_input

    return anthropic.messages.create(
        model=models[tier],
        system=system,
        messages=[{"role": "user", "content": prompt}],
    )
```

## GPT / ChatGPT

Custom Instructions or API:

1. Paste CLAUDE.md into the "custom instructions" field (ChatGPT) or as `system` message (API)
2. Replace model IDs in `.hivemind/project.json > routing`:
   ```json
   "lite":     { "model": "gpt-4o-mini" },
   "standard": { "model": "gpt-4o" },
   "heavy":    { "model": "o1" }
   ```
3. When the user types `/status`, your orchestrator reads `.claude/commands/status.md` and injects it as the user message

### Without an orchestrator

Drop CLAUDE.md into Custom Instructions. Manually paste `.claude/commands/<name>.md` when you want to run a command. Less ergonomic but functional.

## Gemini

Same approach as GPT. Include CLAUDE.md in `systemInstruction`, replace routing models:

```json
"lite":     { "model": "gemini-2.0-flash" },
"standard": { "model": "gemini-2.0-pro" },
"heavy":    { "model": "gemini-2.0-ultra" }
```

Gemini-specific considerations:
- Context window is large — Tier 0/1 loading is still worthwhile for latency and cost
- Thinking modes: map `heavy` tier to Gemini's thinking mode when available

## Ollama / local

System prompt: CLAUDE.md. Routing:

```json
"lite":     { "model": "qwen2.5-coder:7b" },
"standard": { "model": "qwen2.5-coder:32b" },
"heavy":    { "model": "llama3.1:70b" }
```

Local models often have smaller context windows. Recommendations:

- Keep MANIFEST <200 tokens
- Enable `/compact` aggressively (threshold 14 days instead of 30)
- Use ultra compression as default (`communication.default_intensity = "ultra"`)

## Converting CLAUDE.md for non-Claude systems

For systems that don't auto-load a `CLAUDE.md` file, rename or copy to match:

| System | Target filename |
|--------|----------------|
| Cursor | `.cursorrules` |
| Windsurf | `.windsurfrules` |
| Continue | `~/.continue/config.json > systemMessage` |
| Generic | `SYSTEM_PROMPT.md` |

Content is the same — just the filename the host looks for changes.

## MCP Alternatives

MCP is Anthropic-native. For non-Claude hosts:

| MCP server | Non-Claude alternative |
|-----------|------------------------|
| filesystem | Your orchestrator's file tool |
| postgres | LangChain SQL tool / custom |
| github | GitHub API directly |
| slack | Slack SDK in orchestrator |
| notion | Notion API directly |

See `.hivemind/tools/mcp-catalog.md` for per-server notes.

## Enforcement Differences

HiveMind's railguards are **declarative** — they live in markdown and rely on the agent following them. In Claude Code with tool permissions, some railguards (forbidden operations) are hardened by the host. Without that hardening, railguards are soft guidance.

If you're running outside Claude Code:

- Use your orchestrator to gate `forbidden_operations` (refuse to execute them regardless of agent intent)
- Use CI hooks to enforce `forbidden_patterns_in_code`
- Log railguard hits to `blockers.md` from the orchestrator, not from the agent

## Testing Multi-Model Compatibility

1. Install HiveMind in a test project
2. Run `/init` with the target model
3. Run `/status`, `/focus <agent>`, `/decision`, `/handoff` in sequence
4. Verify MANIFEST is updated correctly after each
5. Run `/link <ID>` on the decisions created — should resolve via MANIFEST

If any step fails, the model is not following the protocol closely enough — consider upgrading to the next tier or switching hosts.

## Observations

- Claude models (Opus/Sonnet/Haiku) follow the protocol most faithfully
- GPT-4o-class models work well for Tier 0/1 operations
- Local models (<32B) struggle with MANIFEST atomicity — prefer hosted models for production use
- Reasoning-heavy commands (`/audit`, `/init`) benefit most from heavy-tier routing regardless of provider
