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

Posts to **Netlify Forms** (form name: `estimate`), with photo upload. Netlify
stores every submission and photo on the free tier (100/month). Each submission
records a `lead_source` field showing which page produced the lead.

### Getting notified

Netlify's own **email** notification is a Pro feature. Instead, `tools/notify.gs`
receives Netlify's free **HTTP POST** webhook and emails the lead from Greg's own
Gmail via Google Apps Script — no third party, no API key, no subscription.

Setup instructions are in the header comment of that file. In short: paste it
into a new Apps Script project, set a `SHARED_SECRET` script property, deploy as
a web app, then point Netlify's *HTTP POST request* notification at
`<exec-url>?key=<secret>`.

The secret lives only in Script Properties and the Netlify URL — never in this
repo, which is public. `tools/` sits outside the publish directory, so nothing
in it is served.

The email is built for a phone: subject line carries vehicle, damage type and
ZIP, and the body has tap-to-call / tap-to-text buttons plus photo links.
Replying goes straight to the customer. If the notifier ever throws, it falls
back to mailing the raw payload rather than dropping the lead.

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
