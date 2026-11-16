# github-dev-toolkit

A GitHub Copilot CLI plugin that bundles:

| Component | What it does |
|-----------|--------------|
| **Skill** `github-pr-review` | Structured PR review (diff, CI, linked issues) with blocking / should-fix / nit findings |
| **Skill** `github-issue-triage` | Classifies, labels, prioritises and de-duplicates open issues |
| **Skill** `github-release-notes` | Builds release notes + CHANGELOG entry between tags; creates a draft release |
| **Skill** `conventional-commits` | Writes Conventional Commit messages and opens a well-formed PR |
| **Agent** `github-maintainer` | Maintainer persona that orchestrates the skills |
| **Hook** `sessionStart` | Injects git remote/branch and GitHub-auth status into the session |
| **Hook** `preToolUse` | Blocks force-push to protected branches, `gh repo delete`, `rm -rf /`, and commands containing secrets |
| **Hook** `postToolUse` | Writes a JSON Lines audit log of tool calls |
| **MCP** `github` | GitHub's remote MCP server at `https://api.githubcopilot.com/mcp/` (github.com) |

## Requirements
- GitHub Copilot CLI (`copilot`) with plugin support
- Node.js 18+ on `PATH` (used by the hook scripts; already present if you installed the CLI with npm)
- A GitHub token exported as `GITHUB_PERSONAL_ACCESS_TOKEN` (fine-grained PAT with the repo permissions you need: Contents, Issues, Pull requests, Actions – read, plus write for anything you want Copilot to change)

```bash
export GITHUB_PERSONAL_ACCESS_TOKEN=github_pat_xxx      # macOS / Linux
$env:GITHUB_PERSONAL_ACCESS_TOKEN = "github_pat_xxx"    # Windows PowerShell
```

## Install
```bash
# from the marketplace
copilot plugin marketplace add YOUR-ORG/copilot-plugin-marketplace
copilot plugin install github-dev-toolkit@chenda-copilot-plugins

# or directly from a local checkout while developing
copilot plugin install ./plugins/github-dev-toolkit
```
Verify in an interactive session: `/plugin list`, `/skills list`, `/agent`, `/mcp`.

## Configuration
| Environment variable | Default | Purpose |
|----------------------|---------|---------|
| `GITHUB_PERSONAL_ACCESS_TOKEN` | – | Auth for the `github` MCP server |
| `GDT_PROTECTED_BRANCHES` | `main,master,release,production` | Branches the guard hook protects from force-push |
| `GDT_AUDIT` | `on` | Set to `off` to disable the audit log |

The audit log is written to `$PLUGIN_DATA/audit.jsonl` or, if that is not provided, `~/.copilot/plugin-data/github-dev-toolkit/audit.jsonl`.

### MCP toolsets
`.mcp.json` sends `X-MCP-Toolsets: repos,issues,pull_requests,actions,code_security,context`. Edit the header to widen or narrow what the server exposes. For GitHub Enterprise Server or an offline setup, replace the server with the local Docker image `ghcr.io/github/github-mcp-server` (stdio).

> Copilot CLI already ships a built-in GitHub MCP server. This plugin's server is named `github` and gives you explicit control over the toolsets and token; disable one of them if you see duplicate tools.

## Example prompts
- "Review PR #42"
- "Triage the unlabeled issues in this repo"
- "Prepare release notes for v1.4.0"
- "Commit my staged changes and open a draft PR"
- `/agent github-maintainer`

## License
MIT
