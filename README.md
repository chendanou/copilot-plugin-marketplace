# Copilot plugin marketplace

A ready-to-publish **GitHub Copilot CLI plugin marketplace** containing one plugin, **`github-dev-toolkit`** (4 skills, 1 agent, 3 hooks, GitHub MCP server).

```
copilot-plugin-marketplace/
├── .github/
│   ├── plugin/marketplace.json        # marketplace catalog (required)
│   └── workflows/                     # CI validation + tagged releases
├── plugins/
│   └── github-dev-toolkit/
│       ├── plugin.json                # plugin manifest
│       ├── .mcp.json                  # GitHub MCP server (github.com)
│       ├── hooks.json                 # sessionStart / preToolUse / postToolUse
│       ├── hooks/scripts/*.js         # cross-platform Node hook scripts
│       ├── agents/github-maintainer.agent.md
│       ├── skills/
│       │   ├── github-pr-review/SKILL.md
│       │   ├── github-issue-triage/SKILL.md
│       │   ├── github-release-notes/SKILL.md
│       │   └── conventional-commits/SKILL.md
│       ├── README.md  CHANGELOG.md  LICENSE
├── scripts/validate.js                # manifest + skill + hook validation
└── tests/hooks.test.js                # hook smoke tests
```

## 1. Test locally
```bash
node scripts/validate.js
node tests/hooks.test.js
copilot plugin install ./plugins/github-dev-toolkit
copilot            # then: /plugin list, /skills list, /agent, /mcp
```
Re-run `copilot plugin install ./plugins/github-dev-toolkit` after each change (installed plugins are cached).

## 2. Personalise before publishing
- Replace `YOUR-ORG` in `.github/plugin/marketplace.json`, `plugins/github-dev-toolkit/plugin.json` and the READMEs.
- Optionally rename the marketplace (`name` in `marketplace.json`). Users install plugins as `PLUGIN@MARKETPLACE`, so keep the name stable once published.

## 3. Publish the marketplace
```bash
git init && git add . && git commit -m "feat: initial github-dev-toolkit plugin"
gh repo create YOUR-ORG/copilot-plugin-marketplace --public --source . --push
git tag v1.0.0 && git push --tags      # CI creates a GitHub release with a zipped plugin
```
Users then run:
```bash
copilot plugin marketplace add YOUR-ORG/copilot-plugin-marketplace
copilot plugin marketplace browse chenda-copilot-plugins
copilot plugin install github-dev-toolkit@chenda-copilot-plugins
```

## 4. (Optional) Submit to a public/community marketplace
To get listed in a community catalog such as `github/awesome-copilot`, open a PR there adding an entry that points at your repo:
```json
{
  "name": "github-dev-toolkit",
  "description": "PR review, issue triage, release notes & commit skills + safety hooks + GitHub MCP",
  "version": "1.0.0",
  "source": { "source": "github", "repo": "YOUR-ORG/copilot-plugin-marketplace", "ref": "v1.0.0", "path": "plugins/github-dev-toolkit" }
}
```
Follow that repository's contribution guidelines. For an organisation-wide rollout, admins can pin the marketplace with `extraKnownMarketplaces` / `enabledPlugins` in managed settings.

## 5. Releasing updates
1. Bump `version` in **both** `plugin.json` and `marketplace.json`, update `CHANGELOG.md`.
2. `node scripts/validate.js` (fails if versions differ).
3. Tag and push (`git tag v1.1.0 && git push --tags`). Users run `copilot plugin update github-dev-toolkit`.
