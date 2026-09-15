/**
 * Generates the brand icon / social images from an inline SVG wordmark.
 *
 *   node scripts/make-brand-images.mjs
 *
 * Outputs (Next.js file conventions, auto-wired into metadata):
 *   src/app/icon.png            512x512  — favicon
 *   src/app/apple-icon.png      180x180  — iOS home screen
 *   src/app/opengraph-image.png 1200x630 — Open Graph
 *   src/app/twitter-image.png   1200x630 — Twitter card
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const appDir = path.join(root, "src/app");

const BONE = "#f4f1ec";
const INK = "#141414";
const STONE = "#6f6a63";

const FONT = "Arial, Helvetica, sans-serif";

const wordmark = (size, { x, y }) =>
  `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" ` +
  `font-family="${FONT}" font-weight="600" font-size="${size}" letter-spacing="${Math.round(size * 0.12)}" ` +
  `fill="${INK}">FORM</text>`;

function iconSvg(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${BONE}"/>
  ${wordmark(Math.round(size * 0.22), { x: size / 2 + size * 0.012, y: size / 2 })}
</svg>`;
}

function ogSvg(width, height) {
  const mark = Math.round(width * 0.11);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="${BONE}"/>
  <rect x="0" y="0" width="${width}" height="10" fill="${INK}"/>
  ${wordmark(mark, { x: width / 2 + mark * 0.012, y: height / 2 - height * 0.05 })}
  <text x="${width / 2}" y="${height / 2 + height * 0.16}" text-anchor="middle" dominant-baseline="central"
    font-family="${FONT}" font-weight="400" font-size="${Math.round(height * 0.05)}" letter-spacing="${Math.round(height * 0.006)}"
    fill="${STONE}">Menswear made for South African days.</text>
</svg>`;
}

const jobs = [
  { file: "icon.png", svg: iconSvg(512) },
  { file: "apple-icon.png", svg: iconSvg(180) },
  { file: "opengraph-image.png", svg: ogSvg(1200, 630) },
  { file: "twitter-image.png", svg: ogSvg(1200, 630) },
];

for (const job of jobs) {
  const out = path.join(appDir, job.file);
  const info = await sharp(Buffer.from(job.svg)).png().toFile(out);
  console.log(`ok  ${job.file}  ${info.width}x${info.height}  ${Math.round(info.size / 1024)}KB`);
}

console.log("Done.");
