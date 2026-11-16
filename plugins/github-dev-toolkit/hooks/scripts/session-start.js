#!/usr/bin/env node
// sessionStart hook: injects repository + GitHub auth context into the session.
"use strict";
const { execSync } = require("child_process");
const { readStdin, respond } = require("./lib");

const input = readStdin();
const cwd = input.cwd || process.cwd();
const run = (cmd) => {
  try { return execSync(cmd, { cwd, stdio: ["ignore", "pipe", "ignore"], timeout: 4000 }).toString().trim(); }
  catch { return ""; }
};

const lines = ["[github-dev-toolkit] Session context:"];
const remote = run("git config --get remote.origin.url");
const branch = run("git rev-parse --abbrev-ref HEAD");
if (remote) lines.push(`- Git remote: ${remote}`);
if (branch) lines.push(`- Current branch: ${branch}`);
if (!process.env.GITHUB_PERSONAL_ACCESS_TOKEN) {
  lines.push("- WARNING: GITHUB_PERSONAL_ACCESS_TOKEN is not set, so the plugin's 'github' MCP server cannot authenticate. Tell the user to export it if a GitHub MCP tool fails.");
} else {
  lines.push("- GitHub MCP server 'github' is configured (github.com).");
}
lines.push("- Safety: a preToolUse hook blocks force-pushes to protected branches, repo deletion and obvious secret leaks.");

respond({ additionalContext: lines.join("\n") });
