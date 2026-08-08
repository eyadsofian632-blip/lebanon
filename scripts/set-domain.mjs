#!/usr/bin/env node
/**
 * Points the site at your own domain.
 *
 *   node scripts/set-domain.mjs elbakri.com
 *   node scripts/set-domain.mjs https://www.elbakri.com
 *
 * The canonical link, Open Graph and Twitter tags, structured data, robots.txt
 * and sitemap.xml all need the live origin spelled out in full — relative URLs
 * are not reliable for crawlers or for Facebook and WhatsApp link previews.
 * This rewrites every one of them together so they cannot drift apart.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILES = ['index.html', 'robots.txt', 'sitemap.xml'];

/** Matches whatever origin is currently baked in, whoever set it last. */
const ORIGIN = /https?:\/\/[a-z0-9.-]+(?:\.[a-z]{2,})(?::\d+)?/gi;

const raw = process.argv[2];
if (!raw) {
  console.error(`usage: node scripts/set-domain.mjs <your-domain>

  node scripts/set-domain.mjs elbakri.com
  node scripts/set-domain.mjs https://www.elbakri.com`);
  process.exit(1);
}

let origin;
try {
  origin = new URL(raw.includes('://') ? raw : `https://${raw}`).origin;
} catch {
  console.error(`not a valid domain: ${raw}`);
  process.exit(1);
}

/* Leave third-party hosts alone — rewriting them would break the fonts. */
const KEEP = /fonts\.(googleapis|gstatic)\.com|schema\.org|www\.w3\.org|sitemaps\.org|github\.com|wa\.me|commons\.wikimedia\.org/i;

let changed = 0;
for (const rel of FILES) {
  const file = path.join(ROOT, rel);
  const before = await fs.readFile(file, 'utf8');
  const after = before.replace(ORIGIN, (m) => (KEEP.test(m) ? m : origin));
  if (after !== before) {
    await fs.writeFile(file, after);
    const hits = [...before.matchAll(ORIGIN)].filter((m) => !KEEP.test(m[0])).length;
    console.log(`✓ ${rel.padEnd(12)} ${hits} URL${hits === 1 ? '' : 's'}`);
    changed++;
  } else {
    console.log(`· ${rel.padEnd(12)} already correct`);
  }
}

console.log(`\nSite origin is now ${origin}`);
if (changed) console.log('Commit and push, and Vercel will redeploy.');
