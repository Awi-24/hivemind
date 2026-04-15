# MCP Catalog

> List of recommended MCP (Model Context Protocol) servers for Claude Code.
> For non-Claude environments, equivalent tools are listed in the **Alternatives** column.
>
> Enable MCPs by adding them to `project.json > mcps.enabled` and configuring in your Claude settings.

---

## Core Development

| MCP | Purpose | Install | Alternatives (GPT/Gemini) |
|-----|---------|---------|--------------------------|
| `filesystem` | Read/write local files with path controls | Built-in | Native file tools |
| `github` | PRs, issues, branches, repo management | `npx @modelcontextprotocol/server-github` | GitHub API via function calling |
| `git` | Git operations, diffs, log | `npx @modelcontextprotocol/server-git` | Shell tool calls |

## Databases

| MCP | Purpose | Install | Alternatives |
|-----|---------|---------|--------------|
| `postgres` | Query PostgreSQL databases | `npx @modelcontextprotocol/server-postgres` | SQL function tools |
| `sqlite` | Query SQLite databases | `npx @modelcontextprotocol/server-sqlite` | SQL function tools |
| `redis` | Redis operations | Community MCP | Redis CLI via shell |
| `mongodb` | MongoDB queries | Community MCP | MongoDB shell |

## Project Management

| MCP | Purpose | Install | Alternatives |
|-----|---------|---------|--------------|
| `notion` | Read/write Notion pages | `@anthropic-ai/mcp-server-notion` | Notion API |
| `linear` | Issue tracking, sprints | Community MCP | Linear API |
| `jira` | Jira issue management | Community MCP | Jira REST API |
| `github-projects` | GitHub Projects boards | Part of `github` MCP | GitHub API |

## Communication

| MCP | Purpose | Install | Alternatives |
|-----|---------|---------|--------------|
| `slack` | Send messages, read channels | Community MCP | Slack API |
| `google-drive` | Read/write Drive files | `@anthropic-ai/mcp-server-gdrive` | Drive API |

## Cloud & Infrastructure

| MCP | Purpose | Install | Alternatives |
|-----|---------|---------|--------------|
| `aws` | AWS service management | Community MCP | AWS CLI / boto3 |
| `vercel` | Deployment management | Community MCP | Vercel CLI |
| `docker` | Container management | Community MCP | Docker CLI |
| `kubernetes` | k8s cluster operations | Community MCP | kubectl |

## Web & Search

| MCP | Purpose | Install | Alternatives |
|-----|---------|---------|--------------|
| `web-search` | Web search queries | Built-in (Claude) | Search APIs |
| `fetch` | HTTP requests to URLs | `npx @modelcontextprotocol/server-fetch` | HTTP function tools |
| `puppeteer` | Browser automation | `npx @modelcontextprotocol/server-puppeteer` | Playwright/Selenium |

---

## Setup Guide (Claude Code)

### 1. Add to Claude settings (`~/.claude/settings.json`):

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "<your-token>"
      }
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://user:pass@localhost/dbname"]
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/your/project"]
    }
  }
}
```

### 2. Enable in `project.json`:
```json
{
  "mcps": {
    "enabled": ["github", "postgres", "filesystem"]
  }
}
```

---

## Agent MCP Recommendations

| Agent | Recommended MCPs |
|-------|-----------------|
| CTO | github, notion, linear |
| Lead Dev | github, filesystem, git |
| Product Manager | notion, linear, github |
| Backend Dev | postgres, filesystem, git, github |
| Frontend Dev | filesystem, git, github, puppeteer |
| DevOps | docker, kubernetes, aws, github |
| Security | filesystem, git, github, fetch |
| QA | puppeteer, github, filesystem |
| Data | postgres, filesystem |
| Docs | filesystem, github, notion |
| Mobile | filesystem, github |
| AI/ML | filesystem, fetch, postgres |
