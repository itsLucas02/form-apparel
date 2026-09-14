/**
 * Downloads every catalogue image used by the seed data and the four editorial
 * images, converts them to WebP, and writes them under `public/images/`.
 *
 *   node scripts/fetch-images.mjs            # skip files that already exist
 *   node scripts/fetch-images.mjs --force    # re-download everything
 *
 * Catalogue sources come from `src/lib/commerce/local/seed-data.ts` so the
 * manifest never drifts from the seed. Pexels imagery is free to use and modify
 * (https://www.pexels.com/license/).
 */
import { mkdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const seedFile = path.join(root, "src/lib/commerce/local/seed-data.ts");
const imagesDir = path.join(root, "public/images");
const catalogDir = path.join(imagesDir, "catalog");
const force = process.argv.includes("--force");

const pexels = (id, w, h) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=${w}&h=${h}`;

/** Editorial / hero imagery (4 files the app references directly). */
const editorials = [
  { name: "hero-aw26", id: 34082626, w: 2400, h: 1350 },
  { name: "edit-linen", id: 17805751, w: 1400, h: 1750 },
  { name: "edit-knitwear", id: 4651447, w: 1400, h: 1750 },
  { name: "edit-tailoring", id: 29571692, w: 2000, h: 1125 },
];

const QUALITY = 82;

async function fetchOne({ url, outFile, width, height }) {
  if (!force && existsSync(outFile)) {
    return { outFile, skipped: true };
  }
  const res = await fetch(url, {
    headers: { "User-Agent": "form-apparel/1.0 (image build script)" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await sharp(buf)
    .resize(width, height, { fit: "cover", position: "attention" })
    .webp({ quality: QUALITY })
    .toFile(outFile);
  return { outFile, skipped: false };
}

async function runPool(tasks, limit = 6) {
  const queue = [...tasks];
  const workers = Array.from({ length: Math.min(limit, queue.length) }, async () => {
    while (queue.length) {
      const task = queue.shift();
      const label = path.relative(root, task.outFile);
      try {
        const { skipped } = await fetchOne(task);
        console.log(`${skipped ? "skip" : "  ok"}  ${label}`);
      } catch (error) {
        console.error(`FAIL  ${label}: ${error.message}`);
        process.exitCode = 1;
      }
    }
  });
  await Promise.all(workers);
}

async function main() {
  await mkdir(catalogDir, { recursive: true });

  const src = await readFile(seedFile, "utf8");
  const ids = [...new Set([...src.matchAll(/px\((\d+)/g)].map((m) => m[1]))];

  console.log(`Catalog: ${ids.length} unique Pexels images`);
  await runPool(
    ids.map((id) => ({
      url: pexels(id, 1200, 1500),
      outFile: path.join(catalogDir, `${id}.webp`),
      width: 1200,
      height: 1500,
    })),
  );

  console.log(`Editorial: ${editorials.length} images`);
  await runPool(
    editorials.map((e) => ({
      url: pexels(e.id, e.w, e.h),
      outFile: path.join(imagesDir, `${e.name}.webp`),
      width: e.w,
      height: e.h,
    })),
  );

  if (process.exitCode) {
    console.error("\nSome images failed.");
  } else {
    console.log("\nDone.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
