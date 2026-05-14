# natgeo/assets

Image manifest for the Hero × Nat Geo deck. Every image used in the build is listed here with its intended direction, source status, and the slide it serves.

## Image discipline (PRD 9.7 / locked B1 decisions)

- Placeholder imagery acceptable in B1. CSS gradients in `shared/css/components.css` (`.full-bleed--placeholder`, `.split__image--placeholder`) stand in until real assets arrive.
- Every image: WebP primary + JPG fallback (PRD 4.2). Currently JPG only — WebP variants to be generated when real imagery is commissioned.
- Lazy-load below the fold. Cover (slide 1) uses `loading="eager"`. All others `loading="lazy"`.
- Mobile-first crop preserves the dominant compositional element in portrait orientation.
- Documentary register only. Never advertising-lit. No vehicles in frame (PRD 6.5). No people in cover, vision, or Arabia slides.
- Target weight: cover under 800KB; each subsequent image under 600KB. (Current vision image is 1.1MB — acceptable for B1 placeholder; will be re-sized or replaced with commissioned imagery for final.)

## Image status (2026-05-14)

**All 14 slots now wired with real photography.** 13 from Hero's own Platinum Heritage / DDCR archive, 1 kept Unsplash (Slide 3 vision, approved by Jcamp). All images compressed via sharp (mozjpeg) — total ~2.5MB for all wired images.

| Slot | Source | Status |
|---|---|---|
| 01 Cover | Hero archive — Platinum Heritage (30) landscape, colour graded | ✅ Final-ready |
| 02 Paradox sparse | Hero archive — Platinum Heritage (32), same as Slide 13 | ✅ Final-ready (sparse variant set as default) |
| 03 Vision | Unsplash — Chanbora Chhun (re-encoded 244KB) | Approved by Jcamp; replace if Hero archive available |
| 03.5 Arabia | Hero archive — Platinum Heritage (23), colour graded | ✅ Final-ready |
| 05a Hero | Hero archive — Platinum Heritage (26) | ✅ Final-ready |
| 06 Left | Hero archive — 06-left (commoditised camp aerial) | ✅ Final-ready |
| 06 Right | Hero archive — 06-right (campfire scene) | ✅ Final-ready |
| 07 Solution | Hero archive — Desert Dunes (10), figure walking dune ridge toward sun | ✅ Final-ready — figure-exception granted by Jcamp 2026-05-14 |
| 08.5 Conservation | Hero archive — Nature Drive (6), Arabian gazelles in DDCR | ✅ Final-ready |
| 08.5 Culture | Hero archive — Bedouin Breakfast (2), guide + guests in tent | ✅ Final-ready |
| 08.5 Education | Hero archive — Stargazing (16), guide with laser pointer + guests | ✅ Final-ready |
| 11 Horizon | Hero archive — DDCR (52), wide landscape with horizon line and ghaf scrub | ✅ Final-ready |
| 12 Big idea | Hero archive — Desert Dunes (38), figure walking toward hazy sun, deep-dim overlay applied | ✅ Final-ready — figure-exception applies |
| 13 Closing | Hero archive — Platinum Heritage (32) | ✅ Final-ready |

## Slide 7 + 12 — figure exception (PRD §8 relaxed)

PRD §8 originally said "no figures" for Slide 7 (Solution) AND Slide 12 (Big Idea). Exception granted 2026-05-14 for both: a single small figure walking the dune ridge toward sun, with footprints leading to horizon. The figure reads as documentary scale-element, not advertising-model — exactly the editorial register Nat Geo Traveler uses for feature opener shots and emotional-peak moments.

The "no figures" rule was a defensive choice written before we knew what imagery would be available. Hero's strongest real photographs have figures providing scale. The exception was relaxed in favour of authenticity — better to ship real photography with a figure than synthetic imagery without one. AI-enhanced/synthesized alternatives were explicitly rejected as a path forward; Nat Geo's photo editors would catch AI tells (missing ghaf scrub, over-smooth dune patterns, synthetic atmosphere).

Slide 12 uses Desert Dunes (38) with a heavier darkening overlay (`.full-bleed--deep-dim` in `shared/css/components.css`) so the image reads near-twilight monochrome, satisfying the brief's "blue hour, almost monochrome" register. The figure becomes a silhouette, the sun a small focal point.

## Manifest

### Slide 1 — Cover (Immersive · full-bleed)

