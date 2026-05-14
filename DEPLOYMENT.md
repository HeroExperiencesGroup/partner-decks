# Deployment handoff — partner-decks

This document describes what's needed to deploy the Hero × National Geographic partnership pitch deck to a private, password-protected URL on Hero's domain. It's structured so each section can be copied and sent to the right person.

**Project**: `HeroExperiencesGroup/partner-decks` (GitHub, private repo)
**Target URL**: `partners.hero-experiences.com/natgeo-<suffix>/` (subdomain pending DNS approval)
**Hosting plan**: Cloudflare Pages (free tier, supports private GitHub repos)
**Auth plan**: Cloudflare Access — email one-time PIN per recipient

---

## 1. Who we need to identify (Jcamp's first task)

Three roles, possibly held by one person or by three different people:

| Role | Why we need them | Likely team |
|---|---|---|
| **Domain admin** | Authority to add a DNS record on `hero-experiences.com` (a single CNAME for the `partners.` subdomain) | IT, web admin, or whoever manages the company website |
| **Cloudflare admin** | Authority to create a Pages project, configure Access policies, and add Jcamp as a team member with log-viewing access | Same person as domain admin in most cases — the domain lives on Cloudflare nameservers |
| **GitHub org owner** | Authority to install the Cloudflare app on `HeroExperiencesGroup` so it can read the private repo | Whoever set up the GitHub organisation |

**What to find out first**:
1. Who manages the `hero-experiences.com` domain?
2. Who has admin access to the Hero Experiences Cloudflare account?
3. Who owns the `HeroExperiencesGroup` GitHub organisation?

In a small org these are often the same person. Confirm before sending the requests below.

---

## 2. What to request from the Cloudflare admin

> *Copy-paste this section as an email.*

**Subject**: Request — Cloudflare Pages + DNS for partner-pitch site

Hi [admin],

We're preparing to host a private partnership-pitch deck under `partners.hero-experiences.com`. The deck is a static HTML site that lives in a private GitHub repo (`HeroExperiencesGroup/partner-decks`). It needs to be password-protected and only accessible to a small list of approved emails.

Three things would help us launch:

**1. A Cloudflare Pages project**
- Connect to the `HeroExperiencesGroup/partner-decks` GitHub repo
- Production branch: `main` (will switch later; currently using `b1-natgeo-foundation` for review)
- Framework preset: None
- Build command: (leave empty — static site, no build step)
- Build output directory: `/` (root)
- This will give us a `*.pages.dev` URL for internal review

**2. DNS record for the subdomain**
- Add a CNAME on `hero-experiences.com`:
  - Name: `partners`
  - Target: the `.pages.dev` URL from step 1 (you'll see it in the Pages dashboard after deploy)
  - Proxy status: Proxied (orange cloud) — required for Access to work
- This makes `partners.hero-experiences.com` resolve to the deck

**3. Cloudflare Access policy on the subdomain**
- Application: self-hosted, `partners.hero-experiences.com`
- Auth method: One-time PIN sent to email (no password setup needed)
- Per-path rules:
  - `/natgeo-*` — allowed for a specific list of Nat Geo recipient emails + Hero internal team
  - `/` (root) and any unmatched paths — Hero internal team only (`*@hero-experiences.com`)
- Session duration: 24 hours (typical for executive review use)

**4. Team-member access for Jcamp**
- Email: jessiecampanero23@gmail.com
- Role: read-only on:
  - DNS settings for `partners.hero-experiences.com`
  - Cloudflare Access logs for the same subdomain
- This lets us see who opened the deck and when, without giving broader account access

**What this is NOT**: admin rights to the root domain, mail/email config, production systems, or any other Hero Experiences digital infrastructure. The scope is one subdomain.

Cost: zero (Cloudflare Pages + Access free tier covers all this — Access free tier allows up to 50 users).

Thanks — happy to jump on a call if any of this needs clarifying.

---

## 3. What to request from the GitHub org owner

> *Copy-paste this section as an email.*

**Subject**: Request — install Cloudflare app on HeroExperiencesGroup org

Hi [owner],

We're setting up hosting for a private partnership-pitch deck (private repo `partner-decks` in our org). The hosting provider is Cloudflare Pages, which needs read access to the repo to fetch and deploy the static site on every push.

Please install the Cloudflare GitHub app on the `HeroExperiencesGroup` organisation, scoped to **just the `partner-decks` repository** (not "All repositories" — the principle-of-least-privilege option).

Steps:
1. Cloudflare admin starts the Pages setup at dash.cloudflare.com and clicks "Connect to Git"
2. GitHub prompts an org owner to approve the install
3. Choose "Only select repositories" and pick `partner-decks` only

This grants Cloudflare permission to read repo contents and fire on push events — nothing else. The repo stays private to everyone outside our org.

Thanks.

---

## 4. Information Jcamp should have ready

Before kicking off the setup, gather these so the admin doesn't have to come back asking:

| Item | Value |
|---|---|
| GitHub repo | `https://github.com/HeroExperiencesGroup/partner-decks` |
| GitHub branch (current review) | `b1-natgeo-foundation` |
| GitHub branch (production, later) | `main` |
| Target subdomain | `partners.hero-experiences.com` (working name — final to confirm) |
| Subdomain suffix for the Nat Geo deck path | `/natgeo-<random-suffix>/` — e.g. `/natgeo-xyz123/` (any short random string; goal is unguessability, not security) |
| Nat Geo recipient emails (to allow) | TBD — coordinate with Nat Geo partnership contact |
| Hero internal team domain | `*@hero-experiences.com` (allow-all wildcard) |
| Jcamp's email for team-member access | jessiecampanero23@gmail.com |
| Analytics tool we're adding next | Plausible — separate from Cloudflare, owned by Jcamp directly, ~$9/month |

---

## 5. Optional but recommended (Jcamp can add later)

Once the deploy is live, these can be added without admin help:

- **`_headers` file** at the project root — adds security headers (`X-Robots-Tag: noindex`, CSP, etc.) on top of the existing `<meta>` tags. Belt-and-braces; not required.
- **`_redirects` file** — for clean URL rewrites if the deck path structure changes.
- **Plausible Analytics script** — single line in `<head>`, owned by Jcamp, no IT involvement.

---

## 6. Smoke-test once deployed

Verify before sharing with Nat Geo:

- [ ] `partners.hero-experiences.com/natgeo-<suffix>/` loads the cover slide
- [ ] Cloudflare Access prompts for email PIN before showing content
- [ ] A test-recipient email receives the PIN and can log in
- [ ] A non-allowed email is denied
- [ ] All 18 slides render (keyboard ↓/↑ navigation works on desktop)
- [ ] Mobile portrait shows the rotate prompt → fullscreen flow works
- [ ] Review mode (`R` key) toggles annotations correctly
- [ ] DevTools Network tab shows all images loading (no 404s)
- [ ] Lighthouse mobile score: 90+ performance, 95+ accessibility (per PRD 11.5)

---

## 7. Rollback plan

If something breaks after a deploy:
- Cloudflare Pages keeps every deploy. In the dashboard → Pages → partner-decks → Deployments, click "Rollback to this deployment" on the last good one. Takes ~10 seconds.
- No git revert required for emergencies.

---

## Reference

- PRD §11 — full hosting and deployment spec (canonical source)
- CLAUDE.md "Resolved" section — Cloudflare confirmation from 2026-05-12
- This document — practical handoff only; PRD remains the spec
