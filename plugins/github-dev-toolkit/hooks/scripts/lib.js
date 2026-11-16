// Shared helpers for github-dev-toolkit hooks. No external dependencies.
"use strict";
const fs = require("fs");
const os = require("os");
const path = require("path");

function readStdin() {
  try {
    const raw = fs.readFileSync(0, "utf8");
    return raw.trim() ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function dataDir() {
  const base =
    process.env.PLUGIN_DATA ||
    process.env.COPILOT_PLUGIN_DATA ||
    path.join(process.env.COPILOT_HOME || path.join(os.homedir(), ".copilot"), "plugin-data", "github-dev-toolkit");
  try { fs.mkdirSync(base, { recursive: true }); } catch { /* ignore */ }
  return base;
}

// Emit exactly ONE JSON object on stdout (the CLI parses stdout as a single document).
function respond(obj) {
  process.stdout.write(JSON.stringify(obj || {}));
}

function argsToText(toolArgs) {
  if (toolArgs == null) return "";
  if (typeof toolArgs === "string") {
    try { return argsToText(JSON.parse(toolArgs)); } catch { return toolArgs; }
  }
  if (typeof toolArgs === "object") {
    return toolArgs.command || toolArgs.cmd || toolArgs.script || JSON.stringify(toolArgs);
  }
  return String(toolArgs);
}

module.exports = { readStdin, dataDir, respond, argsToText };
