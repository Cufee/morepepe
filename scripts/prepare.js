import { readFileSync, writeFileSync, copyFileSync, existsSync, mkdirSync, readdirSync } from "fs";
import { execSync } from "child_process";
import { join, basename } from "path";

const ASSETS = "assets";
const OUT = "public/emojis";
const DATA = "src/data";

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
if (!existsSync(DATA)) mkdirSync(DATA, { recursive: true });

const raw = JSON.parse(readFileSync(join(ASSETS, "manifest.json"), "utf-8"));
const files = new Set(readdirSync(ASSETS).filter((f) => f !== "manifest.json" && !f.startsWith(".")));

// Dedupe: keep first occurrence of each filename
const seen = new Set();
const entries = [];
for (const entry of raw) {
  if (seen.has(entry.name)) continue;
  if (!files.has(entry.name)) continue;
  seen.add(entry.name);
  entries.push(entry);
}

// Build slug map — use stem unless conflicting extensions exist
const stemCount = new Map();
for (const e of entries) {
  const stem = e.name.replace(/\.[^.]+$/, "");
  stemCount.set(stem, (stemCount.get(stem) || 0) + 1);
}

const emojis = entries.map((e) => {
  const stem = e.name.replace(/\.[^.]+$/, "");
  const ext = e.name.split(".").pop();
  const slug = stemCount.get(stem) > 1 ? `${stem}-${ext}` : stem;

  return {
    slug,
    name: e.name,
    displayName: stem.replace(/-/g, " "),
    description: cleanDescription(e.description),
    tags: e.tags || [],
    width: e.width,
    height: e.height,
    fileSize: e.fileSize,
    fileSizeHuman: e.fileSizeHuman,
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

// Copy images
for (const e of emojis) {
  copyFileSync(join(ASSETS, e.name), join(OUT, e.name));
}

// Write full data
writeFileSync(join(DATA, "emojis.json"), JSON.stringify(emojis));

// Build search index (lighter — only fields needed for search + display)
const searchData = emojis.map((e) => ({
  s: e.slug,
  n: e.displayName,
  d: e.description,
  t: e.tags.join(" "),
  f: e.name,
  e: e.ext,
}));
writeFileSync(join(DATA, "search-index.json"), JSON.stringify(searchData));

// Also write search index to public for client-side fetch
writeFileSync(join("public", "search-index.json"), JSON.stringify(searchData));

// Build zip
const zipPath = join(OUT, "morepepe-all.zip");
const absZip = join(process.cwd(), zipPath);
const filesToZip = emojis.map((e) => e.name).join("\n");
execSync(`zip -j '${absZip}' -@`, { input: filesToZip, cwd: ASSETS, stdio: ["pipe", "pipe", "pipe"] });

const zipSize = readFileSync(zipPath).length;
const stats = {
  total: emojis.length,
  png: emojis.filter((e) => e.ext === "png").length,
  gif: emojis.filter((e) => e.ext === "gif").length,
  zipSize,
  zipSizeHuman: humanSize(zipSize),
};
writeFileSync(join(DATA, "stats.json"), JSON.stringify(stats));

console.log(`Prepared ${emojis.length} emojis (${stats.png} PNG, ${stats.gif} GIF), zip: ${stats.zipSizeHuman}`);

function cleanDescription(desc) {
  if (!desc) return "";
  // Remove notes about file processing
  return desc
    .replace(/\.\s*(Removed|Renamed|Added|Preserved|Changed|Converted|Kebab|Original|File|Source|Note)[^.]*\.?/gi, ".")
    .replace(/\.\s*$/, "")
    .replace(/^\s*\.?\s*/, "")
    .trim();
}

function humanSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}
