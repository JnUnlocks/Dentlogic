// Crops each before/after photo to a matching 4:3 frame centred on the repair,
// then emits WebP + JPEG at two widths. Run: node build-images.js
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "dent-logic-site", "assets");
const OUT = path.join(__dirname, "dent-logic-site", "assets");
fs.mkdirSync(OUT, { recursive: true });

// Crop boxes hand-picked so each pair frames the same panel at the same scale.
const crops = {
  "before-1": { left: 0, top: 260, width: 1440, height: 1080 },
  "after-1": { left: 0, top: 300, width: 1440, height: 1080 },
  "before-2": { left: 0, top: 520, width: 1120, height: 840 },
  "after-2": { left: 252, top: 0, width: 1512, height: 1134 },
  "before-3": { left: 0, top: 420, width: 1152, height: 864 },
  "after-3": { left: 432, top: 0, width: 1536, height: 1152 },
};

const WIDTHS = [800, 1400];

async function run() {
  for (const [name, box] of Object.entries(crops)) {
    const src = path.join(SRC, `${name}.jpg`);
    const meta = await sharp(src).metadata();
    // Clamp the crop to the real image bounds so a bad guess can't throw.
    const left = Math.max(0, Math.min(box.left, meta.width - 1));
    const top = Math.max(0, Math.min(box.top, meta.height - 1));
    const width = Math.min(box.width, meta.width - left);
    const height = Math.min(box.height, meta.height - top);

    for (const w of WIDTHS) {
      const base = sharp(src)
        .extract({ left, top, width, height })
        .resize(w, Math.round((w * 3) / 4), { fit: "cover" });
      await base.clone().webp({ quality: 78 }).toFile(path.join(OUT, `${name}-${w}.webp`));
      await base.clone().jpeg({ quality: 80, mozjpeg: true }).toFile(path.join(OUT, `${name}-${w}.jpg`));
    }
    console.log(`${name}: ${meta.width}x${meta.height} -> ${width}x${height}`);
  }

  // Hero: the glossy repaired quarter panel, wide crop.
  for (const w of [1000, 1800]) {
    await sharp(path.join(SRC, "after-3.jpg"))
      .extract({ left: 300, top: 120, width: 1748, height: 983 })
      .resize(w, Math.round(w * 0.5625), { fit: "cover" })
      .webp({ quality: 72 })
      .toFile(path.join(OUT, `hero-${w}.webp`));
    await sharp(path.join(SRC, "after-3.jpg"))
      .extract({ left: 300, top: 120, width: 1748, height: 983 })
      .resize(w, Math.round(w * 0.5625), { fit: "cover" })
      .jpeg({ quality: 74, mozjpeg: true })
      .toFile(path.join(OUT, `hero-${w}.jpg`));
  }
  console.log("hero generated");

  // Logo -> favicons and social card source.
  const logo = path.join(__dirname, "logo.png");
  const siteRoot = path.join(__dirname, "dent-logic-site");
  const icon = (size, name) =>
    sharp(logo)
      .resize(size, size, { fit: "contain", background: "#0d1218" })
      .png({ compressionLevel: 9, palette: true })
      .toFile(path.join(siteRoot, name));
  await icon(512, "logo.png"); // schema + social card
  await icon(80, "logo-80.png"); // header mark, 2x for a 40px slot
  await icon(180, "apple-touch-icon.png");
  await icon(32, "favicon-32.png");
  console.log("icons generated");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
