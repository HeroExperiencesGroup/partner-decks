---
slide: 18
title: Implementation
mode: Restrained (tabbed)
status: draft (v5.1) — tabbed structure added 2026-05-17
prd-section: 8.18
---

# Slide 18 — Implementation

## What's in it

- Headline (serif display, left-aligned, generous top margin): *How we build this.*
- **Three editorial tabs** (hairline-underline pattern): *Phase 1 · Co-design · Phase 2 · Pilot · Phase 3 · Expansion.* Default active: *Phase 1.*
- Each tab uses a vertical stack: phase label (serif display), body paragraph (sans, body--wide), deliverables list (list--ruled, fine warm-rust hairlines between items).
- Below all tab panels, the horizon band image stays as a visual constant (unchanged from v5) — reads consistently across all three tabs, anchoring the phases to place.

### Tab A — Phase 1 · Co-design (default active)

- Label: *Co-design with Nat Geo experts*
- Body: Experience framework developed with Nat Geo experts across both tiers. Scientific and cultural validation. Editorial discipline applied to every guest-facing element — guide briefings, narrative arcs, content delivery, photography standards.
- Deliverables:
  - Cross-tier expedition framework developed jointly
  - Scientific and cultural advisory panel convened
  - Editorial standards document for guides, photography, and content
  - Pilot scope and success criteria agreed

### Tab B — Phase 2 · Pilot (Dubai)

- Label: *Pilot launch (Dubai), at both access levels*
- Body: Limited-capacity, invitation-only flagship launch at both Heritage and Platinum access levels. Validate experience design, measure guest response, refine before scaling.
- Deliverables:
  - Heritage-tier pilot programme — communal, documentary, cultural
  - Platinum-tier pilot programme — private, 1:2-staffed, Michelin-curated
  - Documentation pipeline live (photo, film, editorial)
  - Post-pilot evaluation against editorial and commercial criteria

### Tab C — Phase 3 · Expansion

- Label: *Replicable expedition model*
- Body: Apply the validated framework to other arid ecosystems. UAE → Saudi Arabia → arid landscapes worldwide. Each expansion follows the same editorial discipline, the same conservation operating practice.
- Deliverables:
  - Adaptation framework for new geographies
  - Saudi Arabia expansion plan (AlUla, Sharaan Nature Reserve)
  - Long-form content syndication across Nat Geo channels
  - Licensing / royalty model compounding across tiers and markets

## Image

A single landscape photograph as a horizon band beneath the tab panels (`.timeline__horizon`). Wide aspect (≈16:3 or wider), short height. No figures, no vehicles per §6.5 (forward-partnership slide). A horizon that suggests scale — dunes against soft sky. Documentary register. Currently wired to `assets/images/11-horizon.jpg` (Hero archive — Platinum Heritage 52, locked at object-position center 17%).

## Feel

The deck's roadmap clarity. v5 showed all three phases on a single timeline; v5.1 lets each phase deepen into specifics (body + deliverables list) without cluttering the overview. Reader can scan tab labels at a glance to see the path (Co-design → Pilot → Expansion) and then drop into any phase for detail. The horizon band tying all three together preserves the visual ground — the phases sit on top of the landscape they describe. Reader sees a path, not a pitch.

## Notes

- **v5.1 change:** v5 used `.timeline` three-column overview; v5.1 uses tabs that deepen each phase. The `.timeline__horizon` band stays as a visual constant below the tab panels.
- Forward-partnership slide — vehicle-agnostic per §6.5. No vehicles in horizon band image, no vehicle references in any tab copy.
- No dates on the timeline. The roadmap is a structural commitment, not a schedule — dates would be set in Phase 1 Co-design itself.
- In PDF print mode, tabs expand — each phase becomes its own sequential page so the leave-behind shows all three phases at full detail.
- "Saudi Arabia expansion plan (AlUla, Sharaan Nature Reserve)" in Phase 3 is the most forward-looking claim in the deck — defensible because source pack #16 already establishes Hero is operating in KSA (AlUla, Sharaan, Khaybar).
