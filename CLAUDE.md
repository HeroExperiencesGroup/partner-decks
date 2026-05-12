# CLAUDE.md — Working Context

**Working context version:** v4.2 (PRD at v4.1)
**Last updated:** May 12, 2026

**v4.2 changes:** Phase C complete; PRD bumped to v4.1 with source-pack verifications from hero-experiences.com/why-us screenshots; canonical source pack created at `/reference/source-pack.md`; Slide 5b restructured to two groupings (travel + sustainability).
**v4.1 changes:** Added Execution model section — Opus 4.7 as supervisor, Haiku 4.5 as worker for structured generation. Includes which slides Opus drafts directly vs. which get Haiku-then-review.

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
- [x] **Phase C — Copy pass** (18 section files under `/natgeo/copy/`; awaiting final approval before B1)
- [ ] **Phase B1 — HTML foundation** (slides 1–5b, builds `/shared/` design system)
- [ ] Phase B2 — Full HTML build (slides 6 through 13)
- [~] Source pack verification — partial (2026-05-12: award years verified via hero-experiences.com/why-us screenshots; awarding-body citation links still pending; needs-source items #8 ecotourism cert, #14 Michelin chef outstanding)
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

## Execution model — supervisor + worker

Claude Code operates as **Opus 4.7 supervising Haiku 4.5 subagents** for this project. The pattern is cost-efficient and parallelisable, but only works because the PRD is tight enough that workers can execute against a clear spec.

### Roles

**Opus 4.7 (supervisor):**
- Reads PRD.md and this file every session
- Plans the work, spawns subagents, reviews their output
- Makes all judgement calls: PRD interpretation, strategic positioning, editorial voice, source-pack decisions
- Drafts the strategic/rhetorical slides directly (see "Opus drafts directly" below)
- Final reviewer on every artifact before it's shown to Jcamp

**Haiku 4.5 (worker subagents):**
- Spawned with a specific, scoped task and the relevant PRD section as context
- Generates structured copy or HTML following an established pattern
- Returns output for supervisor review
- Does not make interpretive decisions — escalates ambiguity back to supervisor

### Workflow — Phase C (copy pass)

For each slide, **except those listed under "Opus drafts directly":**

1. Supervisor reads the PRD spec for that slide (Section 8) and the source pack rules (Section 6.4)
2. Supervisor spawns a Haiku subagent with:
   - The exact slide spec from PRD Section 8
   - The relevant approved facts from `/reference/source-pack.md`
   - PRD Section 6 (content rules) and Section 7 (alignment checklist)
3. Subagent writes the Markdown file to `/natgeo/copy/`
4. Supervisor reviews the output against:
   - PRD Section 6.1 banned-word and voice rules
   - PRD Section 7 alignment checklist (every item)
   - PRD Section 6.4 source-pack compliance (every claim cited or flagged)
   - PRD Section 6.5 Land Rover rule
5. If violations: supervisor returns specific corrections to subagent, re-runs (max 2 retries)
6. If clean after retries: supervisor presents to Jcamp for approval
7. If still violating after 2 retries: supervisor drafts directly and notes the pattern for review

### Workflow — Phase B (HTML build)

**B1 (foundation) — Opus-led, no subagents.** The design system decisions (tokens, components, layout primitives) are too consequential to delegate. Supervisor builds slides 1–5b directly, establishes `/shared/`, gets Jcamp approval on the visual direction.

**B2 (full build) — supervisor + workers, parallel.** Once `/shared/` is locked, subagents implement individual slides against the established system. Supervisor reviews each slide for visual rhythm (immersive vs. restrained per PRD 3.5), design system compliance, and image discipline.

### Opus drafts directly (no Haiku)

These slides carry rhetorical weight where every word matters. Supervisor writes them directly:

- Slide 2 — The paradox
- Slide 3 — The vision
- Slide 3.5 — Why the Arabian desert matters
- Slide 6.5 — Why now
- Slide 12 — The big idea (pull quote)
- Slide 12.5 — The ask
- Slide 13 — Closing

Subagent-eligible slides (structured generation, clear pattern):

- Slide 1 — Cover (templated)
- Slide 4 — Why Nat Geo (list)
- Slide 5a — Who Hero is
- Slide 5b — Recognition (list of awards)
- Slide 6 — The problem (parallel-column structure)
- Slide 7 — The solution (three-line list)
- Slide 8 — Experience framework (five-pillar list)
- Slide 8.5 — Conservation, culture, education (three-paragraph spread)
- Slide 9 — Unmatched (parallel-column structure)
- Slide 10 — Commercial value (list)
- Slide 11 — Implementation (three-phase list)

### Escalation triggers — supervisor only

Any of these stop subagent work and route to Opus directly:

- PRD interpretation ambiguity
- Source-pack claim with status `needs-source` referenced
- Editorial voice question the alignment checklist can't resolve
- Any conflict between PRD sections
- Two consecutive subagent failures on the same task
- Any decision that would change a locked v4 direction (aesthetic, slide flow, narrative architecture)

### Parallelism

Supervisor may spawn multiple Haiku subagents in parallel for independent slides during B2 build, but **not during Phase C copy pass**. Copy generation stays sequential per the original plan (Jcamp confirms each slide before the next begins) — parallelism here would defeat the per-slide review loop.

### What to write in commit messages

Supervisor commits, not subagents. Commit messages note who drafted:

- `Slide 1: cover copy (Haiku draft, Opus review)`
- `Slide 12: big idea (Opus direct)`

This preserves the audit trail of which content originated where, which is useful for retrospectives.

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
- ✅ Phase C copy pass complete (18 files under `/natgeo/copy/`, drafted 2026-05-12)
- ✅ Source pack — award years verified via hero-experiences.com/why-us screenshots (2026-05-12); canonical source pack at `/reference/source-pack.md`

## Open questions (for Jcamp)

1. **Source pack verification (further refined 2026-05-12)** — Two rounds of verification completed today:
   - Round 1 — screenshots of hero-experiences.com/why-us confirmed initial award years
   - Round 2 — third-party citation URLs supplied for WTA Desert Safari (2016–2024 with 2021 gap), WTA Middle East Balloon (2020–2025), Layalina (corrected: Editor's Choice for The Dubai Balloon 2024, not "Best Luxury Cultural Adventure Experience"), and Luxury Lifestyle Awards (Luxury Travel Dubai, 2025)

   Still outstanding:
   - (a) Third-party citations for #4b WTA World's Leading Balloon (currently self-source via screenshot), #7a/b/c TripAdvisor, #17 Dubai Sustainable Tourism, #18 Dubai Green Tourism, #19 International Sustainable Luxury Awards 2023, #20 Gulf Sustainability & CSR 2018
   - (d) Michelin chef name (#14, needs-source)
   - (e) Whether Dubai Sustainable Tourism (#17) or Dubai Green Tourism (#18) is the certifying body for source-pack #8 "ecotourism-certified desert safari" (Slide 5a ship blocker)
   - (f) Current guest count figure (#15)
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
| 2026-05-12 | CLAUDE.md v4.1 — Execution model added. Opus 4.7 as supervisor, Haiku 4.5 as worker for structured slides. Opus drafts strategic/rhetorical slides directly (2, 3, 3.5, 6.5, 12, 12.5, 13). Two-retry rule before supervisor takes over a failing subagent task. |
| 2026-05-12 | Phase C complete. All 18 copy files drafted in `/natgeo/copy/`. PRD bumped to v4.1: source pack verified from hero-experiences.com/why-us awards screenshots; WTA Desert Safari years 2016–2022; WTA Balloon Operator split into two distinct awards; TripAdvisor framing corrected; four sustainability awards added; Slide 5b restructured into two groupings (travel + sustainability). Canonical source pack created at `/reference/source-pack.md`. Slide 5a needs-source flag (#8 ecotourism certification) may resolve via #17/#18 — pending Jcamp confirmation. |
| 2026-05-12 | Source pack round 2 — third-party citation URLs received from Jcamp. WTA Desert Safari refined to 8 wins between 2016–2024 (2021 omitted); WTA Middle East Balloon extended to 2020–2025; Layalina category corrected to "Editor's Choice — The Dubai Balloon 2024" (prior "Best Luxury Cultural Adventure Experience" wording was wrong); Luxury Lifestyle Awards category clarified to "Luxury Travel Dubai 2025". Status upgraded from `verified (self-source)` to `verified` for these four entries. WTA World's Leading Balloon (#4b), TripAdvisor, and sustainability awards still pending third-party links. |
