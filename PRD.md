# PRD — Hero × National Geographic Partnership Pitch Deck

**Project codename:** `hero-natgeo-deck`
**Owner:** Jcamp (Hero Experiences)
**Status:** Draft v4.1 — source pack verifications applied
**Last updated:** May 12, 2026

## Version history

- **v4.1 (current)** — Source pack verifications applied from hero-experiences.com/why-us awards screenshots (2026-05-12). WTA Desert Safari Company years confirmed 2016–2022. WTA Balloon Ride Operator split into two distinct awards (Middle East 2020–2024; World's 2020–2023). TripAdvisor framing corrected to Certificate of Excellence 2013–2019 + Hall of Fame + Travelers' Choice 2020–2025. Four sustainability/conservation awards added to the source pack (Dubai Sustainable Tourism, Dubai Green Tourism, International Sustainable Luxury Awards 2023, Gulf Sustainability & CSR Awards 2018). Slide 5b spec restructured into two groupings (travel & hospitality, sustainability & conservation) to surface the conservation credentials Nat Geo values. Canonical source pack file created at `/reference/source-pack.md`.
- **v4** — Aesthetic direction locked as *Editorial Cinematic*: cinematic photography paired with editorial restraint, alternating immersive and quiet slides. Replaced black/gold accents with desert palette (bone, ink, deep sand, warm rust). Land Rovers reduced to a single minimal mention in Slide 5a, no fleet imagery, no CO₂ figure. Re-anchored slide flow to original 11 narrative pillars from Jcamp's brief — added "Why the Arabian desert matters" (Section 3.5) and split "Conservation, culture, and education" into its own slide (Section 8.5). Honest attribution added to track which content originated where.
- **v3** — Softened Unique Lodges framing into values alignment. Broadened audience wording. Source pack with verification status. Added "Why now" and "The ask" slides. Cloudflare Access locked as auth approach with per-path policies. Plausible analytics ownership.
- **v2** — Locked production format as hosted HTML (canonical) with derived PDF (leave-behind). Added "not Canva-default" guardrail. Added Section 11 — Hosting and deployment.
- **v1** — Initial PRD drafted from Jcamp's brief and prior research.

---

## 1. Purpose

Produce a premium, cinematic pitch deck used by Hero Experiences to propose a formal partnership with National Geographic. The deliverable must convince Nat Geo's travel, licensing, and partnership leadership that Hero is the right operator to co-create the world's definitive desert expedition.

This document is the **single source of truth** for both the copy pass (Phase C) and the HTML build (Phase B). Claude Code should treat this PRD as the spec; all generated artifacts (copy, slides, HTML, components) must conform to it.

---

## 2. Strategic positioning

### 2.1 The one-line pitch

> From "Desert Safari" → to → "Global Desert Heritage Expedition."

### 2.2 The defensive frame

This is **not a logo licensing deal.** It is **co-creation of a new category standard** — a structured co-design process to define, validate, and pilot the first National Geographic desert expedition product, extending Nat Geo's travel portfolio into the Arabian desert biome where it currently has no flagship presence.

### 2.3 Why this lands for Nat Geo

Hero's operating principles align with the values Nat Geo applies across its travel partnerships:

1. **Conservation** — measurable environmental stewardship, operating inside the UAE's first national park
2. **Authenticity** — Bedouin heritage and culture treated as living practice, not performance
3. **Sustainability** — solar power, hydro panels, ecotourism certification
4. **Guest experience** — top-tier hospitality with locally trained guides
5. **Community benefit** — economic and cultural return to local communities

This values alignment is made visually explicit in the Experience Design Framework slide (Section 8 of the slide flow). We do **not** claim formal eligibility for any specific Nat Geo programme (e.g. Unique Lodges of the World) — that determination is Nat Geo's to make. The deck demonstrates alignment with their values; it does not pre-empt their evaluation.

### 2.4 Target audience for the deck

- **Primary:** National Geographic travel, licensing, and partnership leadership — across the relevant Nat Geo entities (Nat Geo Partners, Nat Geo Society, licensed travel operators) that hold decision authority on expedition and travel-product partnerships
- **Secondary:** Nat Geo brand custodians evaluating editorial and conservation fit
- **Tone they respond to:** restrained, declarative, evidence-backed, editorial — never salesy

### 2.5 Coverage of original narrative pillars

Jcamp's original brief specified 11 narrative requirements. The slide flow in Section 8 covers each:

| Original requirement | Where it lives in the deck |
|---|---|
| Who Hero Experiences is | Slide 5a |
| Awards / accolades | Slide 5b |
| Why Dubai/UAE desert heritage matters | Slide 3.5 (new in v4) |
| The market problem | Slide 6 |
| Vision for the partnership | Slides 3, 7 |
| Experience journey | Slide 8 |
| Conservation / culture / education components | Slide 8.5 (split out in v4) |
| Global branding opportunity | Slide 10 |
| Media / content / storytelling opportunity | Slide 10 |
| Why this becomes the new global standard | Slides 9, 12 |
| (Plus) the explicit ask | Slide 12.5 |
| (Plus) why now | Slide 6.5 |

---

## 3. Design direction — Editorial Cinematic (locked v4)

### 3.1 The direction in one sentence

The deck looks like an unpublished National Geographic travel feature — cinematic photography carrying atmosphere, editorial typography carrying information, with disciplined restraint between the two.

### 3.2 Why this direction wins for this audience

Nat Geo's travel partnership team sees pitch decks constantly. The decks that convert are the ones that **look like the partner could have made them themselves.** For Nat Geo, that means feeling like an unpublished Nat Geo product, not a pitch *to* Nat Geo.

This rules out two common failure modes:
- **Overdesigned tourism aesthetics** (gold-on-black, gloss, drama) — reads as Dubai luxury cliché
- **Underdesigned corporate slideware** (Helvetica on white, bar charts) — reads as deal memo

Editorial Cinematic is the middle register Nat Geo's own output occupies.

### 3.3 The five rules

1. **Photography is cinematic, atmospheric, documentary.** Full-bleed where it serves the story. Golden hour, blue hour, weather, and dust as compositional elements. Never lit like advertising.
2. **Typography is editorial.** Serif display for headlines, warm sans for body. Disciplined, never trendy.
3. **Color comes from place, not brand.** Bone, ink, deep sand, warm rust — drawn from desert photography. No gold-on-black. No black-on-gold.
4. **Rhythm alternates by purpose.** Immersive slides carry atmosphere; restrained slides carry information. The contrast is the deck's pacing.
5. **Zero decoration.** No icons, no badges, no gradients, no rounded corners, no drop shadows. Every visual element either carries information or carries atmosphere.

### 3.4 Visual system

| Element | Spec |
|---|---|
| Display type | Serif — `GT Super`, `Tiempos Headline`, or `Söhne Breit` (web fallback: `Playfair Display`, then `Georgia`) |
| Body type | Warm sans — `Söhne`, `Inter`, or `GT America` (web fallback: system sans stack) |
| Meta / caption | Mono or small-caps sans for coordinates, dates, page numbers |
| Color — bone | `#F4EFE6` (primary ivory background) |
| Color — ink | `#1C1C1A` (primary text, dark surfaces, full-bleed dark slides) |
| Color — deep sand | `#B89968` (secondary; section dividers, fine rules) |
| Color — warm rust | `#8B4A2B` (accent, used sparingly — pull quotes, single hairlines, never as fill) |
| Color — oxblood (rare) | `#6B2A24` (one high-emphasis pull quote per deck maximum) |
| Grid | 12-column, generous gutters, asymmetric layouts encouraged |
| Imagery | Full-bleed on hero slides; absent on credibility/framework/ask slides |
| Iconography | Forbidden. Use type or fine line work instead. |
| Logos | Quiet typographic treatment — never badges |
| Page metadata | Page number, date, location coordinates set in small caps in the margin (Nat Geo signature) |

### 3.5 Slide rhythm — which slides are immersive vs. restrained

This is the cinematic/editorial alternation that defines the direction.

| Slide | Mode | Why |
|---|---|---|
| 1 Cover | Immersive | First impression must carry atmosphere |
| 2 Paradox | Restrained | Idea must land in words |
| 3 Vision | Immersive | Emotional reframe — let imagery carry it |
| 3.5 Why Arabia | Immersive | Heritage and landscape are the argument |
| 4 Why Nat Geo | Restrained | Their authority is typographic, not visual |
| 5a Who Hero is | Restrained | Credibility, not glamour |
| 5b Recognition | Restrained | Museum-wall treatment of awards |
| 6 Problem | Immersive (split) | Side-by-side photography does the argument |
| 6.5 Why now | Restrained | Urgency lands in declarative type |
| 7 Solution | Immersive | The benchmark deserves the cinematic frame |
| 8 Framework | Restrained | Pillars are structured, typographic |
| 8.5 Conservation/Culture/Education | Immersive | Three atmospheric images, one per pillar |
| 9 Unmatched | Restrained | Two-column logic, typographic |
| 10 Brand value | Restrained | Decision-maker information |
| 11 Implementation | Restrained | Roadmap clarity |
| 12 Big idea | Immersive | Emotional peak — full-bleed pull quote |
| 12.5 The ask | Restrained | Direct, declarative, no ornament |
| 13 Closing | Immersive | Closes the visual loop with the cover |

### 3.6 What this direction is NOT

- Not a tourism brochure
- Not a corporate slideware deck (no rounded boxes, no stock icons, no gradients)
- Not a Dubai luxury aesthetic (no gold-on-black, no skyscraper imagery, no ostentation)
- Not infographic-driven (data appears as fine typography, not charts)
- Not a Canva default (no rounded cards, soft shadows, illustrated icons, badge-style award marks, template-driven multi-element layouts)
- Not Aesop-style pure restraint (too cool for a story about exploration)
- Not Aman-style pure atmosphere (too marketing for a partnership argument)

**The test:** every slide should be plausibly a page in a Nat Geo travel feature. If a slide doesn't pass that test, it gets restrained until it does.

---

## 4. Deliverables

Three formats from a single source. HTML build is canonical; PDF and any future Canva/Keynote rebuild are derived.

### 4.1 Phase C — Copy pass

A complete, build-ready copy document covering all 17 slides. Each section file specifies headline, body, image direction, layout note, and mode (immersive or restrained per Section 3.5). Output lives in `/natgeo/copy/`.

### 4.2 Phase B — HTML build (production, hosted)

The HTML deck is the canonical deliverable. It is the version Nat Geo receives via a link to a Hero-owned subdomain. It is production, not prototype.

**Build phases:**

- **B1 — Foundation (slides 1–5b).** Establishes the design system: typography, color tokens, grid, layout components, image pipeline, mobile breakpoints, the immersive/restrained alternation pattern. Validates the editorial-cinematic direction before scaling.
- **B2 — Full build (slides 6 through 13).** Once B1 is approved, extend the same component library to remaining slides. No new design decisions at this stage — execution only.

**Technical spec:**

- Static site, no backend, no CMS
- Vanilla HTML and CSS; minimal vanilla JavaScript only where needed (keyboard navigation, scroll, lazy loading)
- No frameworks (no React, no Vue, no build tooling unless strictly necessary)
- One HTML file per slide OR one scrolling document — to be decided in B1 based on what serves reading experience best
- **Mobile-first.** Phone first, then tablet, then 16:9 laptop. Decks get forwarded and opened on phones constantly.
- Self-hosted webfonts (no Google Fonts CDN — privacy and performance)
- WebP imagery with JPG fallback; responsive `srcset`; lazy loading below the fold
- Target page weight: cover under 2MB on first load; total deck under 15MB
- Print stylesheet: `Cmd+P → Save as PDF` produces clean, share-ready PDF
- Analytics: Plausible (lightweight, privacy-respecting, cookieless)

### 4.3 PDF leave-behind (derived)

Generated from the HTML build via browser print-to-PDF. Used as the emailed follow-up and the internal-Nat-Geo-forward artifact.

- One additional cover page at print time: short context paragraph (1–2 sentences) plus Hero contact block, so a cold reader who lands on the PDF without verbal context understands what they're looking at
- Print stylesheet hides interactive elements; locks layouts to A4 landscape
- File name: `hero-natgeo-partnership-proposal-YYYY-MM.pdf`

### 4.4 Future format — Canva/Keynote rebuild (out of scope this iteration)

If a designer or partner team needs to rebuild in Canva, Keynote, or Figma later, the HTML build is the visual reference. The HTML is the master; rebuilds are downstream.

### 4.5 Out of scope this iteration

- Video and motion
- Multi-language versions
- CMS-driven content updates
- Public marketing site at the root of the subdomain

---

## 5. Repository and file structure

The repo is architected as a **partner-portal**, not a single-deck site. The Nat Geo deck is the first build; the same infrastructure will host future pitch decks (Saudi, Emaar, Etihad, others) at sibling paths. The design system lives in `/shared/` so future decks inherit the foundation.

### 5.1 GitHub repository

- **Org:** Hero Experiences Group (company GitHub org)
- **Repo name:** `partner-decks` (suggested) — private
- **Default branch:** `main`
- **GitHub Pages:** enabled, source `main` branch

### 5.2 URL structure

```
partners.hero-experiences.com/                      → root (blank or 404)
partners.hero-experiences.com/natgeo-<suffix>/      → this deck (suffix obfuscation per 11.3.1)
partners.hero-experiences.com/<future>/             → future decks
```

Subdomain pending internal DNS approval. Working name: `partners.hero-experiences.com`.

### 5.3 File tree

```
partner-decks/
├── PRD.md                               # this document — single source of truth
├── CLAUDE.md                            # Claude Code working context
├── README.md
│
├── shared/                              # design system shared across all decks
│   ├── css/
│   │   ├── tokens.css                   # color, type, spacing tokens
│   │   ├── base.css                     # reset, typography, layout primitives
│   │   ├── components.css               # reusable slide components
│   │   └── print.css                    # PDF-export stylesheet
│   ├── fonts/                           # self-hosted webfonts
│   ├── js/
│   │   └── deck.js                      # vanilla navigation, lazy loading
│   └── README.md
│
├── natgeo/
│   ├── index.html
│   ├── slides/                          # one HTML partial per slide (if multi-file)
│   ├── assets/
│   │   ├── images/                      # WebP + JPG fallbacks
│   │   └── README.md                    # image source manifest
│   ├── copy/                            # source-of-truth copy files (Phase C output)
│   │   ├── 01-cover.md
│   │   ├── 02-paradox.md
│   │   ├── 03-vision.md
│   │   ├── 03-5-why-arabia.md
│   │   ├── 04-why-natgeo.md
│   │   ├── 05a-why-hero.md
│   │   ├── 05b-recognition.md
│   │   ├── 06-problem.md
│   │   ├── 06-5-why-now.md
│   │   ├── 07-solution.md
│   │   ├── 08-experience-framework.md
│   │   ├── 08-5-conservation-culture-education.md
│   │   ├── 09-unmatched.md
│   │   ├── 10-commercial-value.md
│   │   ├── 11-implementation.md
│   │   ├── 12-big-idea.md
│   │   ├── 12-5-the-ask.md
│   │   └── 13-closing.md
│   └── README.md
│
└── reference/
    ├── natgeo-values.md                 # Nat Geo travel partnership values reference
    └── source-pack.md                   # every Hero claim with citation and verification status
```

---

## 6. Content rules

These are absolute. Claude Code must enforce them across all generated copy.

### 6.1 Voice

- **Declarative, not persuasive.** "Hero operates the only ecotourism-certified desert safari in Dubai." NOT "Hero is proud to be one of the leading…"
- **Short sentences.** Most under 12 words. No stacked clauses for effect.
- **No marketing adjectives.** Banned: *world-class, breathtaking, unforgettable, exclusive, bespoke, curated, elevated, journey* (as a noun), *unparalleled, exquisite, immersive* (overused — earn it with imagery instead).
- **No exclamation points. Ever.**
- **British English** (UAE/Nat Geo convention): *recognised, organisation, programme, centre.*
- **Numerals over words** for any figure ≥ 10.

### 6.2 Headlines

- All headlines sentence case (not Title Case, not ALL CAPS) — except cover labels and section openers, which may use small caps for metadata
- Maximum 8 words per headline
- One headline per slide

### 6.3 Body copy

- 1–3 short paragraphs OR a short list — never both on the same slide
- Lists: 3–5 items, parallel structure, no terminal punctuation
- Pull quotes: maximum 14 words, set in italic serif, given full visual weight

### 6.4 Credibility claims — source pack

Every claim about Hero must be **verifiable, dated, and sourced.** The canonical source pack lives in `/reference/source-pack.md` and is the only place where approved facts are stored. Claude Code must never use a claim not in the source pack.

Each entry specifies:
- **Claim** — exact wording as it appears
- **Year(s)** — date or date range
- **Source** — publication, organisation, or evidence
- **Source link or reference**
- **Verification status** — `verified`, `pending`, or `needs-source`

**Source pack snapshot (canonical version: `/reference/source-pack.md`):**

| # | Claim | Year(s) | Source | Status |
|---|---|---|---|---|
| 1 | Founded as Platinum Heritage | 2012 | Hero corporate history | verified |
| 2 | Hero Experiences Group formed | 2019 | Hero corporate history | verified |
| 3 | World Travel Awards — Middle East's Leading Desert Safari Company | 8 wins between 2016–2024 (2021 omitted) | worldtravelawards.com | verified — third-party citations confirmed 2026-05-12 (URLs in source-pack.md) |
| 4a | World Travel Awards — Middle East's Leading Balloon Ride Operator | 2020–2025 (6 consecutive years) | worldtravelawards.com | verified — third-party citations confirmed 2026-05-12 (URLs in source-pack.md) |
| 4b | World Travel Awards — World's Leading Balloon Ride Operator | 2020–2023 | worldtravelawards.com | verified (self-source; awarding-body link pending) |
| 5 | Layalina Editor's Choice Award — The Dubai Balloon | 2024 | awards.layalina.com | verified — third-party citation confirmed (URL in source-pack.md); previous wording "Best Luxury Cultural Adventure Experience" was incorrect — actual award is for The Dubai Balloon, a Hero product |
| 6 | Luxury Lifestyle Awards — Luxury Travel Dubai | 2025 | luxurylifestyleawards.com | verified — third-party citation confirmed (URL in source-pack.md); category is "Luxury Travel" within "Travel Experiences", location Dubai |
| 7a | TripAdvisor Certificate of Excellence | 2013–2019 | tripadvisor.com | verified (self-source; awarding-body link pending) |
| 7b | TripAdvisor Hall of Fame | 5 consecutive years within 2015–2019 | tripadvisor.com | verified (self-source; awarding-body link pending) |
| 7c | TripAdvisor Travelers' Choice | 2020–2025 | tripadvisor.com | verified (self-source; awarding-body link pending) |
| 8 | Only ecotourism-certified desert safari operator in Dubai | current | certifying body — needs name | needs-source (may be satisfied by Dubai Sustainable Tourism #17 or Dubai Green Tourism #18; pending Jcamp confirmation) |
| 9 | Operates inside Dubai Desert Conservation Reserve (UAE's first national park) | current | DDCR / Emirates Wildlife Society | verified — publicly documented |
| 10 | Restored vintage fleet (single minimal mention only) | current | internal — Hero corporate | verified — operational fact, no figures used |
| 11 | Solar-powered camps | current | internal | verified |
| 12 | Hydro panels for drinking water | current | internal | verified |
| 13 | 9-language guide capability | current | internal | verified |
| 14 | Michelin-starred chef collaboration (Platinum Collection dining) | current | internal — chef name needed | needs-source |
| 15 | Guests served | current | internal | pending — current figure needed |
| 16 | Operating in UAE and KSA (AlUla, Sharaan Nature Reserve, Khaybar) | current | internal | verified |
| 17 | Dubai Sustainable Tourism (certification by Dubai DET) | current | Dubai Department of Economy and Tourism | verified (self-source; awarding-body link pending) |
| 18 | Dubai Green Tourism (certification by Dubai DET) | current | Dubai Department of Economy and Tourism | verified (self-source; awarding-body link pending) |
| 19 | International Sustainable Luxury Awards | 2023 | International Sustainable Awards | verified (self-source; awarding-body link pending) |
| 20 | Gulf Sustainability & CSR Awards — Winner | 2018 | Gulf Sustainability Awards | verified (self-source; awarding-body link pending) |

**Rules:**
- Status `verified` may ship to final copy
- Status `pending` may appear in drafts but must be flagged `[pending verification]` until resolved
- Status `needs-source` may NOT appear in shipped copy
- New claims added during execution must be added to the source pack with status assigned before the slide ships
- The source pack travels with the deck — Nat Geo's legal/partnership team will ask for it

### 6.5 Land Rovers — special handling (new in v4)

The restored 1950s Land Rover fleet has been deliberately de-emphasised per Hero's preference. Rules:

- **One minimal mention permitted, in Slide 5a only** — referenced as part of operational character, no more than 4 words
- **No CO₂-avoidance figure** anywhere in the deck (the "362 tonnes" claim is removed from the source pack)
- **No Land Rover imagery** in any slide
- **No detailed elaboration** — fleet is operational context, not a marketing point

This protects against a category Hero is not currently prepared to commit to publicly.

---

## 7. Nat Geo alignment checklist

For each slide, Claude Code verifies before finalising:

- [ ] Does this reinforce conservation, authenticity, sustainability, guest experience, or community benefit?
- [ ] Does this avoid sounding like a typical Dubai luxury pitch?
- [ ] Could this slide appear in Nat Geo Traveler magazine without edits?
- [ ] Is every factual claim cited in `/reference/source-pack.md` with status `verified` or flagged `[pending verification]`?
- [ ] Does this avoid claiming formal eligibility for any specific Nat Geo programme?
- [ ] Is there exactly one idea on this slide?
- [ ] Does the slide's mode (immersive or restrained per Section 3.5) match its purpose?
- [ ] If this slide mentions Land Rovers, does it conform to Section 6.5 rules?

---

## 8. Slide-by-slide spec

17 slides total. Mode (Immersive or Restrained) noted per slide.

### Slide 1 — Cover (Immersive)

- **Headline:** *National Geographic × Hero Experiences*
- **Subhead:** *A proposal to create the world's definitive desert expedition*
- **Meta line (small caps, base of slide):** *Dubai · United Arab Emirates · 2026*
- **Image:** Full-bleed, a single dune ridge at first light. No people. No vehicles. Silence.
- **Layout:** Image fills slide. Typography sits low-left, generous space above. Both logos appear in the bottom margin, equal weight, typographic treatment (no lockup).

### Slide 2 — The paradox (Restrained)

- **Headline:** *Dubai has a paradox.*
- **Body (two short stacked statements, generous space between):**
  - *One of the world's most visited destinations.*
  - *One of the world's most commoditised safari categories.*
- **Closing line (bottom, smaller):** *The gap is the opportunity.*
- **Image:** None — or a single sparse photograph in the right third (an empty dune horizon).
- **Layout:** Asymmetric. Type left, image (if used) right. White space dominates.

### Slide 3 — The vision (Immersive)

- **Headline:** *From desert safari to global desert heritage expedition.*
- **Body:**
  > A co-created experience between National Geographic and Hero Experiences Group — the first product to sit alongside Nat Geo's global expedition portfolio in the Arabian desert.
- **Image:** Full-bleed wide shot at golden hour — landscape-dominant, suggesting scale and silence. Avoid vehicles per Section 6.5.
- **Layout:** Image dominant. Headline overlaid bottom-left in bone. Body in two-line caption format below.

### Slide 3.5 — Why the Arabian desert matters (Immersive) — *new in v4*

- **Headline:** *The desert is older than the city around it.*
- **Body (short atmospheric paragraph):**
  > The Arabian desert holds 12,000 years of human cultural memory and one of the most distinctive arid ecosystems on Earth. The Bedouin tradition that mapped it is still alive. The wildlife that defined it — oryx, gazelle, sand fox — is returning. This landscape predates Dubai by millennia. It is the heritage Dubai is built on top of.
- **Image:** Full-bleed wide landscape — a long horizon, sand and sky, low light. No human elements.
- **Layout:** Image fills slide. Text overlaid in a low-contrast band along the lower third.
- **Why this slide:** Jcamp's original brief called for "Why Dubai/UAE desert heritage matters." The deck without this slide skipped from operator credibility straight to commercial argument. This slide is the heritage and ecology grounding that makes the rest of the deck land.

### Slide 4 — Why National Geographic (Restrained)

- **Headline:** *Nat Geo brings what no operator can.*
- **Body (four-line list, generous spacing):**
  - Global credibility in exploration
  - Scientific authority in ecosystems
  - Unmatched storytelling power
  - A mission rooted in conservation and education
- **Pull line (below list, italic serif, slightly smaller):** *This is not branding. This is co-creation of a new category standard.*
- **Image:** None. Typographic slide on bone.
- **Layout:** Centred or left-aligned. Maximum restraint.

### Slide 5a — Who Hero is (Restrained)

- **Headline:** *We already operate at the standard.*
- **Body:**
  > Hero Experiences Group operates Dubai's only ecotourism-certified desert safari, inside the UAE's first national park — the Dubai Desert Conservation Reserve. Our camps run on solar power. Our guides speak 9 languages. Our vintage fleet has been carefully restored.
- **Image:** A single landscape detail — sand, light, texture. No vehicles, no people, no buildings.
- **Layout:** Image right half. Copy left half. Generous margins.
- **Note on Land Rovers (per Section 6.5):** "Our vintage fleet has been carefully restored" is the single permitted reference. No figures. No imagery.

### Slide 5b — Recognition (Restrained)

- **Headline:** *Recognised globally. Repeatedly.*
- **Body (two-grouping typographic treatment — no logos, no badges):**

  *Travel & hospitality* (small-caps section label in deep sand)
  - World Travel Awards — Middle East's Leading Desert Safari Company, 2016–2022
  - World Travel Awards — Leading Balloon Ride Operator (Middle East 2020–2024; World's 2020–2023)
  - Layalina Editor's Choice Award, 2024 [specific category wording pending]
  - Luxury Lifestyle Awards — Winner, 2025 [specific category wording pending]
  - TripAdvisor — Certificate of Excellence 2013–2019 (Hall of Fame); Travelers' Choice 2020–2025

  *Sustainability & conservation* (same section-label treatment, slightly larger top margin)
  - Gulf Sustainability & CSR Awards — Winner, 2018
  - International Sustainable Luxury Awards, 2023
  - Dubai Sustainable Tourism · Dubai Green Tourism (Dubai DET certifications)

- **Meta line (bottom, small caps):** *Operating in UAE and KSA · since 2012*
- **Image:** None. Bone background. Museum wall label.
- **Layout:** Two stacked groupings, each headed by a small-caps section label in deep sand. Within each grouping, awards stack with fine warm-rust hairline rules between entries. Groupings separated by a slightly larger interval. Headline upper-centre, meta line bottom-centre.

### Slide 6 — The problem (Immersive — split layout)

- **Headline:** *Most desert safaris are not desert experiences.*
- **Body (two parallel columns, side-by-side, no labels — imagery speaks):**

  | Left | Right |
  |---|---|
  | Quad bikes, henna, neon, buffet | Falcon, silence, fire, story |
  | Mass tourism | The standard we propose |

- **Image:** Two photographs side by side. Left: a commoditised safari scene (crowded camp, generic lighting). Right: a Hero scene (sparse, cinematic, Bedouin storyteller at dusk).
- **Layout:** 50/50 split. No copy between except a thin centreline rule.

### Slide 6.5 — Why now (Restrained)

- **Headline:** *This is the window.*
- **Body (four short lines, stacked, generous spacing):**
  - The GCC is becoming the world's fastest-growing premium tourism region
  - Conservation-led travel is replacing volume-driven travel
  - Saudi Arabia and the UAE are scaling cultural and natural destinations at unprecedented pace
  - The category leader will be defined now, not later
- **Closing line (smaller, below):** *A definitive desert experience can be claimed once. The moment is open.*
- **Image:** None, or a single restrained landscape image as horizon band at the base.
- **Layout:** Typographic. Left-aligned. Maximum restraint.

### Slide 7 — The solution (Immersive)

- **Headline:** *A new benchmark: the National Geographic Desert Expedition — UAE.*
- **Body (three short lines, stacked):**
  - A layered expedition, not a tour
  - A narrative arc, not a checklist
  - A transformational experience, not entertainment
- **Image:** Wide cinematic shot at dawn — dunes rolling into haze, scale and silence, no vehicles.
- **Layout:** Image top two-thirds. Copy bottom third on bone band.

### Slide 8 — Experience design framework (Restrained)

- **Headline:** *Five pillars. One expedition.*
- **Body (5 pillars, each one line of headline + one line of detail):**
  - **Exploration** — guided by trained Explorer Guides; geology, ecology, navigation
  - **Wildlife and conservation** — Arabian oryx, gazelle, and desert fox tracking tied to active conservation programmes
  - **Cultural heritage** — Bedouin tradition and falconry as living practice, not performance
  - **Immersion** — silence zones and night-sky astronomy in protected reserve
  - **Storytelling** — each expedition framed as documentary; guests as participants, not spectators
- **Footer (small, italic):** *Aligned with the values Nat Geo applies across its travel partnerships: conservation, authenticity, sustainability, guest experience, and community benefit.*
- **Image:** None.
- **Layout:** Five rows. Hairline rules between. Pillar names in serif display; detail in sans.

### Slide 8.5 — Conservation, culture, education (Immersive) — *new in v4*

- **Headline:** *Three threads run through every expedition.*
- **Body (three short paragraphs paired with three images, magazine-spread style):**
  - **Conservation** — Active partnership with the Dubai Desert Conservation Reserve. Guest expeditions contribute directly to oryx and gazelle monitoring programmes. Every visit funds the landscape that hosts it.
  - **Culture** — Bedouin storytellers, falconers, and guides — not actors. The traditions guests encounter are still practised by the families that practise them.
  - **Education** — Each expedition framed as field learning. Geology, ecology, navigation, astronomy, anthropology — taught by domain practitioners, not narrators.
- **Image:** Three documentary-style images, magazine grid — one per pillar. Atmospheric, not posed.
- **Layout:** Three-column grid on a single slide. Each column: image top, headline middle, paragraph below.
- **Why this slide:** Jcamp's original brief explicitly required "Conservation/culture/education components." v3 folded these into the framework slide; v4 gives them their own dedicated slide because they are the editorial heart of why Nat Geo would say yes.

### Slide 9 — What makes this unmatched (Restrained)

- **Headline:** *Not replicable.*
- **Body (two columns, parallel):**
  - **Nat Geo** — global authority
  - **Hero** — local operational mastery
- **Pull line (centred below):** *Science. Story. Access. Execution.*
- **Closing line:** *The only desert expedition chosen not by default, but because it stands above everything else.*
- **Image:** None. Typographic.
- **Layout:** Two columns, equal weight, divided by a fine vertical rule.

### Slide 10 — Commercial and brand value for Nat Geo (Restrained)

- **Headline:** *What this opens for Nat Geo.*
- **Body (four-line list):**
  - Entry into ultra-premium experiential travel in the GCC
  - A flagship product in one of the world's top tourism hubs
  - A content pipeline: documentary, digital, editorial, education
  - A scalable model: UAE → Saudi Arabia → arid landscapes worldwide
- **Image:** None.
- **Layout:** Left-aligned, generous spacing.

### Slide 11 — Implementation (Restrained)

- **Headline:** *How we build this.*
- **Body (three phases, horizontal timeline treatment):**
  - **Phase 1 — Co-design** — experience framework developed with Nat Geo experts; scientific and cultural validation
  - **Phase 2 — Pilot (Dubai)** — limited-capacity, invitation-only flagship launch
  - **Phase 3 — Expansion** — replicable expedition model adapted to other arid ecosystems
- **Image:** A single landscape photograph as horizon band beneath the timeline.
- **Layout:** Horizontal three-step. Phase numbers in serif display. Each phase a column.

### Slide 12 — The big idea (Immersive — pull quote)

- **Headline:** None. This slide is a pull quote.
- **Pull quote (large, serif italic, centred):**
  > Dubai does not need another desert safari.
  > It needs the one the world recognises as the best.
- **Image:** Full-bleed, very dark — a desert at blue hour, almost monochrome. Quote sits in bone over the lower-mid section.
- **Layout:** Cinematic. This is the deck's emotional peak.

### Slide 12.5 — The ask (Restrained)

- **Headline:** *The proposal.*
- **Body (single declarative statement, serif display, full visual weight):**
  > We are asking National Geographic to enter a structured co-design process with Hero Experiences — to define, validate, and pilot the first National Geographic desert expedition product in the UAE.
- **Closing line (smaller, below):** *A pilot. A standard. A new category — co-created.*
- **Image:** None. Bone background. The deck's clearest, most direct slide.
- **Layout:** Centred, generous margins.
- **Why this slide:** Senior partnership executives need an explicit ask. Without it, the deck implies a partnership but never states what decision is being requested.

### Slide 13 — Closing (Immersive)

- **Headline:** *Together.*
- **Body (two parallel columns):**
  - **Hero Experiences brings** — proven delivery, market leadership, cultural credibility
  - **National Geographic brings** — global authority, scientific integrity, storytelling power
- **Closing line (bottom, centred, small caps):** *We redefine what a desert experience means.*
- **Image:** Full-bleed, mirrors the cover image but at last light — closing the visual loop.
- **Layout:** Two columns over image. Closing line as footer band.

---

## 9. Working agreement for Claude Code

When Claude Code picks this up:

1. **Read `PRD.md` first.** Always. Before writing any copy or code.
2. **Check `CLAUDE.md`** for current task state and session notes.
3. **Generate copy files first** (one Markdown file per slide under `/natgeo/copy/`), conforming to Section 8. Do not invent claims. Do not soften the voice.
4. **Validate each copy file against the alignment checklist** (Section 7) before marking it complete.
5. **Build the HTML production deck second.** Start with Phase B1 (slides 1–5b) to establish the design system in `/shared/`, then extend to B2.
6. **Mobile-first.** Every component designed for phone first, scaled up.
7. **Image discipline.** Placeholder imagery with documented sources in `/natgeo/assets/README.md`. Always WebP + JPG fallback. Always lazy-load below the fold.
8. **Honor the immersive/restrained rhythm** per Section 3.5. A slide marked Restrained must not get an atmospheric image; a slide marked Immersive must not be typographic-only.
9. **Never modify this PRD without flagging the change** in `CLAUDE.md` and asking for confirmation.

### Banned in all generated content

- The adjectives listed in Section 6.1
- Exclamation points
- Em dashes as a stylistic substitute for periods (use sparingly, grammatically only)
- Title Case headlines
- Stock icon sets, badge-style award marks, rounded-corner cards, gradients
- The word "journey" as a noun
- Land Rover details beyond the single Slide 5a mention (Section 6.5)
- Any claim not in Section 6.4 / source pack
- Black-on-gold or gold-on-black color treatment

---

## 10. Success criteria

The PRD is successful if:

1. The completed deck reads as if it could have been produced by Nat Geo's own editorial team
2. Every claim about Hero is verifiable via the source pack
3. The Nat Geo team would recognise their travel partnership values reflected in the framework
4. The deck has zero marketing clichés
5. The deck feels globally iconic, not locally touristic (Jcamp's original brief)
6. A senior brand executive could open it, read it in 4 minutes, and want a follow-up meeting
7. The hosted URL loads in under 3 seconds on a 4G mobile connection
8. The same infrastructure can host the next pitch deck with no rebuild of the foundation

---

## 11. Hosting and deployment

### 11.1 Hosting platform

- **GitHub Pages**, served from the `partner-decks` repo in the Hero Experiences Group GitHub organisation
- Branch: `main`. Build: none. TLS: automatic. Cost: zero.

### 11.2 Domain

- **Subdomain:** `partners.hero-experiences.com` (working name — final to be confirmed)
- **Parent domain:** `hero-experiences.com` (owned by Hero Experiences Group)
- **DNS record required:** one `CNAME` from `partners.hero-experiences.com` → `<github-org>.github.io`
- **Approval needed from:** internal IT / DNS administrator
- **Deck URL:** `partners.hero-experiences.com/natgeo-<suffix>/`
- **Future decks:** sibling paths — `/saudi`, `/emaar`, etc.

### 11.3 Access control — Cloudflare Access (confirmed)

`hero-experiences.com` is on Cloudflare (nameservers `beth.ns.cloudflare.com` and `ricardo.ns.cloudflare.com`, confirmed 2026-05-12). **Cloudflare Access is the locked auth approach.**

**Setup:**
- Configure Cloudflare Access on the `partners.hero-experiences.com` subdomain
- Free tier — up to 50 users
- Auth method: email one-time PIN (no password to leak, every login logged with email + timestamp + IP)

**Per-path access policies:**

| Path | Policy | Approved emails |
|---|---|---|
| `/natgeo-<suffix>/` | "Nat Geo deck" | Named Nat Geo recipients + Hero internal team |
| `/saudi/` (future) | "Saudi deck" | Saudi partner recipients + Hero internal team |
| `*@hero-experiences.com` | "Hero internal" | Anyone with a Hero email — sees everything |

**Why this matters:** a leaked Nat Geo credential doesn't compromise future pitches. Every access is identifiable. Approved recipient lists editable in the Cloudflare dashboard at any time.

### 11.3.1 Layered defence

In addition to Cloudflare Access, the Nat Geo deck path uses an **obfuscated URL**:

- Actual path: `partners.hero-experiences.com/natgeo-<random-suffix>/`
- `robots.txt` blocks all crawlers
- `<meta name="robots" content="noindex,nofollow">` on every page
- Deck does not appear in any sitemap

Even if the URL leaks, Cloudflare Access stops access. Even if Cloudflare Access were misconfigured, the deck is undiscoverable via search.

### 11.4 Analytics — two layers

**Layer 1 — Cloudflare Access logs (who and when).** Lives inside the Cloudflare dashboard. Every authenticated entry: email, timestamp, location, path. Requires Jcamp to be added as a Cloudflare team member with Access logs viewer role (part of the IT permission ask, Section 11.6).

**Layer 2 — Plausible Analytics (what they did inside).** Lightweight tracking script. Per-slide views, time on slide, scroll depth, completion rate, device class, referrer. Cookieless, no consent banner required. Owned directly by Jcamp — no IT involvement. ~$9/month.

**Useful intelligence:** "Sarah from Nat Geo opened the deck three times this week" (Layer 1) + "She spent 4 minutes on the experience framework slide and 45 seconds on awards" (Layer 2) = strategic follow-up timing.

### 11.5 Performance budget

| Metric | Target |
|---|---|
| First contentful paint (4G mobile) | under 1.5s |
| Time to interactive (4G mobile) | under 3s |
| Cover slide weight | under 2MB |
| Full deck weight | under 15MB |
| Lighthouse performance score | 90+ |
| Lighthouse accessibility score | 95+ |

### 11.6 Internal approval — what to request

When Jcamp asks Hero IT / management for permission:

1. **One subdomain** — `partners.hero-experiences.com` — Cloudflare DNS, CNAME to GitHub Pages
2. **Cloudflare Access enabled** on the subdomain — free tier
3. **Team-member access for Jcamp** — view-only on:
   - Access logs for the `partners.` subdomain
   - DNS for the `partners.` subdomain
4. **One-time setup, ongoing reuse** — permanent partnership pitch infrastructure

**What this is not:** admin rights, root-domain changes, mail/production system impact.

### 11.7 Deployment workflow

1. Push to `main` on `partner-decks` repo
2. GitHub Pages auto-deploys within ~60 seconds
3. CDN propagation typically under 5 minutes
4. Smoke-test on mobile and desktop
5. Lighthouse audit must pass performance budget (11.5) before external share

---

## 12. Document evolution

Current single-file PRD is the right shape for execution. Post-pitch, when this becomes reusable infrastructure for future decks (Saudi, Emaar, etc.), split into:

| File | Scope | Reusable |
|---|---|---|
| `PRD.md` | Project-specific brief, success criteria, status | Per pitch |
| `STRATEGY.md` | Positioning, audience, narrative architecture | Per pitch |
| `COPY_SPEC.md` | Slide-by-slide copy spec | Per pitch |
| `BUILD_SPEC.md` | Design system, repo, hosting, deployment | **Shared** |
| `CLAUDE.md` | Working context for Claude Code | Per pitch, template reusable |

**Do not split now.** Split after Phase B completes, before the next pitch begins.

---

*End of PRD v4.*
