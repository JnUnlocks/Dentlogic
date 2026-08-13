# Dent Logic Inc — website

Paintless dent repair, Southeast PA. Static site, no framework.

**Live:** https://dentlogic.netlify.app
**Netlify publish directory:** `dent-logic-site/` — that folder *is* the site root.

## Editing

Pages are generated so the header, footer, estimate form, and schema stay
identical across all 10 pages. **Do not hand-edit the HTML in
`dent-logic-site/`** — it gets overwritten on the next build. Edit
`build-pages.js` and re-run.

```bash
node build-pages.js    # writes every page + sitemap.xml, robots.txt, _headers, _redirects
node check.js          # validates links, JSON-LD, headings, meta lengths
```

Neither needs any dependencies. Push to `main` and Netlify deploys.

To add a service area, add one entry to the `cities` array in `build-pages.js`
and re-run — it gets a full page, sitemap entry, and footer/related links.

Photo pipeline (only when photos change — needs `npm install`):

```bash
node build-images.js   # crops pairs to matching 4:3, emits WebP + JPEG at 2 widths
```

Originals stay in `dent-logic-site/assets/*.jpg`; generated files are the
`-800`/`-1400` variants.

## Estimate form

Posts to **Netlify Forms** (form name: `estimate`), with photo upload. It is
wired up in the HTML but stores submissions silently until notifications are on:

**Netlify → Forms → Settings → Form notifications → Add notification → Email
notification** → `DentLogicInc@gmail.com`

Free tier covers 100 submissions/month including file uploads. Each submission
records a `lead_source` field showing which page produced the lead.

## Known follow-ups

- **Pricing figures are industry-typical placeholders**, not Greg's real numbers.
  Highest-converting block on the page — replace in `build-pages.js`.
- **Testimonials carried over from the original site** and read as placeholders.
  Replace with real ones. Deliberately no `Review`/`AggregateRating` schema:
  self-serving review markup is ineligible for rich results and risks a penalty.
- **Custom domain.** `dentlogic.netlify.app` will not outrank local shops.
  Once bought, change `SITE` at the top of `build-pages.js` and re-run.
- **Google Business Profile** matters more than the site for local trade work.
  Set it up as a *service-area business* — that is why the site shows
  "Pottstown, PA" rather than the street address.
- **`/index.html`, `/styles.css`, `/logo.png`, `/assets/` at the repo root** are
  a stale duplicate of the pre-rebuild site. Nothing serves them. Safe to delete.

---

Site built by [JB Unlocks](https://jbunlocks.netlify.app/)
