/* Builds every HTML page for dentlogic from shared partials + per-city content.
   Run: node build-pages.js
   Output goes to ./site — commit that folder and Netlify serves it as-is. */

const fs = require("fs");
const path = require("path");

/* ------------------------------------------------------------------ config */

const SITE = "https://dentlogic.netlify.app"; // <- swap for the custom domain
const BIZ = "Dent Logic Inc";
const PHONE_HUMAN = "(610) 316-7761";
const PHONE_LINK = "+16103167761";
const EMAIL = "DentLogicInc@gmail.com";
const CITY = "Pottstown";
const REGION = "PA";
const ZIP = "19464";
const FACEBOOK = "https://www.facebook.com/DentLogicInc";
const DEV_NAME = "JB Unlocks";
const DEV_URL = "https://jbunlocks.netlify.app/";
const OUT = path.join(__dirname, "dent-logic-site");

/* ------------------------------------------------------------------ cities */

const cities = [
  {
    slug: "pottstown-pa",
    name: "Pottstown",
    county: "Montgomery County",
    drive: "home base",
    blurb:
      "Dent Logic is based in Pottstown, so this is the fastest turnaround area we cover. Most Pottstown dents get looked at the same week, and small door dings can often be handled the day you call.",
    local:
      "Between the Coventry Mall lots, the Route 100 and Route 422 commuter run, and street parking through the borough, Pottstown vehicles pick up their share of door dings and shopping-cart dents. Most of them are textbook paintless dent repair: the paint is fine, the metal just needs to go back where it started.",
    landmarks: ["Coventry Mall", "Route 100", "Route 422", "Downtown Pottstown"],
  },
  {
    slug: "king-of-prussia-pa",
    name: "King of Prussia",
    county: "Montgomery County",
    drive: "about 25 minutes from our Pottstown base",
    blurb:
      "King of Prussia is door-ding country. If your car spends time in the mall lots or a corporate garage off 202, odds are good it has picked up a dent that paintless dent repair can take out cleanly.",
    local:
      "The King of Prussia Mall is one of the largest shopping centers in the country, which means acres of tight parking and a steady supply of door dings and cart dents. Add the office parks along 202 and the 76/276 interchange traffic, and it is easily our busiest area for single-panel repairs.",
    landmarks: ["King of Prussia Mall", "Route 202", "I-76 / I-276", "Valley Forge"],
  },
  {
    slug: "west-chester-pa",
    name: "West Chester",
    county: "Chester County",
    drive: "about 35 minutes from our Pottstown base",
    blurb:
      "We cover West Chester borough and the surrounding Chester County townships for paintless dent repair, from parking-garage door dings to hail damage on a full vehicle.",
    local:
      "Borough parking in West Chester is tight, the garages are tighter, and Route 3 and Route 202 keep things busy. Between student vehicles around the university and daily commuters, most of what we see here is door dings, bodyline creases, and the occasional hood dent from debris.",
    landmarks: ["Downtown West Chester", "Route 202", "West Chester Pike (Route 3)", "Chester County"],
  },
  {
    slug: "malvern-pa",
    name: "Malvern",
    county: "Chester County",
    drive: "about 30 minutes from our Pottstown base",
    blurb:
      "Malvern and the Great Valley corridor are a regular stop. Mobile appointments work particularly well here — a lot of these repairs happen in an office lot while the owner is at their desk.",
    local:
      "The Great Valley corporate campuses mean a lot of vehicles sitting in shared lots all day, and shared lots mean door dings. Malvern owners also tend to care about keeping factory paint intact for resale, which is exactly what paintless dent repair is for.",
    landmarks: ["Great Valley", "Route 30 / Lancaster Avenue", "Route 401", "Paoli"],
  },
  {
    slug: "reading-pa",
    name: "Reading",
    county: "Berks County",
    drive: "about 25 minutes from our Pottstown base",
    blurb:
      "Reading and the wider Berks County area are well inside our regular service range for both single dents and full hail claims.",
    local:
      "Route 422 runs straight from our shop into Reading, so this is a short trip for us. Berks County catches its share of spring and summer hail, and we handle those claims start to finish — including the paperwork your adjuster needs.",
    landmarks: ["Route 422", "Route 222", "Broadcasting Square", "Berks County"],
  },
  {
    slug: "allentown-pa",
    name: "Allentown",
    county: "Lehigh County",
    drive: "about 45 minutes from our Pottstown base",
    blurb:
      "We take Allentown and Lehigh Valley work, with a particular focus on hail damage and multi-panel repairs where the trip is worth it for both of us.",
    local:
      "The Lehigh Valley sits in an active stretch for summer storms, and a single hail event can put hundreds of small dents across a hood, roof, and trunk. That is exactly the kind of job paintless dent repair is built for — no fillers, no repaint, and your factory finish stays on the car.",
    landmarks: ["Route 22", "I-78", "Lehigh Valley Mall", "Lehigh County"],
  },
  {
    slug: "quakertown-pa",
    name: "Quakertown",
    county: "Bucks County",
    drive: "about 35 minutes from our Pottstown base",
    blurb:
      "Quakertown and upper Bucks County are part of our regular route. Send photos and we will tell you straight away whether it is a paintless repair or something that needs a body shop.",
    local:
      "Route 309 and the Turnpike's Northeast Extension carry a lot of Quakertown commuters, and highway miles bring road-debris dents and parking-lot damage in roughly equal measure. Family vehicles here tend to be keepers, so protecting the original paint matters.",
    landmarks: ["Route 309", "PA Turnpike NE Extension", "Q-Mart", "Upper Bucks County"],
  },
];

