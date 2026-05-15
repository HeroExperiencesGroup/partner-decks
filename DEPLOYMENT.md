# Deployment handoff — partner-decks

This document describes how to deploy the Hero × National Geographic partnership pitch deck to a private, password-protected URL.

**Project**: `HeroExperiencesGroup/partner-decks` (GitHub, private repo — owned by Jcamp)
**Target URL (production)**: `partners.hero-experiences.com/natgeo-<suffix>/`
**Target URL (review)**: a `*.pages.dev` URL Jcamp can use immediately, no IT involvement
**Hosting**: Cloudflare Pages (free tier, supports private GitHub repos)
**Auth (production)**: Cloudflare Access — email one-time PIN

---

## What you own vs. what you need help with

| You own (no help needed) | You need help from Hero IT/admin for |
|---|---|
| The GitHub repo and org (`HeroExperiencesGroup`) | DNS records on `hero-experiences.com` |
| Any Cloudflare account you create yourself | Cloudflare Access policies on the subdomain |
| The deck content, build, and code | (eventually) Adding you as team member on Hero's Cloudflare account |
| Plausible Analytics account | |

**Therefore**: you can deploy and share a working review URL **today**, without waiting for anyone. The custom domain (`partners.hero-experiences.com`) and per-recipient email auth come later, when production-ready.

---

## Phase A — Solo deploy for review (you can do this now)

**Time**: 5–10 minutes. **Help needed**: none.

Result: a working `*.pages.dev` URL that auto-redeploys on every git push.

### Steps

1. **Sign up for a free Cloudflare account** at `dash.cloudflare.com` if you don't already have one. Use your personal or Hero email — doesn't matter, you can transfer the project later.

2. **Create the Pages project**:
   - Dashboard → Workers & Pages → Create application → Pages → Connect to Git
   - Authorise Cloudflare to access your GitHub
   - When GitHub asks for repository access, choose **"Only select repositories"** and pick **`partner-decks`** only (not "All repositories")
   - Select the `HeroExperiencesGroup/partner-decks` repo

3. **Build settings**:
   - **Framework preset**: None
   - **Build command**: leave empty (static site, no build step)
   - **Build output directory**: `/`
   - **Root directory**: leave empty
   - **Production branch**: `b1-natgeo-foundation` for now (switch to `main` later)

4. **Click Save and Deploy**. ~30 seconds later you have a URL like `partner-decks-xyz.pages.dev`. That URL works publicly until you add Cloudflare Access in Phase B. Share it with internal reviewers, but **not yet with Nat Geo** — anyone with the link can see it.

5. **Optional now, encouraged**: limit the URL with a quick **password protection** — Pages dashboard → your project → Settings → Access policy. Even basic password auth keeps the URL private during review. You don't need the per-path Cloudflare Access flow until production.

---

## Phase B — Production setup (requires Hero IT/Cloudflare admin help)

When you're ready to send the deck link to Nat Geo, the URL should live on `partners.hero-experiences.com` with proper per-recipient email auth.

### Who you need to identify

| Role | Why | Likely team |
|---|---|---|
| **Domain / DNS admin for `hero-experiences.com`** | Add one CNAME record for the `partners.` subdomain | Whoever manages the company website / domain |
| **Cloudflare admin for the Hero account** | Configure Cloudflare Access policies on the subdomain; add Jcamp as team member with log-viewing role | Same person as DNS admin in most cases — the domain is already on Cloudflare nameservers per the 2026-05-12 confirmation |

In most small orgs these are the same person.

### What to request — email template

> *Copy this section to the Hero Cloudflare/domain admin.*

**Subject**: Request — Cloudflare Access + subdomain DNS for partner-pitch site

Hi [admin],

I've built a private partnership-pitch deck that we want to host under `partners.hero-experiences.com`. It's already deployed on Cloudflare Pages (URL: [your `*.pages.dev` URL]). I need three things from you to make it production-ready:

