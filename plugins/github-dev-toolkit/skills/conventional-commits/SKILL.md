---
name: conventional-commits
description: Write Conventional Commits messages from the staged diff and open a pull request with a matching title and description. Use when the user asks to "commit this", "write a commit message", or "open a PR for my changes".
---

# Conventional commits & PR creation

## Commit message
1. Inspect `git diff --staged` (if nothing is staged, show `git status` and ask what to stage).
2. Choose a type: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
3. Optional scope = the main package/folder touched.
4. Format:
```
<type>(<scope>): <imperative summary, max 72 chars, no period>

<body: what and why, wrapped at 72 chars>

<footer: BREAKING CHANGE: ..., Fixes #123>
```
5. Show the message, then run `git commit -m ...` after the user agrees.

## Pull request
1. If on a protected branch (`main`, `master`), create a branch `<type>/<short-slug>` first.
2. Push the branch (never force-push to protected branches; the plugin hook will block it).
3. Create the PR with the `github` MCP server (or `gh pr create`):
   - Title = the commit summary.
   - Body: **What**, **Why**, **How tested**, **Checklist** (tests, docs, changelog), and `Fixes #N` if applicable.
   - Open as **draft** unless the user says it is ready for review.
