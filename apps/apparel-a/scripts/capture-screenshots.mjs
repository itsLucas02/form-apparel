/**
 * Captures README screenshots from a running site with headless Chrome (CDP).
 *
 *   node scripts/capture-screenshots.mjs [baseUrl]
 *
 * Writes to <repo>/docs/screenshots/.
 */
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as sleep } from "node:timers/promises";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const outDir = path.join(root, "docs/screenshots");
const BASE = process.argv[2] || "https://form-apparel-a.vercel.app";
const CHROME = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9350;

const shots = [
  { name: "home-desktop", path: "/", width: 1440, height: 900 },
  { name: "products-desktop", path: "/products", width: 1440, height: 900 },
  { name: "product-desktop", path: "/products/wool-overcoat", width: 1440, height: 900 },
  { name: "home-mobile", path: "/", width: 390, height: 844 },
];

await mkdir(outDir, { recursive: true });

const chrome = spawn(CHROME, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run", `--remote-debugging-port=${PORT}`, `--user-data-dir=${path.join(os.tmpdir(), "form-shots-profile")}`, "about:blank"], { stdio: "ignore" });

let ws;
const pending = new Map();
let nextId = 1;
const send = (method, params = {}) => {
  const id = nextId++;
  ws.send(JSON.stringify({ id, method, params }));
  return new Promise((r) => pending.set(id, r));
};

try {
  await sleep(1500);
  const targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
  const page = targets.find((t) => t.type === "page");
  ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m.result);
      pending.delete(m.id);
    }
  };
  await send("Page.enable");
  await send("Runtime.enable");

  for (const shot of shots) {
    await send("Emulation.setDeviceMetricsOverride", {
      width: shot.width,
      height: shot.height,
      deviceScaleFactor: 1,
      mobile: shot.width < 600,
    });
    await send("Page.navigate", { url: BASE + shot.path });
    await sleep(6000);
    const { data } = await send("Page.captureScreenshot", { format: "png" });
    const file = path.join(outDir, `${shot.name}.png`);
    await writeFile(file, Buffer.from(data, "base64"));
    console.log(`ok  docs/screenshots/${shot.name}.png`);
  }
} catch (error) {
  console.error("ERR", error);
  process.exitCode = 1;
} finally {
  try { ws?.close(); } catch {}
  chrome.kill();
  process.exit(process.exitCode ?? 0);
}