/* ------------------------------------------------------------------ shared */

const svg = {
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 1.9.6 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.5 2.8.6a2 2 0 0 1 1.7 2Z"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.4 8.4 0 0 1 8.4-9 8.4 8.4 0 0 1 8.6 8.5Z"/></svg>',
  camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2Z"/><circle cx="12" cy="13" r="4"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>',
  cloud: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 16.6A5 5 0 0 0 18 7h-1.3A8 8 0 1 0 3 14.9"/><path d="m16 14-2 6M12 15l-1 4M8 14l-2 6"/></svg>',
  van: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 17V7a1 1 0 0 1 1-1h11v11M13 9h4.6a2 2 0 0 1 1.7 1l2.4 4v3h-3"/><circle cx="6" cy="17.5" r="2.5"/><circle cx="17" cy="17.5" r="2.5"/><path d="M8.5 17h6"/></svg>',
};

const head = ({ title, desc, url, extraLd = "", preloadHero = false }) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta name="theme-color" content="#0d1218">
<meta name="format-detection" content="telephone=yes">

<meta property="og:type" content="website">
<meta property="og:site_name" content="${BIZ}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/assets/hero-1800.jpg">
<meta property="og:image:width" content="1800">
<meta property="og:image:height" content="1013">
<meta property="og:image:alt" content="Vehicle quarter panel after paintless dent repair, factory paint intact">
<meta property="og:locale" content="en_US">
<meta name="twitter:card" content="summary_large_image">

<link rel="icon" href="/favicon-32.png" sizes="32x32">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="stylesheet" href="/styles.css">
${preloadHero ? '<link rel="preload" as="image" href="/assets/hero-1000.webp" imagesrcset="/assets/hero-1000.webp 1000w, /assets/hero-1800.webp 1800w" imagesizes="100vw" fetchpriority="high">\n' : ""}<script defer src="/app.js"></script>
${extraLd}
</head>
<body>
<a class="skip-link" href="#main">Skip to main content</a>`;

const header = (current = "") => `
<header class="header">
  <div class="wrap header__inner">
    <a class="brand" href="/">
      <img src="/logo-80.png" alt="" width="40" height="40">
      <span><b>${BIZ}</b><span>Paintless Dent Repair &middot; SE&nbsp;PA</span></span>
    </a>
    <nav class="nav" aria-label="Primary">
      <a href="/#services"${current === "services" ? ' aria-current="page"' : ""}>Services</a>
      <a href="/#results">Results</a>
      <a href="/#pricing">Pricing</a>
      <a href="/#areas"${current === "areas" ? ' aria-current="page"' : ""}>Areas</a>
      <a href="/#faq">FAQ</a>
    </nav>
    <div class="header__cta">
      <a class="btn btn--outline btn--sm" href="tel:${PHONE_LINK}">${PHONE_HUMAN}</a>
      <a class="btn btn--primary btn--sm" href="/#estimate">Free estimate</a>
    </div>
    <button class="menu-btn" type="button" aria-expanded="false" aria-controls="drawer">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
      Menu
    </button>
  </div>
  <div class="drawer" id="drawer">
    <nav class="wrap" aria-label="Mobile">
      <ul>
        <li><a href="/#services">Services</a></li>
        <li><a href="/#results">Before &amp; after</a></li>
        <li><a href="/#pricing">What it costs</a></li>
        <li><a href="/#process">How it works</a></li>
        <li><a href="/#areas">Areas we serve</a></li>
        <li><a href="/#faq">FAQ</a></li>
        <li><a href="/#estimate">Get a free estimate</a></li>
      </ul>
    </nav>
  </div>
</header>`;

const actionbar = () => `
<div class="actionbar">
  <a class="ab-call" href="tel:${PHONE_LINK}">${svg.phone}Call</a>
  <a class="ab-text" href="sms:${PHONE_LINK}" data-sms-prefill>${svg.chat}Text photos</a>
  <a class="ab-quote" href="/#estimate">${svg.camera}Estimate</a>
