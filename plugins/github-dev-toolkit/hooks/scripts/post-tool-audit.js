#!/usr/bin/env node
// postToolUse hook: append a compact JSON Lines audit record for every tool call.
"use strict";
const fs = require("fs");
const path = require("path");
const { readStdin, dataDir, respond, argsToText } = require("./lib");

try {
  if (process.env.GDT_AUDIT === "off") { respond({}); process.exit(0); }
  const input = readStdin();
  const record = {
    ts: new Date(input.timestamp || Date.now()).toISOString(),
    session: input.sessionId || input.session_id,
    cwd: input.cwd,
    tool: input.toolName || input.tool_name,
    args: argsToText(input.toolArgs ?? input.tool_input).slice(0, 500),
    result: (input.toolResult && input.toolResult.resultType) || "success",
  };
  fs.appendFileSync(path.join(dataDir(), "audit.jsonl"), JSON.stringify(record) + "\n");
} catch { /* never break the session */ }
respond({});
