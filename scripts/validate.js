#!/usr/bin/env node
// Validates the marketplace catalog and every plugin it lists. Usage: node scripts/validate.js
"use strict";
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const errors = [];
const NAME = /^[a-z0-9][a-z0-9-]{0,62}[a-z0-9]$/;
const readJson = (p) => { try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch (e) { errors.push(`${path.relative(root, p)}: ${e.message}`); return null; } };
const frontmatter = (p) => {
  const m = fs.readFileSync(p, "utf8").match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  return Object.fromEntries(m[1].split(/\r?\n/).map((l) => l.match(/^([\w-]+):\s*(.*)$/)).filter(Boolean).map((x) => [x[1], x[2]]));
};

const mp = readJson(path.join(root, ".github/plugin/marketplace.json"));
if (mp) {
  if (!NAME.test(mp.name || "")) errors.push("marketplace.name must be kebab-case, max 64 chars");
  if (!mp.owner || !mp.owner.name) errors.push("marketplace.owner.name is required");
  if (!Array.isArray(mp.plugins) || !mp.plugins.length) errors.push("marketplace.plugins must be a non-empty array");
  for (const entry of mp.plugins || []) {
    const dir = path.join(root, entry.source);
    const pj = readJson(path.join(dir, "plugin.json"));
    if (!pj) continue;
    const tag = `plugin '${entry.name}'`;
    if (pj.name !== entry.name) errors.push(`${tag}: name differs between marketplace.json and plugin.json`);
    if (entry.version && pj.version !== entry.version) errors.push(`${tag}: version differs (${entry.version} vs ${pj.version})`);
    if (!NAME.test(pj.name || "")) errors.push(`${tag}: invalid name`);
    if ((pj.description || "").length > 1024) errors.push(`${tag}: description > 1024 chars`);

    const skillsDir = path.join(dir, pj.skills || "skills/");
    if (fs.existsSync(skillsDir)) {
      for (const s of fs.readdirSync(skillsDir)) {
        const f = path.join(skillsDir, s, "SKILL.md");
        if (!fs.existsSync(f)) { errors.push(`${tag}: skills/${s} has no SKILL.md`); continue; }
        const fm = frontmatter(f);
        if (!fm || !fm.name || !fm.description) errors.push(`${tag}: skills/${s}/SKILL.md needs name + description frontmatter`);
        else if (fm.name !== s) errors.push(`${tag}: skill folder '${s}' != frontmatter name '${fm.name}'`);
      }
    }
    const agentsDir = path.join(dir, pj.agents || "agents/");
    if (fs.existsSync(agentsDir)) {
      for (const a of fs.readdirSync(agentsDir).filter((x) => x.endsWith(".agent.md"))) {
        const fm = frontmatter(path.join(agentsDir, a));
        if (!fm || !fm.description) errors.push(`${tag}: agents/${a} needs description frontmatter`);
      }
    }
    if (typeof pj.hooks === "string") {
      const h = readJson(path.join(dir, pj.hooks));
      if (h) {
        if (h.version !== 1) errors.push(`${tag}: hooks version must be 1`);
        for (const [ev, list] of Object.entries(h.hooks || {})) if (!Array.isArray(list)) errors.push(`${tag}: hooks.${ev} must be an array`);
      }
    }
    if (typeof pj.mcpServers === "string") {
      const m = readJson(path.join(dir, pj.mcpServers));
      if (m && (!m.mcpServers || !Object.keys(m.mcpServers).length)) errors.push(`${tag}: no mcpServers defined`);
    }
    console.log(`checked ${tag} v${pj.version}`);
  }
}

if (errors.length) { console.error("\nValidation failed:\n- " + errors.join("\n- ")); process.exit(1); }
console.log("\nAll checks passed.");