</div>`;

/* The estimate form. Netlify picks this up at deploy time from the static HTML —
   data-netlify plus a hidden form-name field, no build plugin needed. */
const estimateForm = (sourceLabel) => `
<section id="estimate" class="section--alt">
  <div class="wrap">
    <div class="section__head">
      <h2>Get a free estimate</h2>
      <p>Send a few photos and you will get a real number back, usually the same day. No obligation, no pushy follow-up.</p>
    </div>

    <div class="form-shell">
      <form id="estimate-form" name="estimate" method="POST" action="/thanks/"
            data-netlify="true" netlify-honeypot="bot-field" enctype="multipart/form-data">
        <input type="hidden" name="form-name" value="estimate">
        <input type="hidden" name="lead_source" id="lead-source" value="${sourceLabel}">
        <p class="hp"><label>Leave this empty: <input name="bot-field"></label></p>

        <div class="form-grid">
          <div class="field">
            <label for="name">Your name</label>
            <input id="name" name="name" type="text" autocomplete="name" required>
          </div>
          <div class="field">
            <label for="phone">Phone</label>
            <input id="phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" placeholder="(610) 555-0100">
          </div>
          <div class="field">
            <label for="email">Email</label>
            <input id="email" name="email" type="email" autocomplete="email" placeholder="you@example.com">
          </div>
          <div class="field">
            <label for="zip">ZIP code</label>
            <input id="zip" name="zip" type="text" inputmode="numeric" autocomplete="postal-code" pattern="[0-9]{5}" maxlength="5" placeholder="19464" required>
          </div>

          <div class="field field--full">
            <label for="vehicle">Vehicle (year, make, model)</label>
            <input id="vehicle" name="vehicle" type="text" placeholder="2021 Ram 1500" required>
          </div>

          <div class="field field--full">
            <span class="label" id="dmg-label" style="font-weight:700;font-size:.94rem">What happened?</span>
            <div class="chips" role="group" aria-labelledby="dmg-label">
              <input type="radio" id="d1" name="damage" value="Door ding / small dent" checked><label for="d1">Door ding</label>
              <input type="radio" id="d2" name="damage" value="Crease or bodyline dent"><label for="d2">Crease</label>
              <input type="radio" id="d3" name="damage" value="Hail damage"><label for="d3">Hail</label>
              <input type="radio" id="d4" name="damage" value="Larger dent / not sure"><label for="d4">Bigger / not sure</label>
            </div>
          </div>

          <div class="field field--full">
            <label for="photos">Photos of the damage</label>
            <input id="photos" name="photos" type="file" accept="image/*" multiple capture="environment">
            <p class="hint">2&ndash;3 angles is plenty. Shoot in bright, indirect light so the reflection bends across the dent &mdash; that is what shows us the real shape.</p>
          </div>

          <div class="field field--full">
            <label for="details">Anything else</label>
            <textarea id="details" name="details" rows="3" placeholder="Where the dent is, when it happened, whether you are going through insurance."></textarea>
          </div>

          <div class="field field--full">
            <span class="label" id="pref-label" style="font-weight:700;font-size:.94rem">Best way to reach you</span>
            <div class="chips" role="group" aria-labelledby="pref-label">
              <input type="radio" id="p1" name="preferred" value="Text" checked><label for="p1">Text</label>
              <input type="radio" id="p2" name="preferred" value="Call"><label for="p2">Call</label>
              <input type="radio" id="p3" name="preferred" value="Email"><label for="p3">Email</label>
            </div>
          </div>
        </div>

        <button class="btn btn--primary btn--block" type="submit">Send my estimate request</button>
        <p class="hint" id="form-status" style="margin-top:.75rem;text-align:center" role="status" aria-live="polite">Goes straight to Greg. Your details are not shared with anyone.</p>
      </form>

      <div class="form-alt">
        <p>Would rather not fill out a form?</p>
        <a class="btn btn--outline" href="tel:${PHONE_LINK}">${svg.phone} Call ${PHONE_HUMAN}</a>
        <a class="btn btn--outline" href="sms:${PHONE_LINK}" data-sms-prefill>${svg.chat} Text your photos</a>
        <a class="btn btn--outline" href="mailto:${EMAIL}?subject=PDR%20estimate%20request">Email ${EMAIL}</a>
      </div>
    </div>
  </div>
</section>`;

const footer = () => `
<footer class="footer">
  <div class="wrap">
    <div class="footer__grid">
      <div>
        <h4>${BIZ}</h4>
        <p style="margin-bottom:.5rem">Paintless dent repair across Southeast Pennsylvania. Shop and mobile service.</p>
        <p style="margin:0"><a href="tel:${PHONE_LINK}">${PHONE_HUMAN}</a><br>
        <a href="mailto:${EMAIL}">${EMAIL}</a><br>
        ${CITY}, ${REGION} ${ZIP}</p>
      </div>
      <div>
        <h4>Service areas</h4>
        <ul>${cities.map((c) => `<li><a href="/pdr/${c.slug}/">${c.name}, PA</a></li>`).join("")}</ul>
      </div>
      <div>
        <h4>More</h4>
        <ul>
          <li><a href="/#services">Services</a></li>
          <li><a href="/#pricing">What repairs cost</a></li>
          <li><a href="/#results">Before &amp; after</a></li>
          <li><a href="/#faq">FAQ</a></li>
          <li><a href="${FACEBOOK}" rel="noopener">Facebook</a></li>
        </ul>
      </div>
    </div>
    <div class="footer__base">
      <p style="margin:0">&copy; <span id="year">2026</span> ${BIZ}. Hours: Mon&ndash;Fri 8:00&nbsp;AM&ndash;5:00&nbsp;PM.</p>
      <p style="margin:0">Serving Montgomery, Chester, Berks, Bucks &amp; Lehigh counties.</p>
    </div>
    <p class="credit">Site built by <a href="${DEV_URL}" rel="noopener">${DEV_NAME}</a></p>
  </div>
