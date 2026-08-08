#!/usr/bin/env node
/**
 * Downloads a real photograph for every destination in the itinerary from
 * Wikimedia Commons, straight into the paths index.html already references.
 *
 *   node scripts/fetch-images.mjs               # fetch everything missing
 *   node scripts/fetch-images.mjs --force       # re-fetch even if present
 *   node scripts/fetch-images.mjs --only=byblos # one destination
 *   node scripts/fetch-images.mjs --only=byblos --pick=2   # take the runner-up
 *
 * Commons images are freely licensed but most require attribution, so every
 * download is recorded in CREDITS.md with its author and licence.
 *
 * Requires Node 18+. No dependencies. Install `sharp` for WebP output.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const API = 'https://commons.wikimedia.org/w/api.php';
const UA = 'elbakri-lebanon-landing/1.0 (static site asset fetcher)';
const WIDTH = 2000;

/* Each destination lists Commons categories in preference order. If none of
   them yield a usable photo the script falls back to a file search. */
const TARGETS = [
  { key: 'hero',              out: 'assets/lebanon/hero/hero.jpg',
    cats: ['Raouche Rocks', 'Beirut Corniche'],           search: 'Raouche rocks Beirut sunset' },
  { key: 'raouche',           out: 'assets/lebanon/raouche/raouche.jpg',
    cats: ['Raouche Rocks'],                              search: 'Raouche rocks Beirut' },
  { key: 'mohammad-al-amin',  out: 'assets/lebanon/mohammad-al-amin/mohammad-al-amin.jpg',
    cats: ['Mohammad Al-Amin Mosque', 'Mohammad Al-Amin Mosque (Beirut)'],
    search: 'Mohammad Al-Amin Mosque Beirut' },
  { key: 'martyrs-square',    out: 'assets/lebanon/martyrs-square/martyrs-square.jpg',
    cats: ["Martyrs' Square, Beirut", 'Martyrs Square, Beirut'],
    search: "Martyrs' Square Beirut" },
  { key: 'zaitunay-bay',      out: 'assets/lebanon/zaitunay-bay/zaitunay-bay.jpg',
    cats: ['Zaitunay Bay', 'Beirut Marina'],              search: 'Zaitunay Bay Beirut marina' },
  { key: 'hamra',             out: 'assets/lebanon/hamra/hamra.jpg',
    cats: ['Hamra Street', 'Hamra, Beirut'],              search: 'Hamra street Beirut' },
  { key: 'jeita',             out: 'assets/lebanon/jeita/jeita.jpg',
    cats: ['Jeita Grotto'],                               search: 'Jeita Grotto Lebanon' },
  { key: 'cable-car',         out: 'assets/lebanon/cable-car/cable-car.jpg',
    cats: ['Téléphérique de Jounieh', 'Harissa, Lebanon'], search: 'Harissa teleferique Jounieh cable car' },
  { key: 'pine-yards',        out: 'assets/lebanon/pine-yards/pine-yards.jpg',
    cats: ['Pine Forest of Beirut', 'Horsh Beirut'],      search: 'Beirut pine forest Horsh' },
  { key: 'byblos',            out: 'assets/lebanon/byblos/byblos.jpg',
    cats: ['Port of Byblos', 'Byblos Castle', 'Byblos'],  search: 'Byblos old harbour castle' },
  { key: 'batroun',           out: 'assets/lebanon/batroun/batroun.jpg',
    cats: ['Batroun'],                                    search: 'Batroun Lebanon sea wall' },
  { key: 'deir-el-qamar',     out: 'assets/lebanon/deir-el-qamar/deir-el-qamar.jpg',
    cats: ['Deir el Qamar', 'Deir al-Qamar'],             search: 'Deir el Qamar Lebanon' },
  { key: 'moussa-castle',     out: 'assets/lebanon/moussa-castle/moussa-castle.jpg',
    cats: ['Moussa Castle'],                              search: 'Moussa Castle Lebanon Deir el Qamar' },
  // شلالات الزرقاء = the blue waterfalls on the Baakline river, Chouf.
  { key: 'blue-waterfalls',   out: 'assets/lebanon/blue-waterfalls/blue-waterfalls.jpg',
    cats: ['Baakline', 'Baakline River', 'Waterfalls of Lebanon'],
    search: 'Baakline river waterfall Chouf' },
  { key: 'free-day',          out: 'assets/lebanon/free-day/free-day.jpg',
    cats: ['Beirut Corniche', 'Beirut'],                  search: 'Beirut street cafe corniche' },
  { key: 'departure',         out: 'assets/lebanon/departure/departure.jpg',
    cats: ['Beirut–Rafic Hariri International Airport', 'Beirut'],
    search: 'Beirut Rafic Hariri airport' },
  { key: 'final-cta',         out: 'assets/lebanon/final-cta/final-cta.jpg',
    cats: ['Byblos', 'Beirut Corniche'],                  search: 'Lebanon coast sunset' },
];

