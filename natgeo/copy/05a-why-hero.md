---
slide: 5a
title: Who Hero is
mode: Restrained
status: draft
drafted-by: Opus (direct — source-pack-bearing slide; one needs-source claim flagged as blocker)
blockers:
  - Ecotourism certifying body unnamed (source pack #8, status needs-source) — must be resolved before shipping
---

# Slide 5a — Who Hero is

## Mode

Restrained. Credibility, not glamour. Image is a single landscape detail; copy carries the operational facts.

## Headline (sentence case, serif display)

We already operate at the standard.

## Body (single paragraph, sans body weight, set left)

Hero Experiences Group operates Dubai's only ecotourism-certified desert safari [needs-source — certifying body name required before ship], inside the UAE's first national park — the Dubai Desert Conservation Reserve. Our camps run on solar power. Our guides speak 9 languages. Our vintage fleet has been carefully restored.

## Image direction

A single landscape detail — sand, light, texture. No vehicles, no people, no buildings.

Tight crop. Could be a wind-sculpted dune ridge in raking light, or the texture of compacted sand at the base of a slip face. Documentary, almost still-life. Atmospheric warmth from light, not from post-processing.

WebP with JPG fallback.

## Layout

Image right half, copy left half, generous margins. Image bleeds to the right and bottom edges; copy column sits with a generous left margin and a clear top margin above the headline.

Page metadata in small caps in the right margin.

## Source-pack citations (PRD 6.4)

| Claim | Source-pack # | Status | Treatment in copy |
|---|---|---|---|
| Dubai's only ecotourism-certified desert safari | 8 | needs-source | Flagged `[needs-source]` inline; blocker to ship |
| UAE's first national park — Dubai Desert Conservation Reserve | 9 | verified | Shipped as-is |
| Solar-powered camps | 11 | verified | Shipped as-is |
| 9-language guide capability | 13 | verified | Shipped as-is |
| Restored vintage fleet | 10 | verified (operational fact, no figures) | Shipped as-is; Land Rover mention per PRD 6.5 |

## Notes

- "Our vintage fleet has been carefully restored." is the single permitted Land Rover reference per PRD 6.5 and the Section 8 5a-note. No figures, no model name, no imagery. The sentence is verbatim from the spec.
- Headline at 6 words; body sentences are short and parallel ("Our camps … Our guides … Our vintage fleet …").
- "9 languages" uses the numeral form per PRD 6.1.
- Em dash in "the UAE's first national park — the Dubai Desert Conservation Reserve" is grammatical apposition (PRD 6.1).
- "Hero Experiences Group" is the legal entity name on first use; subsequent slides may shorten to "Hero."
- Per CLAUDE.md escalation triggers, "Source-pack claim with status `needs-source` referenced" routes to supervisor. Supervisor decision: include the claim in the draft with explicit `[needs-source]` flag and list as a ship blocker. The certifying body name must be supplied by Jcamp before the HTML build replaces the placeholder.
- If the certification cannot be sourced, the alternative wording is "Hero Experiences Group operates inside the UAE's first national park — the Dubai Desert Conservation Reserve." — losing the ecotourism specificity but preserving the verified national-park claim. Decision deferred to Jcamp.

## Alignment checklist (PRD Section 7)

- [x] Reinforces Nat Geo values — conservation (national park), sustainability (solar), guest experience (9-language guides), authenticity (operational character)
- [x] Avoids sounding like a typical Dubai luxury pitch — facts, not adjectives
- [x] Could appear in Nat Geo Traveler magazine without edits — a sidebar paragraph about the operator
- [x] Every factual claim cited in source pack — yes; one claim flagged `needs-source` as ship blocker
- [x] Avoids claiming formal eligibility for any specific Nat Geo programme
- [x] One idea per slide — Hero already operates at the standard the partnership proposes
- [x] Mode matches purpose — Restrained per PRD 3.5
- [x] Land Rover reference conforms to PRD 6.5 — single mention, "Our vintage fleet has been carefully restored", no figures, no imagery
