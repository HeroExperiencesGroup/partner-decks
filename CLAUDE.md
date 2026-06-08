# CLAUDE.md — Working Context

**Working context version:** v5.0 (PRD at v5)
**Last updated:** May 15, 2026

**v5.0 changes:** Complete restructure around two-tier (Platinum + Heritage) thesis. PRD bumped to v5 (`PRD.md`); thesis pivoted from anti-luxury documentary register to *editorial luxury* — Hero shown as the only Gulf operator where luxury and conservation are inseparable, delivered through two collections within a single conservation mandate. 21-slide structure (was 17). New slides: Hero vs typical Dubai operator spec sheet (9), Two collections intro (10), Inside the collections (15). Slide 6 → 8 (Problem) revised with concrete Hero specifics. Phase B0 introduced: per-slide descriptive briefs at `/natgeo/briefs/` precede copy and HTML — all 21 briefs drafted 2026-05-15. Source pack updated: #8 ecotourism resolved as `verified (self-source)` via Platinum Heritage site verbatim; #14 Michelin chef resolved (Chef Claudio Filippone + Executive Chef Manish Khot, named on /platinum-desert-safari); 12 new entries added (#21–32) covering Royal Family property access, 1:2 staff ratio, 4-guest vehicle cap, Al Maha partnership, gentle-drive policy, animal-welfare compliance, two-collection product catalogues, four-element breakfast, 500K visitors, 200K bottles, 650-cars-pending. PRD §6.5 Land Rover rule reframed as vehicle-agnostic on forward slides (silence, not exclusion); current-operations slides may surface the vintage fleet. PRD §6.6 added: luxury through fact, not signifier. Phase B HTML restructure underway 2026-05-15.

**v4.4 changes:** Phase B2 build complete. Haiku 4.5 subagent drafted all 11 sections (6 through 13) into `/natgeo/index.html` with deck-progress nav extended to all 18 anchors. Supervisor cleanup pass promoted Haiku's scoped CSS into proper components in `/shared/css/components.css` (`.problem`, `.compare`, `.timeline`, `.timeline__horizon`, `.magazine-grid`, `.magazine-cell*`, `.list--framework`, `.declaration`, `.quote`, `.close-line`, `.footnote`), replaced heavy inline `style` attributes with the new classes, and fixed two PRD §8 deviations: Slide 6 layout (now true side-by-side photo placeholders with centreline rule, was text-only over a single full-bleed); Slide 6.5 + 8 closing lines (were wrapped in `.pull` italic-serif, now use `.close-line` / `.footnote` respectively per PRD §8 spec). Base.css fix: `h1, h2, h3, h4 { color: inherit }` so immersive sections cascade bone correctly — was overriding to ink and making cover headline unreadable. `.full-bleed--soft-dim` gradient strengthened (0.78 alpha at bottom) for cover text legibility.
**v4.3 changes:** Phase B1 build complete (awaiting Jcamp visual review). `/shared/` design system established (tokens, base, components, print, deck.js); `/shared/fonts/` self-hosts Playfair Display + Inter; `/natgeo/index.html` ships sections 1 through 5b as a single scrolling editorial document with keyboard navigation, scroll-snap, review-mode toggle, and source-pack annotations.
**v4.2 changes:** Phase C complete; PRD bumped to v4.1 with source-pack verifications from hero-experiences.com/why-us screenshots; canonical source pack created at `/reference/source-pack.md`; Slide 5b restructured to two groupings (travel + sustainability).
**v4.1 changes:** Added Execution model section — Opus 4.7 as supervisor, Haiku 4.5 as worker for structured generation. Includes which slides Opus drafts directly vs. which get Haiku-then-review.

## Project

`partner-decks` — Hero Experiences partner-portal repo. First build: pitch deck proposing a partnership between Hero Experiences (Dubai) and National Geographic to create the world's definitive desert expedition.