/* Skip maps, plans, crests, historical scans and other non-photographs. */
const REJECT = /(map|plan\b|diagram|logo|coat[ _]of[ _]arms|flag|banner|seal|stamp|poster|screenshot|matpc|LOC |library of congress|1[89]\d\d|panorama)/i;

const args = process.argv.slice(2);
const flag = (n) => args.some((a) => a === `--${n}`);
const value = (n) => (args.find((a) => a.startsWith(`--${n}=`)) || '').split('=')[1];

const FORCE = flag('force');
const ONLY = value('only');
const PICK = Math.max(1, Number(value('pick') || 1));

async function api(params) {
  const url = `${API}?${new URLSearchParams({ format: 'json', formatversion: '2', ...params })}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`Commons API ${res.status}`);
  return res.json();
}

const imageProps = {
  prop: 'imageinfo',
  iiprop: 'url|size|mime|extmetadata',
  iiurlwidth: String(WIDTH),
};

async function fromCategory(cat) {
  const data = await api({
    action: 'query',
    generator: 'categorymembers',
    gcmtitle: `Category:${cat}`,
    gcmtype: 'file',
    gcmlimit: '100',
    ...imageProps,
  });
  return data?.query?.pages ?? [];
}

async function fromSearch(term) {
  const data = await api({
    action: 'query',
    generator: 'search',
    gsrsearch: term,
    gsrnamespace: '6',
    gsrlimit: '60',
    ...imageProps,
  });
  return data?.query?.pages ?? [];
}

/** Rank candidates: real landscape photographs, biggest first. */
function rank(pages) {
  return pages
    .map((p) => ({ title: p.title || '', info: p.imageinfo?.[0] }))
    .filter(({ title, info }) => {
      if (!info?.thumburl) return false;
      if (!/^image\/(jpeg|png)$/.test(info.mime || '')) return false;
      if (REJECT.test(title)) return false;
      if (info.width < 1400) return false;
      const ratio = info.width / info.height;
      return ratio >= 1.2 && ratio <= 2.4;
    })
    .sort((a, b) => b.info.width * b.info.height - a.info.width * a.info.height);
}

const meta = (info, field) => (info.extmetadata?.[field]?.value || '')
  .replace(/<[^>]*>/g, '')
  .replace(/\s+/g, ' ')
  .trim();

async function download(url, dest) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`download ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, buf);
  return buf.length;
}

/** WebP is a bonus, never a reason to fail a download that already succeeded. */
async function toWebp(jpgPath) {
  try {
    const { default: sharp } = await import('sharp');
    const webp = jpgPath.replace(/\.jpe?g$/i, '.webp');
    await sharp(jpgPath).webp({ quality: 82 }).toFile(webp);
    return webp;
  } catch {
    return null;
  }
}

async function exists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}

const credits = [];
const done = [];
const failed = [];

