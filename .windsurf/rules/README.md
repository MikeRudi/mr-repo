# Windsurf Rules — MakeReign

This folder contains workspace rules that Windsurf's Cascade reads automatically for every session in this repo. Every rule applies to every model Cascade can run (Claude, GPT, Gemini, etc.).

## Files in this folder

- `roadmap.md` — Enforces the roadmap in `to-do.human.md` and `to-do.ai.md`. No work happens outside the roadmap. No scope creep. Other agents are policed.
- `deploy.md` — Enforces the GitHub → Vercel deploy workflow and the database/migration safety rules. All publishing goes through this path.

## How to maintain

- Edit the `.md` files directly. Windsurf re-reads them at the start of each new session (and on file change in most builds).
- Keep each rule concise. If a rule gets very long, Windsurf may truncate it.
- Commit changes alongside any process change so history is traceable.

## Scope

These rules apply **only inside Windsurf Cascade**. Other tools (ChatGPT web, Claude web, Cursor, etc.) do not read them automatically. If we adopt another tool later, we mirror the rules into that tool's expected location (`CLAUDE.md`, `.cursorrules`, `AGENTS.md`, etc.) — but `to-do.ai.md` and these rule files remain the single source of truth.
