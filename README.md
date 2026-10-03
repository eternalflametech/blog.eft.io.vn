# Eternal Flame Tech Blog — AI Agent Rules & Documentation Suite

Repository containing rules, skill bundles, workflows, and technical documentation for AI coding agents (Cursor and Antigravity) working on the **Eternal Flame Tech Blog** (EFT Blog).

## Repository Architecture

```
├── AGENTS.md                  # Unified root directives (session entry point)
├── .cursor/
│   ├── rules/                 # Cursor context-aware rules (.mdc)
│   └── skills/                # Cursor skill bundles
├── .agents/
│   ├── rules/                 # Antigravity rules (.md)
│   └── skills/                # Antigravity skill bundles
├── docs/                      # Technical guides & specifications
└── assets/                    # Project assets (e.g. assets/logo.png)
```

## Quick Reference
- **Tech Stack:** Rust Axum (backend), Next.js ISR (frontend), Tailwind CSS, PostgreSQL SQLx, Redis Bincode, Docker.
- **Git Commits:** Signed with SSH key as `nmkdeveloper <nguyenminhkhoi.nmk.dev@gmail.com>`.
- **Target OS:** Debian 13.
