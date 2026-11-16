#!/usr/bin/env node
// preToolUse hook: deny dangerous shell commands before they run.
// Fail-safe: any unexpected error results in an empty response (default permission flow).
"use strict";
const { readStdin, respond, argsToText } = require("./lib");

const PROTECTED = (process.env.GDT_PROTECTED_BRANCHES || "main,master,release,production")
  .split(",").map((s) => s.trim()).filter(Boolean);
const prot = PROTECTED.map((b) => b.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");

const RULES = [
  { re: new RegExp(`git\\s+push\\b[^\\n]*(--force\\b|--force-with-lease\\b|\\s-f\\b)[^\\n]*\\b(${prot})\\b`), why: `Force-push to a protected branch (${PROTECTED.join(", ")}) is blocked by github-dev-toolkit. Open a pull request instead.` },
  { re: new RegExp(`git\\s+push\\b[^\\n]*\\s\\+(${prot})\\b`), why: "Force-push via +refspec to a protected branch is blocked." },
  { re: /\bgh\s+repo\s+delete\b/, why: "Deleting a repository is blocked. Do this manually in the GitHub UI if it is really intended." },
  { re: /\bgh\s+api\b[^\n]*-X\s*DELETE\b[^\n]*\/repos\/[^/\s]+\/[^/\s]+\/?(\s|$)/, why: "Deleting a repository through the API is blocked." },
  { re: /\brm\s+-[a-z]*r[a-z]*f?[a-z]*\s+(\/|~|\$HOME)(\s|$)/i, why: "Recursive deletion of / or the home directory is blocked." },
  { re: /\bgit\s+reset\s+--hard\s+origin\/(main|master)\b[^\n]*&&[^\n]*git\s+push\s+(-f|--force)/, why: "Hard reset + force push is blocked." },
  { re: /(ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{60,}|gho_[A-Za-z0-9]{36}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----)/, why: "The command appears to contain a secret (token or private key). Use an environment variable or secret store instead." },
];

try {
  const input = readStdin();
  const tool = String(input.toolName || input.tool_name || "").toLowerCase();
  const text = argsToText(input.toolArgs ?? input.tool_input);

  // Secrets are checked for every tool (e.g. file writes), the rest only for shell tools.
  const isShell = ["bash", "powershell", "shell", "terminal"].includes(tool);
  for (const rule of RULES) {
    const secretRule = rule === RULES[RULES.length - 1];
    if (!isShell && !secretRule) continue;
    if (rule.re.test(text)) {
      respond({ permissionDecision: "deny", permissionDecisionReason: rule.why });
      process.exit(0);
    }
  }
  respond({});
} catch {
  respond({});
}
