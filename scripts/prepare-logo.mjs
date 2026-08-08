#!/usr/bin/env node
/**
 * Makes the ELBAKRI OVERSEAS logo's light background transparent.
 *
 *   npm i sharp
 *   node scripts/prepare-logo.mjs assets/logo/elbakri-logo-original.png
 *
 * Writes assets/logo/elbakri-logo.png (transparent) plus a 180x180
 * apple-touch-icon. The artwork itself is never touched — no redrawing,
 * no recolouring, no reproportioning. Only background pixels lose their alpha.
 *
 * The background colour is sampled from the image corners, so it works whether
 * the source sits on #EDF0F5, pure white, or any other flat light plate.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'assets/logo/elbakri-logo.png');
const ICON = path.join(ROOT, 'assets/logo/apple-touch-icon.png');

/** How far a pixel may sit from the sampled background and still be cut out.
 *  Raise it if a halo remains, lower it if the artwork gets eaten. */
const TOLERANCE = Number(process.env.TOLERANCE || 26);
/** Pixels within FEATHER of the threshold fade out instead of hard-cutting,
 *  which keeps the logo's antialiased edges smooth. */
const FEATHER = 18;

const src = process.argv[2];
if (!src) {
  console.error(`usage: node scripts/prepare-logo.mjs <path-to-supplied-logo>

Put the logo file you were given anywhere, then point this at it, e.g.
  node scripts/prepare-logo.mjs ~/Downloads/elbakri-logo.png`);
  process.exit(1);
}

let sharp;
try {
  ({ default: sharp } = await import('sharp'));
} catch {
  console.error(`sharp is required. Install it first:

  npm i sharp

(The site also works without this step — the navbar and footer place the logo
on a plate matching its own background, so the original file looks seamless.)`);
  process.exit(1);
}

const input = path.resolve(src);
try { await fs.access(input); } catch {
  console.error(`not found: ${input}`);
  process.exit(1);
}

const img = sharp(input).ensureAlpha();
const { width, height } = await img.metadata();
const { data } = await img.raw().toBuffer({ resolveWithObject: true });

/* Sample the four corners; the median channel value is the background. */
const corners = [
  [2, 2], [width - 3, 2], [2, height - 3], [width - 3, height - 3],
].map(([x, y]) => {
  const i = (y * width + x) * 4;
  return [data[i], data[i + 1], data[i + 2]];
});
const bg = [0, 1, 2].map((c) => {
  const vals = corners.map((p) => p[c]).sort((a, b) => a - b);
  return Math.round((vals[1] + vals[2]) / 2);
});

let cleared = 0;
for (let i = 0; i < data.length; i += 4) {
  const dist = Math.max(
    Math.abs(data[i] - bg[0]),
    Math.abs(data[i + 1] - bg[1]),
    Math.abs(data[i + 2] - bg[2]),
  );
  if (dist <= TOLERANCE) {
    data[i + 3] = 0;
    cleared++;
  } else if (dist <= TOLERANCE + FEATHER) {
    // Soften the boundary so edges do not look cut with scissors.
    data[i + 3] = Math.round(data[i + 3] * ((dist - TOLERANCE) / FEATHER));
  }
}

await fs.mkdir(path.dirname(OUT), { recursive: true });
await sharp(data, { raw: { width, height, channels: 4 } })
  .png({ compressionLevel: 9 })
  .toFile(OUT);

/* Square icon on the brand navy, logo centred with breathing room. */
await sharp({
  create: { width: 180, height: 180, channels: 4, background: '#0B1E5C' },
})
  .composite([{
    input: await sharp(OUT).resize({ width: 148, fit: 'inside' }).toBuffer(),
    gravity: 'center',
  }])
  .png()
  .toFile(ICON);

const pct = ((cleared / (width * height)) * 100).toFixed(1);
console.log(`background sampled: rgb(${bg.join(', ')})`);
console.log(`cleared ${pct}% of pixels`);
console.log(`wrote ${path.relative(ROOT, OUT)}  (${width}x${height})`);
console.log(`wrote ${path.relative(ROOT, ICON)}  (180x180)`);
if (Number(pct) < 20) {
  console.log(`\nOnly ${pct}% was cleared — if a background remains, retry with a
higher tolerance:  TOLERANCE=40 node scripts/prepare-logo.mjs "${src}"`);
}