</footer>
${actionbar()}
</body>
</html>`;

/* Reusable before/after figure */
const ba = (n, title, sub, altB, altA) => `
<figure class="ba">
  <div class="ba__stage" style="--pos:50%">
    <img src="/assets/before-${n}-800.jpg" srcset="/assets/before-${n}-800.webp 800w, /assets/before-${n}-1400.webp 1400w" sizes="(min-width:860px) 33vw, 100vw" alt="${altB}" width="800" height="600" loading="lazy" decoding="async">
    <img class="ba__after" src="/assets/after-${n}-800.jpg" srcset="/assets/after-${n}-800.webp 800w, /assets/after-${n}-1400.webp 1400w" sizes="(min-width:860px) 33vw, 100vw" alt="${altA}" width="800" height="600" loading="lazy" decoding="async">
    <span class="ba__tag ba__tag--b">BEFORE</span>
    <span class="ba__tag ba__tag--a">AFTER</span>
    <input class="ba__range" type="range" min="0" max="100" value="50" aria-label="${title}: drag to compare before and after">
    <span class="ba__handle" aria-hidden="true"></span>
  </div>
  <figcaption><b>${title}</b><span>${sub}</span></figcaption>
</figure>`;

const RESULTS = [
  ba(3, "Quarter panel, F-250", "Sharp dent above the rear arch. Metal worked back to the original line, factory clear coat untouched.", "Deep dent in a dark truck quarter panel, reflection bent across the damage", "The same quarter panel after paintless dent repair, reflections running straight"),
  ba(2, "Tailgate, Ram 1500", "Dent and crease below the badge on a metallic red tailgate. No filler, no blending, no repaint.", "Dent and crease in a red Ram tailgate below the badge", "The same red tailgate after repair, panel flat and even"),
  ba(1, "Rear panel, sedan", "Body-line damage next to the tail light corrected without touching the paint.", "Dented rear panel of a silver sedan beside the tail light", "The same silver rear panel after paintless dent repair"),
];

const FAQS = [
  ["Does paintless dent repair hurt my paint?", "No. That is the whole point of it. We work the metal from behind the panel and massage it back to shape, so your factory paint and clear coat stay exactly as they came from the plant. Nothing is sanded, filled, or resprayed."],
  ["Will this show up on my Carfax?", "Paintless dent repair is not collision work, so there is no insurance claim or body-shop record generated by us. If you pay directly for a door ding, there is nothing to report. Hail claims run through your insurer, so those follow your policy's normal reporting."],
  ["How much does it cost?", "Most single door dings land between $125 and $250. Creases and bodyline damage run higher, and hail is usually an insurance job. Send photos and you get a real number rather than a guess &mdash; see the pricing section for full ranges."],
  ["How long does it take?", "A single door ding is typically 30 to 90 minutes. Multiple panels take a few hours. A full hail repair can take a day or more depending on how many dents are on the vehicle."],
  ["Can every dent be fixed this way?", "Most can, but not all. If the paint is cracked or chipped, or the metal is stretched or creased over a hard edge, paintless repair is not the right tool. We will tell you straight if that is the case and point you to a body shop instead of wasting your time."],
  ["Do you handle insurance hail claims?", "Yes. We work with insurers regularly and can supply the documentation and photos your adjuster needs. If you have already got an estimate from the insurance company, send it over with your photos."],
  ["Do you come to me?", "Often, yes. Mobile appointments work well for single dents when the weather cooperates and there is decent light. Larger jobs and hail work are better done at the shop where the lighting is controlled."],
  ["What photos should I send?", "Two or three angles, taken in bright but indirect light. The trick is to catch a straight reflection &mdash; a garage door, a fluorescent tube, a roofline &mdash; running across the dent. The way that line bends tells us the depth and shape far better than a straight-on photo does."],
];

const faqBlock = (items) => `
<div class="faq">
${items.map(([q, a]) => `  <details><summary>${q}</summary><p>${a}</p></details>`).join("\n")}
</div>`;

const faqLd = (items) => `<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map(([q, a]) => ({
    "@type": "Question",
    name: q.replace(/&[a-z]+;/g, "-"),
    acceptedAnswer: { "@type": "Answer", text: a.replace(/&mdash;/g, "-").replace(/&[a-z]+;/g, " ") },
  })),
})}</script>`;

/* Service-area business: no street address published, matching how a mobile
   PDR operator should be configured on Google Business Profile. */
const bizLd = (extraAreas = []) => `<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org",
  "@type": "AutoBodyShop",
  "@id": SITE + "/#business",
  name: BIZ,
  url: SITE + "/",
  telephone: "+1-610-316-7761",
  email: EMAIL,
  image: SITE + "/assets/hero-1800.jpg",
  logo: SITE + "/logo.png",
  priceRange: "$$",
  description:
    "Paintless dent repair (PDR) for door dings, creases, and hail damage across Southeast Pennsylvania. Factory paint preserved - no filler, no repainting.",
  address: { "@type": "PostalAddress", addressLocality: CITY, addressRegion: REGION, postalCode: ZIP, addressCountry: "US" },
  areaServed: [...cities.map((c) => ({ "@type": "City", name: c.name + ", PA" })), ...extraAreas],
  serviceArea: {
    "@type": "GeoCircle",
    geoMidpoint: { "@type": "GeoCoordinates", latitude: 40.2454, longitude: -75.6496 },
    geoRadius: "64000",
  },
  sameAs: [FACEBOOK],
  openingHoursSpecification: [{
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "08:00", closes: "17:00",
  }],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Paintless dent repair services",
    itemListElement: [
      "Paintless dent repair", "Door ding removal", "Bodyline crease repair",
      "Hail damage repair", "Mobile dent repair",
    ].map((s) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: s } })),
  },
})}</script>`;

/* ------------------------------------------------------------------- pages */

function homepage() {
  const url = SITE + "/";
  return `${head({
    title: "Paintless Dent Repair in Southeast PA | Dent Logic Inc",
    desc: "Paintless dent repair for door dings, creases and hail damage across Southeast PA. Your factory paint stays on. Free photo estimate, usually same day.",
    url,
    preloadHero: true,
    extraLd: bizLd() + "\n" + faqLd(FAQS),
  })}
