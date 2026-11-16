---
name: github-pr-review
description: Review a GitHub pull request end-to-end (diff, CI status, linked issues) and post a structured review. Use when the user asks to "review PR #123", "check this pull request", or shares a github.com/.../pull/N URL.
---

# GitHub pull request review

## Inputs
- PR reference: number, `owner/repo#N`, or URL. If only a number is given, resolve `owner/repo` from `git config --get remote.origin.url`.

## Steps
1. **Collect context** with the `github` MCP server:
   - PR details (title, body, author, base/head, draft state, labels).
   - Changed files and diff. For large PRs (>30 files) review by directory and say so.
   - Status checks / workflow runs for the head SHA.
   - Linked issues referenced in the body (`Fixes #N`, `Closes #N`).
2. **Review** each changed file against this checklist:
   - Correctness and edge cases; error handling.
   - Security: injection, secrets, authz checks, unsafe deserialization, dependency changes.
   - Tests: are new code paths covered? Are tests meaningful?
   - Readability, naming, dead code, consistency with the surrounding code.
   - Docs/CHANGELOG updated when behaviour changes.
3. **Classify** findings as `blocking`, `should-fix`, or `nit`. Cite `path:line` for each.
4. **Draft the review** using the template below and show it to the user.
5. **Only after the user confirms**, submit via the MCP server as `COMMENT`, `APPROVE` or `REQUEST_CHANGES` (request changes if any blocking finding exists).

## Output template
```markdown
## Summary
<1-3 sentences: what the PR does and overall verdict>

## CI
<passing / failing checks, with the failing job names>

## Findings
### Blocking
- `path/file.ts:42` – <issue> → <suggested fix>
### Should fix
- ...
### Nits
- ...

## Tests
<coverage assessment>
```
