---
name: github-release-notes
description: Generate release notes and a CHANGELOG entry from merged pull requests and commits between two tags, and optionally create a draft GitHub release. Use when the user asks for "release notes", "changelog", or to "prepare release vX.Y.Z".
---

# GitHub release notes

## Steps
1. Determine the range:
   - `from`: latest release tag (`git describe --tags --abbrev=0`) or the user's value.
   - `to`: `HEAD` or the user's value.
   - Suggest the next version using SemVer: breaking change → major, `feat` → minor, otherwise patch.
2. Gather changes:
   - `git log --pretty=format:'%H %s' <from>..<to>`
   - For each referenced PR (`#123`), fetch title, labels and author via the `github` MCP server.
3. Group entries:
   - 🚨 **Breaking changes** (`!` in conventional commit or `breaking-change` label)
   - ✨ **Features** (`feat`, `enhancement`)
   - 🐛 **Fixes** (`fix`, `bug`)
   - 🔒 **Security** (`security` label)
   - 📚 **Docs** / 🧰 **Maintenance** (`docs`, `chore`, `ci`, `build`, `refactor`, `deps`)
4. Write the notes:
```markdown
## vX.Y.Z – YYYY-MM-DD
### 🚨 Breaking changes
- <description> (#123) @author
### ✨ Features
- ...
### 🐛 Fixes
- ...
**Full changelog**: https://github.com/OWNER/REPO/compare/<from>...<to>
```
5. Offer to (a) prepend the entry to `CHANGELOG.md` and (b) create a **draft** GitHub release for the tag. Never publish a non-draft release without explicit confirmation.