${header()}
<main id="main">

  <section class="hero">
    <picture>
      <source type="image/webp" srcset="/assets/hero-1000.webp 1000w, /assets/hero-1800.webp 1800w" sizes="100vw">
      <img class="hero__bg" src="/assets/hero-1000.jpg" srcset="/assets/hero-1000.jpg 1000w, /assets/hero-1800.jpg 1800w" sizes="100vw" alt="" width="1800" height="1013" fetchpriority="high" decoding="async">
    </picture>
    <div class="wrap hero__inner">
      <div class="hero__grid">
        <div>
          <p class="eyebrow">Serving Southeast PA &middot; Mobile available</p>
          <h1>Dents out. Factory paint stays on.</h1>
          <p class="hero__lede">Paintless dent repair for door dings, creases and hail damage &mdash; no filler, no sanding, no respray. Text a couple of photos and you will have a real price back, usually the same day.</p>
          <div class="hero__cta">
            <a class="btn btn--primary" href="#estimate">Get my free estimate</a>
            <a class="btn btn--ghost" href="tel:${PHONE_LINK}">${svg.phone} ${PHONE_HUMAN}</a>
          </div>
          <p class="hero__note">Pottstown-based &middot; West Chester &middot; King of Prussia &middot; Reading &middot; Allentown &middot; Malvern &middot; Quakertown</p>
        </div>
        <ul class="ticks">
          <li>Your original paint never leaves the car</li>
          <li>Most door dings done in under 90 minutes</li>
          <li>Insurance hail claims handled end to end</li>
          <li>We tell you straight if PDR is the wrong fix</li>
        </ul>
      </div>
    </div>
  </section>

  <div class="trustbar">
    <div class="wrap">
      <ul>
        <li><b>OEM paint</b><span>Never sanded or resprayed</span></li>
        <li><b>Same-day</b><span>Estimate from your photos</span></li>
        <li><b>Mobile</b><span>We can come to you</span></li>
        <li><b>Insurance</b><span>Hail claims welcome</span></li>
      </ul>
    </div>
  </div>

  <section id="services">
    <div class="wrap">
      <div class="section__head">
        <h2>What we fix</h2>
        <p>If the paint is intact and the metal is not stretched, there is a good chance it can come out without a body shop ever touching it.</p>
      </div>
      <div class="grid grid--3">
        <article class="card">
          <div class="icon">${svg.van}</div>
          <h3>Door dings &amp; small dents</h3>
          <p>The parking lot special. Worked out from behind the panel until the reflection runs straight again. Usually the fastest and cheapest repair we do.</p>
        </article>
        <article class="card">
          <div class="icon">${svg.shield}</div>
          <h3>Creases &amp; bodyline dents</h3>
          <p>Damage that runs along a body line takes more time and a lighter hand, but it comes out. These are the repairs that separate a good PDR tech from an average one.</p>
        </article>
        <article class="card">
          <div class="icon">${svg.cloud}</div>
          <h3>Hail damage</h3>
          <p>Hundreds of small dents across a hood, roof and trunk. Paintless repair is the standard fix for hail, and it protects your resale value. Insurance claims handled start to finish.</p>
        </article>
      </div>
    </div>
  </section>

  <section id="results" class="section--alt">
    <div class="wrap">
      <div class="section__head">
        <h2>Real repairs, real vehicles</h2>
        <p>Drag the slider on any of these. Every one is our own work &mdash; same panel, same light, nothing swapped out.</p>
      </div>
      <div class="compare">${RESULTS.join("")}</div>
      <p style="margin-top:1.5rem"><a class="btn btn--outline" href="${FACEBOOK}" rel="noopener">See more work on Facebook</a></p>
    </div>
  </section>

  <section id="pricing">
    <div class="wrap">
      <div class="section__head">
        <h2>What it costs</h2>
        <p>Everybody wants this number first, so here it is up front. These are typical ranges, not a quote &mdash; the real price depends on the size, the depth, and where on the panel it sits.</p>
      </div>
      <div class="price-table">
        <div class="price-row"><b>Small door ding</b><em>$125&ndash;$200</em><span>Dime to quarter sized, open panel, easy access.</span></div>
        <div class="price-row"><b>Medium dent</b><em>$200&ndash;$375</em><span>Palm sized, or somewhere awkward to reach from behind.</span></div>
        <div class="price-row"><b>Crease or bodyline dent</b><em>$350&ndash;$650</em><span>Longer damage running through a body line. Slower, more skilled work.</span></div>
        <div class="price-row"><b>Multiple dents, one panel</b><em>From $300</em><span>Cheaper per dent than doing them one at a time.</span></div>
        <div class="price-row"><b>Hail damage</b><em>Usually insurance</em><span>Priced off the dent count and panel count. We will work directly with your adjuster.</span></div>
      </div>
      <p class="price-note"><strong>Why we cannot price it over the phone.</strong> Two dents that look identical can be an hour apart in labour depending on what is behind the panel &mdash; a brace, a seam, or nothing at all. Send photos and you get a firm number instead of a range.</p>
      <p style="margin-top:1.5rem"><a class="btn btn--primary" href="#estimate">Send photos, get a real price</a></p>
    </div>
  </section>

  <section id="process" class="section--alt">
    <div class="wrap">
      <div class="section__head">
        <h2>How it works</h2>
        <p>Three steps, and the first one takes about a minute.</p>
      </div>
      <div class="steps">
        <div class="step">
          <h3>Send photos</h3>
          <p>Text or upload two or three angles with your year, make, model and ZIP. Bright indirect light, and try to catch a reflection running across the dent.</p>
        </div>
        <div class="step">
          <h3>Get a real price</h3>
          <p>Usually the same day. If paintless repair is the wrong call for your damage, we say so and tell you what to do instead.</p>
        </div>
        <div class="step">
          <h3>Book it in</h3>
          <p>Shop appointment or mobile, whichever suits. Most single dents are done while you wait.</p>
        </div>
      </div>
    </div>
  </section>

  <section id="areas">
    <div class="wrap">
      <div class="section__head">
        <h2>Where we work</h2>
        <p>Based in Pottstown and covering roughly a 40-mile radius across Montgomery, Chester, Berks, Bucks and Lehigh counties. Not on the list? Call and ask &mdash; if we can get there, we will.</p>
      </div>
      <div class="area-links">
        ${cities.map((c) => `<a class="area-link" href="/pdr/${c.slug}/"><span>${c.name}, PA<small>${c.county}</small></span></a>`).join("\n        ")}
      </div>
    </div>
  </section>

  <section id="reviews" class="section--alt">
    <div class="wrap">
      <div class="section__head">
        <h2>What drivers say</h2>
      </div>
      <div class="grid grid--3">
        <figure class="quote">
          <div class="stars" aria-label="5 out of 5">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
          <blockquote>Greg fixed a nasty door ding on my truck. No paint, no trace, looks factory again. Super fast turnaround.</blockquote>
          <figcaption>Mike R.<span>Door ding, pickup</span></figcaption>
        </figure>
        <figure class="quote">
          <div class="stars" aria-label="5 out of 5">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
          <blockquote>Insurance hail claim done right. Hundreds of tiny dents gone. Saved my OEM paint and the car's value.</blockquote>
          <figcaption>Danielle K.<span>Hail claim</span></figcaption>
        </figure>
        <figure class="quote">
          <div class="stars" aria-label="5 out of 5">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
          <blockquote>Mobile service came to my office and fixed a crease in under an hour. Couldn't be easier.</blockquote>
          <figcaption>Sam P.<span>Mobile crease repair</span></figcaption>
        </figure>
      </div>
      <p style="margin-top:1.5rem"><a class="btn btn--outline" href="${FACEBOOK}" rel="noopener">Read recommendations on Facebook</a></p>
    </div>
  </section>

  <section id="faq">
    <div class="wrap">
      <div class="section__head"><h2>Questions people actually ask</h2></div>
      ${faqBlock(FAQS)}
    </div>
  </section>