| File | `images/01-cover.jpg` (2400×1600, 458KB) |
|---|---|
| Slot | `.full-bleed` on `#sec-cover` |
| Direction | A single dune ridge at first light. No people. No vehicles. Silence. Documentary, not advertising-lit. |
| Aspect | Landscape 3:2; mobile crop preserves dune ridge low in frame. |
| Status | **B1 placeholder — Unsplash** |
| Source | Photo by Rico Meier on Unsplash · ID `xUl3zwhNPXs` · [unsplash.com/photos/xUl3zwhNPXs](https://unsplash.com/photos/xUl3zwhNPXs) |
| Replacement | Commission documentary photographer, or use Hero's location archive at first light. |

### Slide 2 — The paradox (Restrained · sparse image variant)

| File | `images/02-paradox.jpg` (1600×1067, 171KB) |
|---|---|
| Slot | `.paradox__image` on `#sec-paradox` (visible only when `data-image="sparse"`) |
| Direction | An empty dune horizon, no foreground subject, no human elements. Atmospheric note only. |
| Aspect | Landscape 3:2 (cropped in 3:4 portrait container by `object-fit: cover`). |
| Status | **B1 placeholder — Unsplash.** Default variant is `data-image="none"` per locked decision; press `V` in the running deck to toggle. |
| Source | Photo by Noemi Talina on Unsplash · ID `0p2g37qjp3s` · [unsplash.com/photos/0p2g37qjp3s](https://unsplash.com/photos/0p2g37qjp3s) |
| Replacement | Decision deferred to Jcamp's B1 review; if `sparse` variant wins, commission or license a true vertical-crop empty horizon. |

### Slide 3 — The vision (Immersive · full-bleed)

| File | `images/03-vision.jpg` (2400×1600, 1.1MB) |
|---|---|
| Slot | `.full-bleed` on `#sec-vision` |
| Direction | Wide shot at golden hour. Landscape-dominant; long horizon, volumetric light raking dune fields. No figures. |
| Aspect | Landscape 3:2; mobile crop preserves horizon in lower third. |
| Status | **B1 placeholder — Unsplash.** File size is ~2× the per-image budget; re-encode at lower quality or replace with commissioned imagery before final. |
| Source | Photo by Chanbora Chhun on Unsplash · ID `CIfDh_uPgLs` · [unsplash.com/photos/CIfDh_uPgLs](https://unsplash.com/photos/CIfDh_uPgLs) |
| Replacement | Commissioned golden-hour landscape from Hero's archive or licensed editorial. |

### Slide 3.5 — Why the Arabian desert matters (Immersive · full-bleed, lower band)

| File | `images/03-5-arabia.jpg` (2400×1600, 563KB) |
|---|---|
| Slot | `.full-bleed.full-bleed--lower-band` on `#sec-arabia` |
| Direction | A long horizon. Sand below, sky above, low light. Pre-human composition. |
| Aspect | Landscape 3:2; mobile crop preserves single dominant horizon line across the middle. |
| Status | **B1 placeholder — Unsplash** |
| Source | Photo by Ashim D'Silva on Unsplash · ID `bmveAmxzfNY` · [unsplash.com/photos/bmveAmxzfNY](https://unsplash.com/photos/bmveAmxzfNY) |
| Replacement | Hero's archive (DDCR sunrise/sunset) or licensed editorial photography. |

### Slide 4 — Why National Geographic (Restrained · no image)

No image. Typographic slide on bone background. Pull line separated by warm-rust hairline rule.

### Slide 5a — Who Hero is (Restrained · split, image right half)

| File | `images/05a-hero.jpg` (1600×939, 160KB) |
|---|---|
| Slot | `.split__image` on `#sec-hero` |
| Direction | A single landscape detail — sand, light, texture. Tight crop. Documentary, almost still-life. No vehicles, no people, no buildings. |
| Aspect | Landscape 16:9 (cropped to 4:5 portrait container by `object-fit: cover`). |
| Status | **B1 placeholder — Unsplash** |
| Source | Photo by Jared Evans on Unsplash · ID `Wwg1TzCuV9E` · [unsplash.com/photos/Wwg1TzCuV9E](https://unsplash.com/photos/Wwg1TzCuV9E) |
| Replacement | Hero's archive — a real detail of compacted sand in raking light from a DDCR expedition would land harder than any licensed stock. |

### Slide 5b — Recognition (Restrained · no image)

No image. Museum-wall typographic treatment on bone. Two stacked groupings (Travel & hospitality / Sustainability & conservation) with section labels in small-caps deep sand and warm-rust hairline rules between entries.

### Slide 6 — The problem (Immersive · split layout with two images)

| File | `images/06-left.jpg` and `images/06-right.jpg` (each 1200×1600, placeholder 200KB) |
|---|---|
| Slot | Two images side by side in a 50/50 split, divided by a thin warm-rust vertical rule. No `.full-bleed`; images sit within the section container. |
| Direction | **Left:** a commoditised desert-safari scene. Crowded camp, generic strip lighting, quad bikes parked at edge, buffet line in middle distance. Documentary register — not flattering, not satirising. Familiar but generic. **Right:** a Hero-register scene. Bedouin storyteller seated by low fire at dusk, falcon on glove in soft focus, sparse camp, firelight. No vehicles, no quad bikes, no neon. Both photographs at roughly equivalent times of day so contrast is editorial, not lighting-driven. |
| Aspect | Portrait 2:3 (1200×1600). Mobile crop: stack the two photographs vertically. |
| Status | **Pending — placeholder gradient active** |
| Replacement | Commission two images as described, or source from Hero's archive paired with a licensed editorial image matching the "standard we propose" register. |

### Slide 6.5 — Why now (Restrained · no image, or sparse horizon band at base)

| File | No image (Option A) or `images/06-5-horizon.jpg` (Option B, 2400×600, <250KB) |
|---|---|
| Slot | None (Option A) or `.horizon-band` at the very bottom of the slide, beneath closing line, as a quiet ground (Option B). |
| Direction | **Option B only:** a single restrained landscape image as a horizon band at the base of the slide. No more than a fifth of the slide's height. A long dune horizon, low light, no figures. Used only as a quiet atmospheric ground, never to compete with type. |
| Aspect | Landscape ultra-wide (2400×600). |
| Status | **Pending — Option A (no image) active. Decision deferred to Phase B1 visual review based on rhythm after Slide 6 (image-heavy split).** |
| Replacement | Decision to be made by Jcamp during B1 review. If Option B wins, commission or license a quiet horizon band matching the described direction. |

### Slide 7 — The solution (Immersive · full-bleed)

| File | `images/07-solution.jpg` (2400×1600, placeholder 450KB) |
|---|---|
| Slot | `.full-bleed` on `#sec-solution` |
| Direction | A wide cinematic shot at dawn. Dunes rolling into haze, scale and silence, no vehicles. No figures. Landscape is the subject. Long focal compression, warm-cool tension between dune face and morning haze. The image occupies the top two-thirds of the slide. |
| Aspect | Landscape 3:2; mobile crop preserves rolling dunes across lower two-thirds. |
| Status | **Pending — placeholder gradient active** |
| Replacement | Commissioned dawn landscape from Hero's archive or licensed editorial. High-altitude or compressed perspective preferred. |

### Slide 8 — Experience design framework (Restrained · no image)

No image. Five-pillar typographic treatment with serif display pillar names and sans details, separated by warm-rust hairline rules. Footer in italic serif. No imagery needed.

### Slide 8.5 — Conservation, culture, education (Immersive · three-column magazine grid)

| File | `images/08-5-conservation.jpg`, `images/08-5-culture.jpg`, `images/08-5-education.jpg` (each 1000×1200, placeholder 180KB each) |
|---|---|
| Slot | Three images in a three-column grid; each column: image fills top half, pillar name and paragraph below. CSS grid, equal column widths, generous gutters. |
| Direction | **Conservation:** a wildlife biologist or ranger working at distance with an oryx or gazelle in the reserve. Documentary, not posed. Animal in its environment; human in service of work. **Culture:** a Bedouin elder telling a story by firelight, or a falconer's hands with a bird at rest. Domestic register — practice, not performance. No staged "spectacle." **Education:** a guide pointing into the landscape with guests learning around, or night-sky frame with instructor silhouette identifying constellations. Atmospheric, not didactic. All three at roughly equivalent times of day so grid reads as one feature spread. |
| Aspect | Portrait 5:6 (1000×1200 each). Mobile crop: stack the three columns vertically, preserving image-headline-paragraph order. |
| Status | **Pending — placeholder gradient active** |
| Replacement | Commission three documentary-style images as described, or curate from Hero's expeditions archive. The "practice, not performance" register is critical — no actors, no staged moments. |

### Slide 9 — What makes this unmatched (Restrained · no image)

No image. Two-column typographic treatment separated by a fine vertical warm-rust rule. Pull line and closing line in centred serif italic and sans respectively. Typographic slide.

### Slide 10 — Commercial value (Restrained · no image)

No image. Four-line list with generous vertical spacing. Typographic slide on bone background.

### Slide 11 — Implementation (Restrained · three-phase timeline with optional horizon band)

| File | `images/11-horizon.jpg` (2400×600, placeholder 200KB) |
|---|---|
| Slot | A single landscape photograph as a horizon band beneath the three-phase timeline. No more than a fifth of the slide's height. Optional; current CSS implements placeholder gradient. |
| Direction | A long horizon, low light, no figures. Atmospheric ground, not subject. |
| Aspect | Landscape ultra-wide (2400×600). |
| Status | **Pending — placeholder gradient active** |
| Replacement | A quiet landscape horizon from Hero's archive or licensed editorial. |

### Slide 12 — The big idea (Immersive · full-bleed, pull quote overlay)

| File | `images/12-big-idea.jpg` (2400×1600, placeholder 350KB) |
|---|---|
| Slot | `.full-bleed` on `#sec-big-idea` |
| Direction | Full-bleed photograph, very dark — a desert at blue hour, almost monochrome. Landscape recedes into shadow; only differentiation between dim sky and darker land. No figures. No vehicles. No light source. Cinematic, almost black-and-white. The pull quote sits in bone over the lower-mid section where image is darkest. |
| Aspect | Landscape 3:2; mobile crop preserves the dark moody quality across portrait orientation. |
| Status | **Pending — placeholder gradient active** |
| Replacement | Commissioned blue-hour desert landscape from Hero's archive or licensed editorial. Very dark key; the pull quote must read in bone over it with strong contrast. |

### Slide 12.5 — The ask (Restrained · no image)

No image. Bone background. Single declarative statement in serif display at full visual weight, centred with generous margins. Closing line in sans smaller weight, separated by a warm-rust hairline rule. The slide's clearest, most direct moment.

### Slide 13 — Closing (Immersive · full-bleed, visual mirror of cover)

| File | `images/13-closing.jpg` (2400×1600, placeholder 450KB) |
|---|---|
| Slot | `.full-bleed` on `#sec-closing` |
| Direction | Full-bleed photograph that mirrors the cover image but at last light — the same dune ridge composition (or near-equivalent) with sun setting where it was rising on the cover. Warm low-angle final light, cooler shadows in foreground, sky deepening to indigo at upper edge. No figures, no vehicles. WebP + JPG fallback. Mobile crop preserves the dune ridge low in frame on portrait orientation, matching cover's mobile crop. |
| Aspect | Landscape 3:2; mobile crop preservation matches slide 1. |
| Status | **Pending — placeholder gradient active. CRITICAL: Slide 1 (cover) and Slide 13 (closing) must be selected as a visual pair, not independently. The dawn/dusk mirror is the deck's structural closing device.** |
| Replacement | Commission or source two images as a pair: same dune ridge composition, different times of day. This is not optional — the visual loop is the editorial strategy. |

## Sourcing direction (when real imagery is commissioned)

- **Preferred:** Hero's own location archive, if available. Direction: documentary, golden hour, no fleet.
- **Acceptable:** licensed editorial photography (Magnum, VII, Panos, Redux) matching the documentary register.
- **Forbidden:** stock photography that reads as advertising, drone-shot dune sequences with Land Rovers, anything with henna or hookah or buffet props, AI-generated imagery in the deck Nat Geo receives.
- **Permission:** rights cleared for partnership-pitch use (private hosted URL behind Cloudflare Access; not public marketing).

Each replacement updates this file's "Status" row to `verified` with the source attribution and licence note.

## Unsplash credits (current placeholders only)

Photos licensed under the [Unsplash License](https://unsplash.com/license). Attribution not required but provided here for traceability:

- Rico Meier · `xUl3zwhNPXs` (cover)
- Noemi Talina · `0p2g37qjp3s` (paradox sparse variant)
- Chanbora Chhun · `CIfDh_uPgLs` (vision)
- Ashim D'Silva · `bmveAmxzfNY` (why Arabia)
- Jared Evans · `Wwg1TzCuV9E` (Hero detail)