Hosted at `partners.hero-experiences.com/natgeo-<suffix>/` (subdomain pending Hero internal DNS approval). Auth via Cloudflare Access (confirmed available).

## Source of truth

`PRD.md` (currently **v5**) is the single source of truth. Read it before every session.

## Current state

- [x] PRD v1 drafted
- [x] PRD v2 — hosted HTML locked as canonical format
- [x] PRD v3 — source pack with verification status, Why-Now and The-Ask slides, Cloudflare Access locked
- [x] PRD v4 — aesthetic direction locked as Editorial Cinematic; Land Rovers minimised; coverage of original 11 narrative pillars verified; new slides 3.5 (Why Arabia) and 8.5 (Conservation/Culture/Education)
- [x] **Phase C — Copy pass** (18 section files under `/natgeo/copy/`; committed locally as b094668)
- [x] **Phase B1 — HTML foundation built** (2026-05-12) — `/shared/` design system + `natgeo/index.html` sections 1–5b. **Pending Jcamp visual review before B2.**
- [x] **Phase B2 — Full HTML build** (2026-05-13) — sections 6 through 13 complete; 11 new `<section>` blocks added; scoped CSS for slide-specific layouts; navigation updated; all copy verbatim from source files
- [x] **PRD v5** (2026-05-14/15) — full restructure around two-tier thesis; 21 slides; new §6.6 (mode-of-luxury); §6.5 reframed vehicle-agnostic on forward slides
- [x] **Phase B0 v5** (2026-05-15) — per-slide descriptive briefs for all 21 slides written to `/natgeo/briefs/`
- [~] **Phase B v5 HTML restructure** (in progress 2026-05-15) — index.html rewritten for v5 slide order; new components added to components.css; new slide placeholders with image descriptions in review mode
- [~] Source pack verification — partial (round 2 2026-05-12: third-party citations confirmed for #3 #4a #5 #6; still pending #4b WTA World's Balloon, #7a/b/c TripAdvisor, #17–20 sustainability; needs-source #8 ecotourism cert, #14 Michelin chef outstanding)
- [ ] GitHub remote unresolved — push to `HeroExperiencesGroup/partner-decks` returned 404 (2026-05-12); Jcamp to create the repo or update remote URL
- [ ] PDF export validated from print stylesheet
- [ ] Subdomain DNS approved by Hero IT
- [ ] Cloudflare Access configured per-path
- [ ] Plausible Analytics account created and tracking script integrated
- [ ] Real imagery sourced and integrated

## Active task

**Phase B v5 HTML restructure — in progress as of 2026-05-15.** The deck is being restructured around the v5 two-tier thesis. Read PRD v5 first (especially §2.2 thesis, §3.5 21-slide rhythm, §6.5 vehicle handling, §6.6 mode-of-luxury). Then read the 21 per-slide briefs at `/natgeo/briefs/` for slide-by-slide direction including image descriptions and atmosphere notes.

What is being delivered in this restructure:
- `natgeo/index.html` rewritten for v5 slide order (21 slides — was 17)
- New CSS components appended to `shared/css/components.css` for three new slides: `.spec-table` (Slide 9), `.collections-intro` (Slide 10), `.collections-detail` (Slide 15)
- Deck-progress nav updated to all 21 anchors
- New image slots placeheld with gradient + visible image description in review mode (so Jcamp can scroll and see how each new slide will feel before commissioning real photography)
- Existing imagery retained where the v4 image direction still serves the v5 slide

Awaiting after this restructure:
- Jcamp visual review of v5 deck
- Copy refinement (briefs → final copy under `/natgeo/copy/` with v5-aligned filenames)
- Real imagery for new placeholders (Slide 10 left + right; Slide 8 may need new left-side dune-bashing image)
- Source-pack-blocker resolution: `/reference/source-pack.md` #32 "650 cars not produced" pending Hero internal confirmation of figure

What is preserved from v4 build (do not touch unless task requires):
- `/shared/css/` design system (tokens, base, print, deck.js, fonts) — survives intact
- Existing image assets for Slides 1, 3, 4 (was 3.5), 6 (was 5a, current image option A), 14 (was 8.5, 3 images), 18 (was 11), 19 (was 12), 21 (was 13)

**v4 prior active task — superseded.** Full deck visual review of v4 (17 slides, branch `b1-natgeo-foundation`) was the active task at the end of the 2026-05-14 session. v5 supersedes — visual review will now be on the v5 build, not v4.

**To preview locally:** `npx http-server -p 8080 -c-1` from project root, then visit `http://localhost:8080/natgeo/`. Keyboard: `↑/↓` navigate, `R` toggle review mode (shows source-pack notes + image-direction descriptions on new placeholder slots), `V` toggle Slide 2 image variant.

**Branch:** `b1-natgeo-foundation`. Do not push to `main` directly per Jcamp's instruction.

**Remote:** `origin` points at `https://github.com/HeroExperiencesGroup/partner-decks.git` but returned 404 on push attempt 2026-05-12. Repo creation / auth resolution remains a separate Jcamp action.

See the "Phase B1 — decisions locked" section below for binding constraints from v4 that still apply unless explicitly superseded by v5 (most do — e.g. self-hosted webfonts, review-mode mechanism, image variants as CSS classes for Sections 2 and 11).

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

## Phase B1 — decisions locked (next session executes)

Locked by Jcamp 2026-05-12. Binding constraints for the next session's B1 build.

### Architecture

- **Document shape:** single scrolling editorial document with keyboard navigation between sections. Not multi-file. Not slideshow-style.
- **Webfonts:** self-host Playfair Display (display serif) + Inter (body sans). Use **token-based CSS variables** for font families in `shared/css/tokens.css` so commercial fonts (GT Super, Söhne, Tiempos) can swap in later by editing tokens only — no section-level changes.

### Source-pack flag handling (UI pattern)

- Implement `body[data-review="true"]` review mode in `shared/js/deck.js`.
- **Normal mode:** deck reads clean. No `[SOURCE PENDING]` or status markers visible in the designed copy.
- **Review mode:** source-status markers, pending citations, and audit annotations appear as visible side notes or in-margin annotations — never inline within designed copy.

### Per-section overrides (B1 scope)

- **Section 5a (Who Hero is):** ship safe-fallback copy (no ecotourism claim) until source-pack #8 resolves. The copy spec in `natgeo/copy/05a-why-hero.md` is now the safe-fallback version; restoration wording is captured in that file's notes.
- **Section 5b (Recognition):** ship clean award copy in normal mode. Source-status markers (`verified (self-source)`, third-party-link pending, etc.) appear in review mode only.
- **Sections 2 (Paradox) and 6.5 (Why now):** implement both image variants as CSS classes — e.g. `section[data-image="none"]` vs. `section[data-image="sparse"]`. Default to the no-image variant in B1; toggle during Jcamp's visual review.

### Imagery

- Placeholder imagery acceptable for B1.
- Every placeholder documented in `natgeo/assets/README.md` with source URL and intended replacement direction (per PRD 9.7).

### Git workflow

- Work on branch `b1-natgeo-foundation`.
- **Do NOT push to `main` directly.** Pause for Jcamp's visual review before merge/deploy.
- Remote situation pending — see Active task note.

### Recommended B1 build order

1. `shared/fonts/` — self-host Playfair Display + Inter (woff2)
2. `shared/css/tokens.css` — colour, type scale, spacing, font-family variables
3. `shared/css/base.css` — reset, typography, mobile-first scaffold
4. `shared/css/components.css` — section containers, full-bleed image, two-column, pull quote, museum-wall, review-mode annotations
5. `shared/css/print.css` — A4 landscape PDF stylesheet
6. `shared/js/deck.js` — keyboard navigation between sections, scroll-snap, review-mode toggle, lazy image loading
7. `natgeo/index.html` — single scrolling document, sections 1 through 5b (Cover, Paradox, Vision, Why Arabia, Why Nat Geo, Who Hero is, Recognition)
8. `natgeo/assets/images/` + `natgeo/assets/README.md` — placeholder dune photos with documented sources
9. Pause for Jcamp visual review before B2 (sections 6 through 13)

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
- ✅ Phase C copy pass complete (18 files under `/natgeo/copy/`, drafted 2026-05-12; committed as b094668)
- ✅ Source pack — round 1 verified via hero-experiences.com/why-us screenshots, round 2 third-party citations for #3 #4a #5 #6 (2026-05-12); canonical at `/reference/source-pack.md`
- ✅ Phase B1 decisions locked (2026-05-12): scrolling document + keyboard nav, self-hosted Playfair Display + Inter with token variables, review-mode `body[data-review="true"]` for source-pack flags, Slide 5a safe-fallback wording, image variants as CSS classes for sections 2 and 6.5
- ✅ Phase B1 built (2026-05-12): `/shared/` design system + `natgeo/index.html` sections 1–5b. Pending Jcamp visual review before merge or B2 start.

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
| 2026-05-12 | Phase C committed locally as b094668. Push to origin (HeroExperiencesGroup/partner-decks) failed: repo not found — remote setup pending Jcamp. Phase B1 decisions locked: (1) single scrolling editorial document with keyboard nav; (2) self-hosted Playfair Display + Inter with token-based font variables for future commercial-font swap; (3) source-pack flags handled via `body[data-review="true"]`, never in normal-mode copy; (4) Slide 5a ships safe-fallback wording (ecotourism claim removed) until #8 resolved; (5) Sections 2 and 6.5 implement both image variants as CSS classes; (6) placeholder imagery documented in `natgeo/assets/README.md`; (7) B1 work on branch `b1-natgeo-foundation`, do not push to main directly. Slide 5a copy file (`natgeo/copy/05a-why-hero.md`) updated to safe-fallback wording; ship blocker removed; restoration wording preserved in file notes. Branch `b1-natgeo-foundation` created locally. Next session executes B1. |
| 2026-05-13 | Phase B2 built. Haiku 4.5 subagent drafted all 11 B2 sections (6, 6.5, 7, 8, 8.5, 9, 10, 11, 12, 12.5, 13) into `natgeo/index.html` with deck-progress nav extended to all 18 anchors and `natgeo/assets/README.md` extended with B2 image-slot manifest. Supervisor cleanup pass: (1) promoted Haiku's scoped CSS to `components.css` as proper components — `.problem`, `.compare`, `.compare__label`, `.timeline`, `.timeline__phase`, `.timeline__label`, `.timeline__horizon`, `.magazine-grid`, `.magazine-cell`, `.magazine-cell__image/__label/__body`, `.list--framework`, `.declaration`, `.quote`, `.close-line`, `.footnote`; (2) removed the `<style>` block from the HTML head and `<style scoped>` block from inside slide 8.5; (3) replaced heavy inline `style="..."` attributes across slides 9, 11, 12, 12.5, 13 with class references; (4) fixed Slide 6 layout — Haiku produced text-only columns over a single full-bleed, PRD §8 calls for two photographs side by side with a centreline rule; now structured as `.problem` with two `.problem__side` elements each carrying its own gradient placeholder, divided by `.problem__bg` rule; (5) fixed Slide 6.5 closing line — was wrapped in `.pull--with-rule` (italic serif pull quote), now `.close-line` (small sans, deep sand) per PRD §8 "smaller, below"; (6) fixed Slide 8 framework footer — was `.pull--with-rule`, now `.footnote` (small italic serif) per PRD §8 "footer, small, italic". Earlier in the session: cover-headline fix in `base.css` (`h1,h2,h3,h4 { color: inherit }`), `.full-bleed--soft-dim` gradient strengthened for cover legibility, `V` keypress in `deck.js` to toggle slide 2 image variant, 5 Unsplash placeholders downloaded to `natgeo/assets/images/` for slots 01, 02, 03, 03.5, 05a. B1 + B2 build uncommitted at session end. Smoke test passed: all 17 sections present, all asset HTTP 200, total ~2.7MB. |
| 2026-05-12 | Phase B1 built on `b1-natgeo-foundation`. `/shared/` design system: `fonts/` (Playfair Display + Inter, 6 weights each incl. italics, ~290KB total, from Fontsource jsDelivr); `css/tokens.css` (palette, type scale, spacing, font-family vars); `css/base.css` (reset, typographic defaults); `css/components.css` (deck/section, full-bleed, paradox, split, overlay, museum, review-note, deck-progress, kbd-hint); `css/print.css` (A4 landscape PDF); `js/deck.js` (keyboard nav, IntersectionObserver progress sync, review-mode toggle persisted in localStorage, lazy-image enhancement). `natgeo/index.html` ships sections 1–5b verbatim from `/natgeo/copy/`, including 5a safe-fallback wording and 5b two-grouping museum wall; section 2 defaults to `data-image="none"` per locked decision; review-mode annotations attached to 5a (ecotourism deferral) and 5b (pending third-party citations). `natgeo/assets/README.md` documents every image slot with direction, aspect, status, sourcing rules; placeholder gradients in CSS stand in while images are absent. Local smoke test via `npx http-server` passed: all 7 sections present, all assets HTTP 200, total page ~13KB HTML + ~16KB CSS + ~7KB JS + ~290KB fonts. B1 build uncommitted at session end pending Jcamp's visual review. |
| 2026-05-13 | Phase B2 built. Haiku worker executed HTML build for sections 6–13. All 11 sections added to `natgeo/index.html` between sec-recognition and closing `</main>`. Scoped CSS block added (70 lines) for three slide-specific layouts: (1) Slide 6 split-columns two-column contrast grid; (2) Slide 8 list--framework with bold pillar labels and details; (3) Slide 8.5 conservation-grid three-column magazine spread (pending promotion). All 18 deck-progress navigation anchors (lines 253–270) updated with new section links. Copy text verified verbatim from `/natgeo/copy/` source files. All sections follow B1 established patterns: section__meta blocks with page numbers, coordinates, year; immersive vs. restrained modes per PRD 3.5; full-bleed--placeholder gradients for all image slots (no real imagery imported); overlays on immersive slides. No modifications to `/shared/css/` files or `/shared/js/`. Source-pack compliance: all claims in slides 6–13 are positioning/forward-looking (no new Hero credibility claims that require source-pack entry). Slide 6 (split layout) uses existing CSS grid; Slide 8.5 (three-column grid) requires scoped inline styles for complex layout not in B1 components.css. No review-notes needed for B2 sections (no source-pack verifications pending). HTML structure validated: all ids unique, aria-labelledby relationships in place, semantic nesting correct. Next: Jcamp visual review and image sourcing. |
| 2026-05-14 | All 14 image slots wired with real photography. 13 from Hero's Platinum Heritage / DDCR archive, 1 approved Unsplash (Slide 3). Slide 2 paradox switched to sparse variant using same source as Slide 13 closing (visual thread between opener and closing). Slide 8.5 ×3 populated (Nature Drive 6 gazelles → Conservation; Bedouin Breakfast 2 → Culture; Stargazing 16 → Education). Slide 11 horizon iterated through 3 candidates — (38) oryx, (53) aerial dunes, finally (52) which has the clearest horizon line + ghaf scrub; locked at `object-position: center 17%`. Slide 7 (Solution) populated with Desert Dunes (10) — figure walking dune ridge toward sun. PRD §8 "no figures" rule for Slide 7 explicitly relaxed by Jcamp; figure provides documentary scale, reads as expedition not advertising. Recorded in `natgeo/assets/README.md` "Slide 7 — figure exception" section. AI-enhanced variants of (53) considered for Slide 7 but rejected — Nat Geo photo editors would catch AI tells (missing ghaf scrub, over-symmetric ripples). Real Hero photography preferred even when figure-exception required. All images compressed via sharp/mozjpeg — total deck weight ~2.5MB. Deck is now image-complete and ready for visual review before delivery. |
| 2026-05-15 | v5 full restructure. Driven by higher-up feedback that v4 under-represented Hero's actual brand voice (Platinum Heritage's own positioning is "Sustainable-Luxury Desert Safaris" / "rustic luxury"), made the comparison argument too vague, and failed to surface concrete differentiators leadership needs. PRD bumped to v5 with new thesis (§2.2): Hero is the only Gulf operator where editorial luxury and conservation are inseparable, delivered through two collections within a single conservation mandate. Architecture: 21 slides (was 17). Three new slides added — Slide 9 (Hero vs typical Dubai operator spec sheet), Slide 10 (Two collections intro side-by-side), Slide 15 (Inside the collections experience-card spread). Slide 6 → 8 (Problem) revised from vague-noun parallel ("falcon, silence, fire, story") to concrete Hero specifics ("falconry under the open sky, fire, oryx tracking, silence") with "dune-bashing" added on left column as the practice Hero publicly refuses. PRD §6.5 (Land Rover handling) reframed — current-vs-forward split: current-operations slides (6, 10, 14, 15) may surface the vintage 1950s fleet (Hero's own brand language); forward-partnership slides (3, 12, 18, 19, 20, 21) stay vehicle-agnostic, neither inclusive nor exclusive. Same end-state v4 produced via blanket de-emphasis, rationalised by scope rather than suppression. PRD §6.6 (mode-of-luxury) added: luxury through fact (named credentials, numerical specs, concrete access, documentary high-end imagery) permitted; luxury through signifier (adjective puff, gold/marble/champagne, drone-pool, Burj-Al-Arab register) forbidden. NatGeo precedent expanded from Unique Lodges alone to Singita / Asilia / Bushcamp / Unique Lodges. Banned-words list refined: *exclusive* / *private* permitted in factual constructions only; *luxurious* / *bespoke* / *premium* still banned; *luxury* permitted as tier-name noun. Source pack: #8 ecotourism upgraded `needs-source` → `verified (self-source)` via Platinum Heritage site verbatim ("The only Ecotourism Desert Safari company in Dubai"); #14 Michelin chef resolved (Chef Claudio Filippone & Executive Chef Manish Khot, named on /platinum-desert-safari); 12 new entries (#21–32) added under new Section 5 "v5 additions" covering Royal Family property access, 1:2 staff ratio, 4-guest vehicle cap, Al Maha partnership, gentle-drive policy, animal-welfare compliance, two-collection product catalogues, four-element breakfast, 500K visitors, 200K bottles, 650-cars-pending. Phase B0 introduced — per-slide descriptive briefs at `/natgeo/briefs/` (21 Markdown files specifying copy structure, image description, atmosphere note per slide) as a bridge between PRD and HTML; closes a v4 gap where copy-to-HTML structural rework was needed on three slides at B2 cleanup. HTML restructure begun: index.html rewritten for v5 21-slide order with new image slots placeheld + descriptions visible in review mode (so Jcamp can scroll and see how new slides feel before commissioning real photography); new CSS components appended to components.css (.spec-table for Slide 9, .collections-intro for Slide 10, .collections-detail for Slide 15). HTML rewrite delegated to Haiku 4.5 subagent per established execution model (Opus 4.7 supervisor + Haiku worker for structured generation); supervisor review on output before user review. |