${estimateForm("Homepage")}

</main>
${footer()}`;
}

function cityPage(c) {
  const url = `${SITE}/pdr/${c.slug}/`;
  const others = cities.filter((x) => x.slug !== c.slug);
  const localFaqs = [
    [`Do you actually come out to ${c.name}?`, `Yes. ${c.name} is ${c.drive === "home base" ? "our home base" : `${c.drive}`}, and it is part of our regular service area. Mobile appointments are available for single dents when the weather and light cooperate; bigger jobs are better at the shop.`],
    [`How fast can you look at my ${c.name} dent?`, "Send photos and you will normally have a price back the same day. Scheduling the repair itself usually happens within the same week, sooner for small dings."],
    ...FAQS.slice(0, 5),
  ];

  const breadcrumbLd = `<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE + "/" },
      { "@type": "ListItem", position: 2, name: "Service areas", item: SITE + "/#areas" },
      { "@type": "ListItem", position: 3, name: `PDR in ${c.name}, PA`, item: url },
    ],
  })}</script>`;

  return `${head({
    title: `Paintless Dent Repair in ${c.name}, PA | Dent Logic Inc`,
    desc: `Paintless dent repair in ${c.name}, PA. Door dings, creases and hail damage fixed without repainting. Free photo estimate, usually same day.`,
    url,
    extraLd: bizLd() + "\n" + breadcrumbLd + "\n" + faqLd(localFaqs),
  })}
