import { createWriteStream, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import archiver from "archiver";

const EMOJIS = "public/emojis";
const DATA = "src/data";

if (!existsSync(DATA)) mkdirSync(DATA, { recursive: true });

const manifest = JSON.parse(readFileSync(join(EMOJIS, "manifest.json"), "utf-8"));

// Build slug map — use stem unless conflicting extensions exist
const stemCount = new Map();
for (const e of manifest) {
  const stem = e.name.replace(/\.[^.]+$/, "");
  stemCount.set(stem, (stemCount.get(stem) || 0) + 1);
}

const emojis = manifest.map((e) => {
  const stem = e.name.replace(/\.[^.]+$/, "");
  const ext = e.name.split(".").pop();
  const slug = stemCount.get(stem) > 1 ? `${stem}-${ext}` : stem;
  const fileSize = statSync(join(EMOJIS, e.name)).size;

  return {
    slug,
    name: e.name,
    displayName: stem.replace(/-/g, " "),

    tags: e.tags || [],
    width: e.width,
    height: e.height,
    fileSize,
    fileSizeHuman: humanSize(fileSize),
    fileType: e.fileType,
    ext,
  };
});

// Assert slug uniqueness
const slugSet = new Set();
for (const e of emojis) {
  if (slugSet.has(e.slug)) throw new Error(`Duplicate slug: ${e.slug} (${e.name})`);
  slugSet.add(e.slug);
}

// Compute related emojis using tag overlap + name similarity
const RELATED_COUNT = 6;

const tagSets = new Map(emojis.map((e) => [e.slug, new Set(e.tags)]));
const nameWords = new Map(emojis.map((e) => [e.slug, new Set(e.displayName.split(" "))]));

for (const emoji of emojis) {
  const eTags = tagSets.get(emoji.slug);
  const eWords = nameWords.get(emoji.slug);

  const scored = [];
  for (const other of emojis) {
    if (other.slug === emoji.slug) continue;
    const oTags = tagSets.get(other.slug);
    const oWords = nameWords.get(other.slug);
    let score = 0;
    for (const t of eTags) if (oTags.has(t)) score += 2;
    for (const w of eWords) if (oWords.has(w)) score += 3;
    if (score > 0) scored.push({ slug: other.slug, score });
  }

  scored.sort((a, b) => b.score - a.score);
  emoji.related = scored.slice(0, RELATED_COUNT).map((r) => r.slug);
}

// Write data files
writeFileSync(join(DATA, "emojis.json"), JSON.stringify(emojis));

const searchData = emojis.map((e) => ({
  s: e.slug,
  n: e.displayName,
  t: e.tags.join(" "),
  f: e.name,
  e: e.ext,
}));
writeFileSync(join("public", "search-index.json"), JSON.stringify(searchData));

// Build zip
const zipPath = join(EMOJIS, "morepepe-all.zip");
await buildZip(zipPath, emojis);

const zipSize = readFileSync(zipPath).length;
const stats = {
  total: emojis.length,
  png: emojis.filter((e) => e.ext === "png").length,
  gif: emojis.filter((e) => e.ext === "gif").length,
  zipSize,
  zipSizeHuman: humanSize(zipSize),
};
writeFileSync(join(DATA, "stats.json"), JSON.stringify(stats));

console.log(
  `Prepared ${emojis.length} emojis (${stats.png} PNG, ${stats.gif} GIF), zip: ${stats.zipSizeHuman}`,
);

function buildZip(outPath, items) {
  return new Promise((resolve, reject) => {
    const output = createWriteStream(outPath);
    const archive = archiver("zip", { zlib: { level: 9 } });
    output.on("close", resolve);
    archive.on("error", reject);
    archive.pipe(output);
    for (const e of items) {
      archive.file(join(EMOJIS, e.name), { name: e.name });
    }
    archive.finalize();
  });
}

function humanSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
