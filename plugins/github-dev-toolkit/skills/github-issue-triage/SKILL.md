---
name: github-issue-triage
description: Triage open GitHub issues - classify, label, detect duplicates, and suggest priority and owner. Use when the user asks to "triage issues", "label new issues", or "find duplicate issues" in a repository.
---

# GitHub issue triage

## Steps
1. Resolve the repository (`owner/repo`) from the user or the local git remote.
2. Using the `github` MCP server, list open issues that have **no labels** or the `needs-triage` label (default: newest 20; ask before going beyond 100).
3. Fetch the repository's existing labels. Never invent labels; map to the closest existing one, and propose new labels separately.
4. For each issue determine:
   - **Type**: bug / feature / question / docs / chore.
   - **Area**: from file paths, stack traces or keywords mentioned.
   - **Priority**: `P0` (outage/security/data loss), `P1` (major broken flow, no workaround), `P2` (workaround exists), `P3` (nice to have).
   - **Duplicates**: search issues (open and closed) for similar titles/error messages; report candidates with confidence.
   - **Missing info**: reproduction steps, version, environment.
5. Present a triage table to the user:

| # | Title | Type | Area | Priority | Proposed labels | Duplicate of | Action |
|---|-------|------|------|----------|-----------------|--------------|--------|

6. After confirmation, apply labels and post comments (e.g. asking for repro steps, or linking the duplicate). Close duplicates only if the user explicitly approves.

## Rules
- Be kind and specific in comments; thank the reporter.
- Do not assign people unless the user names them or CODEOWNERS clearly identifies an owner.