${header("areas")}
<main id="main">
  <div class="wrap breadcrumb">
    <a href="/">Home</a><span>&rsaquo;</span><a href="/#areas">Service areas</a><span>&rsaquo;</span>${c.name}
  </div>

  <section style="padding-top:1.5rem">
    <div class="wrap">
      <p class="eyebrow" style="background:var(--brand-tint);color:var(--brand-ink);border-color:#ffd0b0">${c.county}</p>
      <h1>Paintless dent repair in ${c.name}, PA</h1>
      <p style="font-size:1.1rem;max-width:60ch">${c.blurb}</p>
      <div class="hero__cta" style="margin:1.5rem 0 0">
        <a class="btn btn--primary" href="#estimate">Get my free estimate</a>
        <a class="btn btn--outline" href="tel:${PHONE_LINK}">${svg.phone} ${PHONE_HUMAN}</a>
      </div>
    </div>
  </section>

  <div class="trustbar">
    <div class="wrap">
      <ul>
        <li><b>OEM paint</b><span>Never sanded or resprayed</span></li>
        <li><b>Same-day</b><span>Estimate from your photos</span></li>
        <li><b>Mobile</b><span>Available in ${c.name}</span></li>
        <li><b>Insurance</b><span>Hail claims welcome</span></li>
      </ul>
    </div>
  </div>

  <section>
    <div class="wrap">
      <div class="grid grid--2">
        <div>
          <h2>Dents we see around ${c.name}</h2>
          <p>${c.local}</p>
          <p>Whatever caused it, the question is the same: is the paint intact and is the metal stretched? If the answer is yes and no, paintless dent repair will almost always give you a better result than a body shop, for less money and without touching your factory finish.</p>
          <p style="margin-bottom:0"><strong>Nearby:</strong> ${c.landmarks.join(" &middot; ")}</p>
        </div>
        <div class="card card--pad">
          <h3>Straight answer, no runaround</h3>
          <p>Send two or three photos and we will tell you what it costs and whether it is even worth doing. If your dent needs a body shop, we will say so &mdash; that is a faster answer than driving to ${c.name} to tell you in person.</p>
          <a class="btn btn--primary btn--block" href="#estimate">Send photos</a>
        </div>
      </div>
    </div>
  </section>

  <section class="section--alt">
    <div class="wrap">
      <div class="section__head">
        <h2>Services available in ${c.name}</h2>
      </div>
      <div class="grid grid--3">
        <article class="card"><div class="icon">${svg.van}</div><h3>Door dings</h3><p>Small dents from parking lots and tight garages. Typically 30&ndash;90 minutes and the cheapest repair we do.</p></article>
        <article class="card"><div class="icon">${svg.shield}</div><h3>Creases</h3><p>Longer damage running along a body line. Slower work, but it comes out without filler or paint.</p></article>
        <article class="card"><div class="icon">${svg.cloud}</div><h3>Hail damage</h3><p>Multi-panel storm damage, handled through your insurance from claim to finished vehicle.</p></article>
      </div>
    </div>
  </section>

  <section>
    <div class="wrap">
      <div class="section__head">
        <h2>Recent work</h2>
        <p>Drag any slider to see the same panel before and after.</p>
      </div>
      <div class="compare">${RESULTS.join("")}</div>
    </div>
  </section>

  <section class="section--alt">
    <div class="wrap">
      <div class="section__head">
        <h2>Typical ${c.name} pricing</h2>
        <p>Ranges, not quotes. Photos get you a firm number.</p>
      </div>
      <div class="price-table">
        <div class="price-row"><b>Small door ding</b><em>$125&ndash;$200</em><span>Dime to quarter sized, open panel.</span></div>
        <div class="price-row"><b>Medium dent</b><em>$200&ndash;$375</em><span>Palm sized, or awkward to reach.</span></div>
        <div class="price-row"><b>Crease or bodyline dent</b><em>$350&ndash;$650</em><span>Longer damage through a body line.</span></div>
        <div class="price-row"><b>Hail damage</b><em>Usually insurance</em><span>Priced off dent and panel count.</span></div>
      </div>
    </div>
  </section>

  <section>
    <div class="wrap">
      <div class="section__head"><h2>${c.name} questions</h2></div>
      ${faqBlock(localFaqs)}
    </div>
  </section>

