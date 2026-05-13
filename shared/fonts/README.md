# shared/fonts

Self-hosted webfonts for the partner-decks design system.

Per CLAUDE.md / PRD: Google Fonts CDN is forbidden (privacy and performance). All fonts ship from this directory.

## What's here

- **Playfair Display** — display serif (web fallback for the commercial display serif). Weights: 400, 500, 600, 700 + italic 400/700.
- **Inter** — body sans (web fallback for the commercial body sans). Weights: 400, 500, 600, 700 + italic 400/700.

Both are SIL Open Font License — self-hosting is licence-compliant.

## Source

Downloaded 2026-05-12 from Fontsource jsDelivr distribution:

- `https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-{weight}-{style}.woff2`
- `https://cdn.jsdelivr.net/fontsource/fonts/playfair-display@latest/latin-{weight}-{style}.woff2`

Latin subset only — sufficient for English, British English spelling, and the deck's content (no Arabic in copy at this stage).

## Swap to commercial fonts

Per the locked B1 decision: font families are CSS variables in `shared/css/tokens.css`. To swap in commercial fonts (GT Super, Söhne, Tiempos, etc.):

1. Drop the new woff2 files into this directory
2. Add matching `@font-face` declarations in `tokens.css`
3. Update the `--font-display` and `--font-body` variables
4. No section-level CSS changes required

Do not delete Playfair Display / Inter when commercial fonts arrive — keep them as the always-available web fallback layer.
