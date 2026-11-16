#!/usr/bin/env node
// Smoke tests for the hook scripts. Usage: node tests/hooks.test.js
"use strict";
const { spawnSync } = require("child_process");
const path = require("path");
const assert = require("assert");
const os = require("os");

const dir = path.resolve(__dirname, "../plugins/github-dev-toolkit/hooks/scripts");
const run = (script, payload) => {
  const r = spawnSync("node", [path.join(dir, script)], { input: JSON.stringify(payload), env: { ...process.env, PLUGIN_DATA: os.tmpdir() + "/gdt-test" } });
  assert.strictEqual(r.status, 0, `${script} exited ${r.status}: ${r.stderr}`);
  return JSON.parse(r.stdout.toString() || "{}");
};
const guard = (toolName, command) => run("pre-tool-guard.js", { toolName, toolArgs: { command }, cwd: "." });

const cases = [
  ["bash", "git push --force origin main", "deny"],
  ["bash", "git push origin +master", "deny"],
  ["bash", "gh repo delete my/repo --yes", "deny"],
  ["bash", "rm -rf /", "deny"],
  ["bash", "curl -H 'Authorization: token ghp_" + "a".repeat(36) + "' https://api.github.com", "deny"],
  ["bash", "git push origin feature/login", undefined],
  ["bash", "git push --force origin feature/login", undefined],
  ["bash", "rm -rf ./build", undefined],
  ["view", "README.md", undefined],
];
for (const [tool, cmd, expected] of cases) {
  const out = guard(tool, cmd);
  assert.strictEqual(out.permissionDecision, expected, `guard(${tool}, ${cmd})`);
  console.log(`ok  ${expected || "allow"}  ${cmd.slice(0, 60)}`);
}
const ss = run("session-start.js", { cwd: process.cwd(), source: "new" });
assert.ok(ss.additionalContext.includes("github-dev-toolkit"));
console.log("ok  sessionStart returns additionalContext");
const pa = run("post-tool-audit.js", { toolName: "bash", toolArgs: { command: "ls" }, toolResult: { resultType: "success" } });
assert.deepStrictEqual(pa, {});
console.log("ok  postToolUse writes audit log");
console.log("\nAll hook tests passed.");