${estimateForm(`City page: ${c.name}, PA`)}

  <section>
    <div class="wrap">
      <div class="section__head"><h2>Other areas we cover</h2></div>
      <div class="area-links">
        ${others.map((o) => `<a class="area-link" href="/pdr/${o.slug}/"><span>${o.name}, PA<small>${o.county}</small></span></a>`).join("\n        ")}
      </div>
    </div>
  </section>
</main>
${footer()}`;
}

function thanksPage() {
  return `${head({
    title: "Request received | Dent Logic Inc",
    desc: "Thanks - your paintless dent repair estimate request has been received.",
    url: SITE + "/thanks/",
    extraLd: '<meta name="robots" content="noindex,follow">',
  })}
${header()}
<main id="main">
  <section>
    <div class="wrap center tight">
      <div class="icon" style="margin:0 auto 1.25rem;width:64px;height:64px;border-radius:18px">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:32px;height:32px"><path d="M20 6 9 17l-5-5"/></svg>
      </div>
      <h1 style="font-size:clamp(1.8rem,4vw,2.6rem)">Got it &mdash; thanks.</h1>
      <p>Your request is with Greg. You will normally hear back the same day, and always within one business day.</p>
      <div class="notice" style="text-align:left;margin:2rem 0">
        <p><strong>Forgot to attach photos?</strong> Text them to ${PHONE_HUMAN} and we will match them to your request. Two or three angles in bright indirect light is all we need.</p>
      </div>
      <div class="hero__cta" style="justify-content:center">
        <a class="btn btn--primary" href="sms:${PHONE_LINK}" data-sms-prefill>${svg.chat} Text photos now</a>
        <a class="btn btn--outline" href="/">Back to the site</a>
      </div>
    </div>
  </section>
</main>
${footer()}`;
}

function notFoundPage() {
  return `${head({
    title: "Page not found | Dent Logic Inc",
    desc: "That page does not exist.",
    url: SITE + "/404",
    extraLd: '<meta name="robots" content="noindex">',
  })}
${header()}
<main id="main">
  <section>
    <div class="wrap center tight">
      <h1 style="font-size:clamp(1.8rem,4vw,2.6rem)">That page moved</h1>
      <p>The link you followed does not exist any more. Everything is one tap away below.</p>
      <div class="hero__cta" style="justify-content:center;margin-top:1.5rem">
        <a class="btn btn--primary" href="/#estimate">Get an estimate</a>
        <a class="btn btn--outline" href="tel:${PHONE_LINK}">Call ${PHONE_HUMAN}</a>
      </div>
    </div>
  </section>
</main>
${footer()}`;
}

/* ------------------------------------------------------------------- write */

const write = (rel, content) => {
  const full = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, "utf8");
  console.log(`  ${rel}  (${(content.length / 1024).toFixed(1)} kB)`);
};

fs.mkdirSync(OUT, { recursive: true });
console.log("Building:");
write("index.html", homepage());
cities.forEach((c) => write(`pdr/${c.slug}/index.html`, cityPage(c)));
write("thanks/index.html", thanksPage());
write("404.html", notFoundPage());

const today = new Date().toISOString().slice(0, 10);
write(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE}/</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>
${cities.map((c) => `  <url><loc>${SITE}/pdr/${c.slug}/</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`).join("\n")}
</urlset>`
);

write("robots.txt", `User-agent: *\nAllow: /\nDisallow: /thanks/\n\nSitemap: ${SITE}/sitemap.xml\n`);

/* _headers and _redirects are resolved relative to the published folder, so they
   work whether the site is deployed from a repo subfolder or dragged in as a zip.
   Deliberately not netlify.toml: that is read from the repo root and would
   override the publish directory configured in the Netlify UI. */
write(
  "_headers",
  `/*
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/*.css
  Cache-Control: public, max-age=604800

/*.js
  Cache-Control: public, max-age=604800
`
);

write(
  "_redirects",
  `# Old single-page anchors people may have bookmarked or linked.
/services   /#services   301
/estimate   /#estimate   301
`
);

console.log(`\nDone. ${cities.length + 3} pages written to ./dent-logic-site`);
