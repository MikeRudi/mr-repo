# Windsurf Rules — MakeReign

This folder contains the canonical workspace rules for this repo. Windsurf's Cascade reads them automatically, but they are written for **every language model or coding agent** that works in this workspace.

## Files in this folder

- `roadmap.md` — Enforces the roadmap in `to-do.human.md` and `to-do.ai.md`. No work happens outside the roadmap. No scope creep. Other agents are policed.
- `deploy.md` — Enforces the GitHub → Vercel deploy workflow and the database/migration safety rules. All publishing goes through this path.

## How to maintain

- Edit the `.md` files directly. Windsurf re-reads them at the start of each new session (and on file change in most builds).
- Keep each rule concise. If a rule gets very long, Windsurf may truncate it.
- Commit changes alongside any process change so history is traceable.

## Scope

These rules apply to **all agents and models** working in this repo. Some tools do not read `.windsurf/rules` automatically, so the agent must manually read these files before acting when the user points at the rules folder or asks for deploy/roadmap-sensitive work.

If we adopt another tool later, mirror these rules into that tool's expected location (`CLAUDE.md`, `.cursorrules`, `AGENTS.md`, etc.) — but `to-do.ai.md` and these rule files remain the single source of truth.
