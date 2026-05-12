# partner-decks

Pitch infrastructure for Hero Experiences partnership proposals. Each pitch is a static HTML deck hosted on a Hero-owned subdomain, sharing a common design system.

## Current state

| Pitch | Status | Path |
|---|---|---|
| National Geographic | In progress — Phase C (copy pass) | `/natgeo/` |

Future pitches will live as sibling folders (`/saudi/`, `/emaar/`, etc.) and inherit the shared design system at `/shared/`.

## How this repo is structured

```
partner-decks/
├── PRD.md                   Single source of truth for the active build
├── CLAUDE.md                Working context for Claude Code sessions
├── README.md                This file
├── .gitignore
│
├── shared/                  Design system shared across all pitches
│   ├── css/                 Tokens, base, components, print
│   ├── fonts/               Self-hosted webfonts
│   └── js/                  Vanilla navigation, lazy loading
│
├── natgeo/                  National Geographic pitch
│   ├── index.html
│   ├── slides/
│   ├── assets/images/
│   └── copy/                Source-of-truth Markdown copy per slide
│
└── reference/
    ├── natgeo-values.md     Nat Geo travel partnership values
    └── source-pack.md       Verified claims with citations
```

## Working with this repo

**Before any session, read these two files in order:**

1. `PRD.md` — the spec
2. `CLAUDE.md` — current state and active task

Every claim in any deck must be cited in `/reference/source-pack.md`. No invented facts.

## Build phases

- **Phase C — Copy pass.** Generate one Markdown file per slide under each pitch's `/copy/` folder. Validate against the PRD alignment checklist (Section 7) before committing.
- **Phase B1 — Design system foundation.** Build slides 1–5 of the first pitch to establish `/shared/`. No new design decisions after this phase.
- **Phase B2 — Full build.** Extend `/shared/` components to remaining slides.

## Deployment

- **Hosting:** GitHub Pages, served from `main`
- **Domain:** `partners.hero-experiences.com` (DNS pending Hero IT approval)
- **Auth:** Cloudflare Access with per-path policies
- **Analytics:** Cloudflare Access logs (who/when) + Plausible (what they did inside)

Each deck deploys to a sibling path: `partners.hero-experiences.com/natgeo-<suffix>/`, etc.

## Local development

```bash
# Open any pitch in a browser locally
cd natgeo
python -m http.server 8000
# Visit http://localhost:8000

# Commit per slide during the copy pass
git add natgeo/copy/<slide>.md
git commit -m "Slide <n>: <name>"
git push
```

## Confidentiality

This repository is private. Pitch materials are pre-meeting and not for public distribution. Do not share links, screenshots, or repo access outside the active pitch team.

---

*Internal — Hero Experiences Group.*
