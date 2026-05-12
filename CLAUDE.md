# CLAUDE.md — Working Context

## Project

`partner-decks` — Hero Experiences partner-portal repo. First build: pitch deck proposing a partnership between Hero Experiences (Dubai) and National Geographic to create the world's definitive desert expedition.

Hosted at `partners.hero-experiences.com/natgeo-<suffix>/` (subdomain pending Hero internal DNS approval). Auth via Cloudflare Access (confirmed available).

## Source of truth

`PRD.md` (currently **v4**) is the single source of truth. Read it before every session.

## Current state

- [x] PRD v1 drafted
- [x] PRD v2 — hosted HTML locked as canonical format
- [x] PRD v3 — source pack with verification status, Why-Now and The-Ask slides, Cloudflare Access locked
- [x] PRD v4 — aesthetic direction locked as Editorial Cinematic; Land Rovers minimised; coverage of original 11 narrative pillars verified; new slides 3.5 (Why Arabia) and 8.5 (Conservation/Culture/Education)
- [ ] **Phase C — Copy pass** (17 section files under `/natgeo/copy/`)
- [ ] **Phase B1 — HTML foundation** (slides 1–5b, builds `/shared/` design system)
- [ ] Phase B2 — Full HTML build (slides 6 through 13)
- [ ] Source pack verification — Jcamp confirms each pending/needs-source claim
- [ ] PDF export validated from print stylesheet
- [ ] Subdomain DNS approved by Hero IT
- [ ] Cloudflare Access configured per-path
- [ ] Plausible Analytics account created and tracking script integrated
- [ ] Real imagery sourced and integrated

## Active task

**Phase C — Copy pass.** Generate one Markdown file per slide under `/natgeo/copy/`, conforming to PRD Section 8.

Execution order (17 slides):

1. `01-cover.md`
2. `02-paradox.md`
3. `03-vision.md`
4. `03-5-why-arabia.md` ← new in v4
5. `04-why-natgeo.md`
6. `05a-why-hero.md`
7. `05b-recognition.md`
8. `06-problem.md`
9. `06-5-why-now.md`
10. `07-solution.md`
11. `08-experience-framework.md`
12. `08-5-conservation-culture-education.md` ← new in v4
13. `09-unmatched.md`
14. `10-commercial-value.md`
15. `11-implementation.md`
16. `12-big-idea.md`
17. `12-5-the-ask.md`
18. `13-closing.md`

After each file, run the alignment checklist (PRD Section 7). Stop and confirm with Jcamp after `01-cover.md` before continuing.

## Aesthetic — Editorial Cinematic (locked v4)

- The deck looks like an unpublished Nat Geo travel feature
- Photography is cinematic, atmospheric, documentary (never advertising-lit)
- Typography is editorial: serif display + warm sans
- Color from place, not brand: bone, ink, deep sand, warm rust (no gold-on-black)
- Rhythm alternates: immersive slides vs. restrained slides — see PRD 3.5 table for per-slide mode
- Zero decoration: no icons, no badges, no gradients, no rounded corners, no shadows
- Test: every slide should plausibly appear in a Nat Geo travel feature

## Format and architecture (locked)

- **Canonical:** hosted HTML at Hero-owned subdomain
- **Derived:** PDF via browser print-to-PDF
- **Repo:** partner-portal with `/shared/` design system + `/natgeo/` deck + sibling paths for future pitches
- **Build:** vanilla HTML/CSS, minimal JS, mobile-first, no frameworks
- **Hosting:** GitHub Pages from Hero Experiences org → `partners.hero-experiences.com`
- **Auth:** Cloudflare Access, per-path policies, email one-time PIN
- **Analytics:** Cloudflare Access logs (who/when) + Plausible (what they did inside)

## Hard rules (do not violate)

- No marketing adjectives (PRD 6.1 banned list — includes *immersive* unless earned by imagery)
- No exclamation points
- British English spelling
- Claims with status `verified` from source pack only ship to final copy
- Claims `pending` may appear in drafts flagged `[pending verification]`
- Claims `needs-source` must never appear in shipped copy
- Do not claim formal eligibility for any specific Nat Geo programme
- One idea per slide
- Sentence case for headlines (except cover labels in small caps)
- Word "journey" banned as a noun
- **Land Rovers: one minimal mention in Slide 5a only, max 4 words, no CO₂ figure, no imagery** (PRD 6.5)
- No Canva-default aesthetics
- No gold-on-black or black-on-gold
- Mobile-first build discipline
- WebP + JPG fallback for every image
- Self-hosted webfonts
- No Google Analytics
- Honor each slide's Immersive/Restrained mode per PRD 3.5

## Style references

- National Geographic Traveler magazine (primary)
- Nat Geo travel feature articles
- Avoid: AMAN-style pure atmosphere, Aesop-style pure restraint, Dubai luxury black/gold

## Resolved

- ✅ `hero-experiences.com` on Cloudflare (confirmed 2026-05-12) — Cloudflare Access locked
- ✅ Audience: "National Geographic travel, licensing, and partnership leadership"
- ✅ Unique Lodges framing softened to values alignment
- ✅ Explicit ask added (Slide 12.5)
- ✅ Why-now angle added (Slide 6.5)
- ✅ Source pack format defined with verification status
- ✅ Aesthetic locked as Editorial Cinematic
- ✅ Land Rovers de-emphasised per Hero preference
- ✅ Original 11 narrative pillars cross-checked against slide flow (see PRD 2.5)

## Open questions (for Jcamp)

1. **Source pack verification** — every `pending` or `needs-source` claim needs Jcamp input. Priority: current guest count, exact award years, Michelin chef name, ecotourism certifying body.
2. **Named Nat Geo partnership target** — even a hypothetical name strengthens Slides 4 and 12.5.
3. **Photography Hero already owns** — determines real vs. placeholder imagery.
4. **Final subdomain name** — working assumption `partners.hero-experiences.com`. Alternatives: `pitch.`, `proposals.`, `expedition.`
5. **Internal IT permission request** — to be drafted when Jcamp is ready. Per PRD 11.6.

## Session log

| Date | Note |
|---|---|
| 2026-05-11 | PRD v1 drafted from Jcamp's brief + research. |
| 2026-05-12 | PRD v2 — hosted HTML as canonical format, partner-portal repo structure, Section 11 hosting added. |
| 2026-05-12 | PRD v3 — Unique Lodges softened, audience broadened, source pack, Why-Now and The-Ask slides, Cloudflare Access locked. |
| 2026-05-12 | PRD v4 — Editorial Cinematic locked as aesthetic. Land Rovers minimised. Slide 3.5 (Why Arabia) and 8.5 (Conservation/Culture/Education) added to cover original narrative pillars properly. Per-slide Immersive/Restrained mode specified. Color shifted from black/gold to desert palette. 17 slides total. |