**1. A DNS record on `hero-experiences.com`**
- Type: CNAME
- Name: `partners`
- Target: the `*.pages.dev` URL above
- Proxy status: Proxied (orange cloud) — required for Cloudflare Access to work

**2. Cloudflare Access policy on `partners.hero-experiences.com`**
- Application: self-hosted, hostname `partners.hero-experiences.com`
- Auth method: One-time PIN sent to email (no password setup needed for recipients)
- Per-path rules:
  - `/natgeo-*` — allowed for a specific list of Nat Geo recipient emails (I'll provide the list) + Hero internal team
  - `/` (root) and anything unmatched — Hero internal only (`*@hero-experiences.com` wildcard)
- Session duration: 24 hours

**3. Add me as a Cloudflare team member**
- Email: jessiecampanero23@gmail.com
- Role: read-only on
  - DNS settings for `partners.hero-experiences.com`
  - Cloudflare Access logs for the same subdomain
- This lets me see who opened the deck and when, without giving broader account access

**What this is NOT**: admin rights to the root domain, mail/email config, production systems, or any other Hero Experiences digital infrastructure. The scope is one subdomain.

Cost: zero. Cloudflare Access free tier covers up to 50 users.

The deck is also designed to swap between hosting accounts — if you'd rather host the Pages project under the Hero Cloudflare account, I can re-deploy there too. Either way works.

Thanks — happy to jump on a call if any of this needs clarifying.

---

## Information to have ready

Before requesting Phase B, gather these values so you don't go back and forth:

| Item | Value |
|---|---|
| GitHub repo URL | `https://github.com/HeroExperiencesGroup/partner-decks` |
| GitHub branch (review) | `b1-natgeo-foundation` |
| GitHub branch (production, later) | `main` |
| Pages review URL | (Cloudflare gives this to you after Phase A — copy into the email) |
| Target subdomain | `partners.hero-experiences.com` (working name; final to confirm) |
| Path suffix for the Nat Geo deck | `/natgeo-<random-suffix>/` — pick 6–8 random characters when ready, e.g. `/natgeo-x9k3m2/` |
| Nat Geo recipient emails | TBD — coordinate with Nat Geo partnership contact when known |
| Hero internal wildcard | `*@hero-experiences.com` |
| Your email for team-member access | jessiecampanero23@gmail.com |
| Analytics (separate, you set up) | Plausible — owned directly by you, ~$9/month, no IT needed |

---

## Optional follow-ups you can do yourself

After Phase B is live, these can be added without admin help:

- **`_headers` file** at the project root — adds security headers (`X-Robots-Tag: noindex`, CSP) on top of the existing `<meta>` tags. Belt-and-braces; not required.
- **`_redirects` file** — for clean URL rewrites if the deck path changes.
- **Plausible Analytics** — a single line in `<head>`, your account, no IT involvement.

---

## Smoke-test before sharing externally

- [ ] `partners.hero-experiences.com/natgeo-<suffix>/` loads the cover slide
- [ ] Cloudflare Access prompts for email PIN before showing content
- [ ] A test-recipient email receives the PIN and can log in
- [ ] A non-allowed email is denied
- [ ] All 21 slides render (keyboard ↓/↑ on desktop)
- [ ] Mobile portrait shows the rotate prompt → fullscreen flow works
- [ ] Review mode (`R` key) toggles annotations correctly
- [ ] DevTools Network tab shows all images loading (no 404s)
- [ ] Lighthouse mobile: 90+ performance, 95+ accessibility (per PRD §11.5)

---

## Rollback plan

If a deploy breaks something:
- Cloudflare Pages keeps every previous deploy. Dashboard → Pages → partner-decks → Deployments → "Rollback to this deployment" on the last good one. Takes ~10 seconds.
- No git revert required for emergencies.

---

## Reference

- PRD §11 — full hosting and deployment spec (canonical source)
- CLAUDE.md "Resolved" section — Cloudflare confirmation from 2026-05-12
- This document — practical handoff; PRD remains the spec