for (const t of TARGETS) {
  if (ONLY && t.key !== ONLY) continue;

  const dest = path.join(ROOT, t.out);
  if (!FORCE && await exists(dest)) {
    console.log(`·  ${t.key.padEnd(18)} already present, skipping`);
    continue;
  }

  let picked = null;
  let source = '';

  try {
    for (const cat of t.cats) {
      const ranked = rank(await fromCategory(cat));
      if (ranked.length >= PICK) { picked = ranked[PICK - 1]; source = `Category:${cat}`; break; }
      if (ranked.length && !picked) { picked = ranked[0]; source = `Category:${cat}`; }
    }
    if (!picked) {
      const ranked = rank(await fromSearch(t.search));
      if (ranked.length) { picked = ranked[Math.min(PICK, ranked.length) - 1]; source = `search: ${t.search}`; }
    }
  } catch (err) {
    failed.push([t.key, err.message]);
    console.log(`✗  ${t.key.padEnd(18)} ${err.message}`);
    continue;
  }

  if (!picked) {
    failed.push([t.key, 'no suitable photo found']);
    console.log(`✗  ${t.key.padEnd(18)} no suitable photo found`);
    continue;
  }

  try {
    const bytes = await download(picked.info.thumburl, dest);
    const webp = await toWebp(dest);
    const kb = Math.round(bytes / 1024);
    console.log(`✓  ${t.key.padEnd(18)} ${kb}KB  ${picked.title.replace(/^File:/, '')}${webp ? '  (+webp)' : ''}`);
    done.push(t.key);
    credits.push({
      key: t.key,
      file: t.out,
      title: picked.title.replace(/^File:/, ''),
      page: picked.info.descriptionurl,
      author: meta(picked.info, 'Artist') || 'غير محدد',
      licence: meta(picked.info, 'LicenseShortName') || 'انظر صفحة الملف',
      source,
    });
  } catch (err) {
    failed.push([t.key, err.message]);
    console.log(`✗  ${t.key.padEnd(18)} ${err.message}`);
  }
}

if (credits.length) {
  const rows = credits.map((c) =>
    `| ${c.key} | \`${c.file}\` | [${c.title}](${c.page}) | ${c.author} | ${c.licence} |`).join('\n');
  const header = `# مصادر الصور

الصور التالية من ويكيميديا كومنز. أغلب الرخص تتطلب ذكر المصدر — راجع صفحة كل
ملف قبل الاستخدام التجاري، واحتفظ بهذا الملف في المشروع.

| المكان | الملف | الصورة | المصور | الرخصة |
|---|---|---|---|---|
`;
  const prev = await exists(path.join(ROOT, 'CREDITS.md'))
    ? await fs.readFile(path.join(ROOT, 'CREDITS.md'), 'utf8') : '';
  const kept = prev.split('\n').filter((l) => l.startsWith('| ') && !l.startsWith('| المكان')
    && !credits.some((c) => l.startsWith(`| ${c.key} |`)));
  await fs.writeFile(path.join(ROOT, 'CREDITS.md'), header + [rows, ...kept].join('\n') + '\n');
  console.log(`\nCREDITS.md updated (${credits.length} entries).`);
}

console.log(`\ndone: ${done.length}   failed: ${failed.length}`);
if (failed.length) {
  console.log('\nRe-run a single one with a different pick, e.g.:');
  console.log(`  node scripts/fetch-images.mjs --only=${failed[0][0]} --pick=2 --force`);
}
console.log(`
Still needs your own files (not on Commons):
  assets/logo/elbakri-logo.png   official logo  -> node scripts/prepare-logo.mjs
  assets/hotel/hotel-main.jpg    Midtown Hotel, from the hotel or your own photos
  assets/hotel/hotel-1..3.jpg
  assets/trips/trip-01..05.jpg   your previous-trip photos
  assets/og/og-cover.jpg         1200x630 share image
`);
