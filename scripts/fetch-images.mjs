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
/* Wikimedia's UA policy wants a contact URL; a generic agent gets throttled. */
const UA = 'elbakri-lebanon-landing/1.0 (+https://github.com/eyadsofian632-blip/lebanon) node-fetch';
const WIDTH = 2000;
/* Commons answers 429 when hit in a tight loop, especially from shared CI IPs. */
const GAP_MS = 1200;
const MAX_ATTEMPTS = 5;

/* Each destination lists Commons categories in preference order. If none of
   them yield a usable photo the script falls back to a file search. */
const TARGETS = [
  // pick indices below were chosen by reviewing the candidate contact sheets;
  // rank 2 is the dusk cliff view, which belongs in the hero, not rank 1's
  // flat midday shot.
  { key: 'hero',              out: 'assets/lebanon/hero/hero.jpg',    pick: 2,
    cats: ['Raouche Rocks', 'Beirut Corniche'],           search: 'Raouche rocks Beirut sunset' },
  { key: 'raouche',           out: 'assets/lebanon/raouche/raouche.jpg', pick: 1,
    cats: ['Raouche Rocks'],                              search: 'Raouche rocks Beirut' },
  { key: 'mohammad-al-amin',  out: 'assets/lebanon/mohammad-al-amin/mohammad-al-amin.jpg',
    cats: ['Mohammad Al-Amin Mosque', 'Mohammad Al-Amin Mosque (Beirut)'],
    search: 'Mohammad Al-Amin Mosque Beirut' },
  { key: 'martyrs-square',    out: 'assets/lebanon/martyrs-square/martyrs-square.jpg', skip: true, // Commons offers a Shatila memorial and a concert
    cats: ["Martyrs' Square, Beirut", 'Martyrs Square, Beirut'],
    search: "Martyrs' Square Beirut" },
  { key: 'zaitunay-bay',      out: 'assets/lebanon/zaitunay-bay/zaitunay-bay.jpg', skip: true, // Commons offers underwater fish shots
    cats: ['Zaitunay Bay', 'Beirut Marina'],              search: 'Zaitunay Bay Beirut marina' },
  { key: 'hamra',             out: 'assets/lebanon/hamra/hamra.jpg', skip: true, // Commons offers an ice-cream cart
    cats: ['Hamra Street', 'Hamra, Beirut'],              search: 'Hamra street Beirut' },
  { key: 'jeita',             out: 'assets/lebanon/jeita/jeita.jpg',   pick: 6,
    cats: ['Jeita Grotto'],                               search: 'Jeita Grotto Lebanon' },
  { key: 'cable-car',         out: 'assets/lebanon/cable-car/cable-car.jpg', pick: 5,
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
  { key: 'departure',         out: 'assets/lebanon/departure/departure.jpg', skip: true, // Commons offers a night fire scene
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
/* Writes the top N candidates per destination as thumbnails under
   .candidates/ instead of downloading, so they can be eyeballed before
   anything is pinned. Category rank is size, not suitability: a tourism
   category will happily hand you a protest, a banquet or a fish. */
const CANDIDATES = Number(value('candidates') || 0);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Space requests out, and back off when Commons pushes back. */
let lastCall = 0;
async function polite(url) {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const wait = lastCall + GAP_MS - Date.now();
    if (wait > 0) await sleep(wait);
    lastCall = Date.now();

    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (res.ok) return res;

    if (res.status === 429 || res.status === 503) {
      if (attempt === MAX_ATTEMPTS) throw new Error(`${res.status} after ${attempt} tries`);
      const retryAfter = Number(res.headers.get('retry-after'));
      const backoff = Number.isFinite(retryAfter) && retryAfter > 0
        ? retryAfter * 1000
        : GAP_MS * 2 ** attempt;
      await sleep(backoff);
      continue;
    }
    throw new Error(`HTTP ${res.status}`);
  }
  throw new Error('exhausted retries');
}

async function api(params) {
  const url = `${API}?${new URLSearchParams({ format: 'json', formatversion: '2', ...params })}`;
  return (await polite(url)).json();
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
  const res = await polite(url);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, buf);
  return buf.length;
}

/**
 * Commons originals run several MB, which would wreck LCP on the mobile ad
 * traffic this page is built for. Cap the width and re-encode, plus a WebP
 * companion. Optional: without sharp the full-size JPEG is still usable.
 */
async function optimize(jpgPath) {
  try {
    const { default: sharp } = await import('sharp');
    const resized = await sharp(jpgPath)
      .rotate()
      .resize({ width: 1920, withoutEnlargement: true })
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer();
    await fs.writeFile(jpgPath, resized);
    await sharp(resized).webp({ quality: 78 }).toFile(jpgPath.replace(/\.jpe?g$/i, '.webp'));
    return resized.length;
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
/* Destinations share categories (hero and raouche both use Raouche Rocks), so
   without this the same photograph gets used for two different places. */
const claimed = new Set();

for (const t of TARGETS) {
  if (ONLY && t.key !== ONLY) continue;

  if (t.skip && !CANDIDATES) {
    console.log(`·  ${t.key.padEnd(18)} skipped — needs a real photo, see IMAGES.md`);
    continue;
  }

  const dest = path.join(ROOT, t.out);
  if (!CANDIDATES && !FORCE && await exists(dest)) {
    console.log(`·  ${t.key.padEnd(18)} already present, skipping`);
    continue;
  }

  /* A pinned file is one a human has actually looked at, so it wins outright. */
  if (t.pin && !CANDIDATES) {
    const url = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(t.pin)}?width=${WIDTH}`;
    try {
      const raw = await download(url, dest);
      const slim = await optimize(dest);
      console.log(`✓  ${t.key.padEnd(18)} ${String(Math.round((slim ?? raw) / 1024)).padStart(4)}KB  [pinned] ${t.pin}`);
      done.push(t.key);
      credits.push({
        key: t.key, file: t.out, title: t.pin,
        page: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(t.pin)}`,
        author: 'انظر صفحة الملف', licence: 'انظر صفحة الملف', source: 'pinned',
      });
    } catch (err) {
      failed.push([t.key, `pinned: ${err.message}`]);
      console.log(`✗  ${t.key.padEnd(18)} pinned file failed: ${err.message}`);
    }
    continue;
  }

  let picked = null;
  let source = '';
  const want = t.pick || PICK;
  const take = (pool) => {
    const at = pool[want - 1];
    if (at && !claimed.has(at.title)) return at;
    return pool.find((c) => !claimed.has(c.title)) || null;
  };

  try {
    let pool = [];
    for (const cat of t.cats) {
      pool = pool.concat(rank(await fromCategory(cat)));
      if (pool.length >= (CANDIDATES || 1) + 2) break;
    }
    if (pool.length < (CANDIDATES || 1)) {
      pool = pool.concat(rank(await fromSearch(t.search)));
    }
    // Same file can appear in several categories.
    const seen = new Set();
    pool = pool.filter((c) => !seen.has(c.title) && seen.add(c.title));

    if (CANDIDATES) {
      const dir = path.join(ROOT, '.candidates', t.key);
      await fs.mkdir(dir, { recursive: true });
      let i = 0;
      for (const c of pool.slice(0, CANDIDATES)) {
        i++;
        const name = c.title.replace(/^File:/, '').replace(/[^\w.\- ]+/g, '_').slice(0, 70);
        const thumb = c.info.thumburl.replace(/\/\d+px-/, '/520px-');
        try {
          await download(thumb, path.join(dir, `${String(i).padStart(2, '0')}__${name}`));
        } catch { /* one bad candidate should not stop the sheet */ }
      }
      console.log(`·  ${t.key.padEnd(18)} ${i} candidates`);
      continue;
    }

    picked = take(pool);
    source = 'category/search';
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
    const raw = await download(picked.info.thumburl, dest);
    const slim = await optimize(dest);
    const kb = Math.round((slim ?? raw) / 1024);
    const saved = slim ? ` (was ${Math.round(raw / 1024)}KB, +webp)` : '';
    console.log(`✓  ${t.key.padEnd(18)} ${String(kb).padStart(4)}KB${saved}  ${picked.title.replace(/^File:/, '')}`);
    claimed.add(picked.title);
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
