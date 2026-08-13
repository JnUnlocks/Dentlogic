/* Sanity pass over the built site: broken internal links, missing assets,
   JSON-LD parse errors, duplicate/missing SEO tags. Run: node check.js */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "dent-logic-site");
const problems = [];
const pages = [];

(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith(".html")) pages.push(p);
  }
})(ROOT);

const exists = (urlPath) => {
  const clean = urlPath.split("#")[0].split("?")[0];
  if (!clean || clean === "/") return fs.existsSync(path.join(ROOT, "index.html"));
  const base = path.join(ROOT, clean);
  return fs.existsSync(base) || fs.existsSync(base + "index.html") || fs.existsSync(path.join(base, "index.html"));
};

for (const file of pages) {
  const rel = path.relative(ROOT, file).replace(/\\/g, "/");
  const html = fs.readFileSync(file, "utf8");
  const at = (m) => `${rel}: ${m}`;

  // JSON-LD must parse.
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); } catch (e) { problems.push(at(`bad JSON-LD - ${e.message}`)); }
  }

  // Exactly one H1, one title, one canonical, one meta description.
  const count = (re) => (html.match(re) || []).length;
  if (count(/<h1[\s>]/g) !== 1) problems.push(at(`${count(/<h1[\s>]/g)} h1 tags`));
  if (count(/<title>/g) !== 1) problems.push(at("title tag count wrong"));
  if (count(/rel="canonical"/g) !== 1) problems.push(at("canonical count wrong"));
  if (count(/name="description"/g) !== 1) problems.push(at("meta description count wrong"));

  // Title/description length guidance.
  const title = (html.match(/<title>(.*?)<\/title>/) || [])[1] || "";
  if (title.length > 62) problems.push(at(`title ${title.length} chars (>62 truncates in SERPs): ${title}`));
  const desc = (html.match(/name="description" content="(.*?)"/) || [])[1] || "";
  if (desc.length > 158) problems.push(at(`meta description ${desc.length} chars (>158 truncates)`));

  // Internal links and asset references resolve.
  for (const m of html.matchAll(/(?:href|src)="(\/[^"]*)"/g)) {
    const target = m[1];
    if (target.startsWith("//")) continue;
    if (!exists(target)) problems.push(at(`dead reference -> ${target}`));
  }

  // srcset entries resolve too.
  for (const m of html.matchAll(/srcset="([^"]+)"/g)) {
    for (const part of m[1].split(",")) {
      const u = part.trim().split(/\s+/)[0];
      if (u.startsWith("/") && !fs.existsSync(path.join(ROOT, u))) problems.push(at(`dead srcset -> ${u}`));
    }
  }

  // Every img needs alt (empty alt is fine for decorative).
  for (const m of html.matchAll(/<img\b(?![^>]*\balt=)[^>]*>/g)) {
    problems.push(at(`img without alt: ${m[0].slice(0, 70)}`));
  }
}

console.log(`Checked ${pages.length} pages.`);
if (problems.length) {
  console.log(`\n${problems.length} problem(s):`);
  problems.forEach((p) => console.log("  - " + p));
  process.exit(1);
}
console.log("No problems found.");
