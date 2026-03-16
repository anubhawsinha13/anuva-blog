#!/usr/bin/env node
/**
 * Local sanity checker for anuva.blog static build.
 *
 * Usage:
 *   node scripts/check.mjs            # check existing out/ build
 *   npm run check                      # build then check
 *
 * What it does:
 *  1. Serves the ./out directory on a random local port
 *  2. BFS-crawls every internal HTML page starting from /
 *  3. Checks every <a href>, <link href>, <img src>, <script src>
 *  4. Prints a colour-coded report
 *  5. Exits 1 if any broken link is found (CI-friendly)
 */

import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "../out");
const CHECK_EXTERNAL = process.argv.includes("--external");
const PORT = 0; // 0 = OS picks a free port

// ─── MIME MAP ────────────────────────────────────────────────────────────────
const MIME = {
  ".html": "text/html",
  ".css":  "text/css",
  ".js":   "application/javascript",
  ".json": "application/json",
  ".svg":  "image/svg+xml",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".ico":  "image/x-icon",
  ".woff2":"font/woff2",
  ".txt":  "text/plain",
};

// ─── STATIC SERVER ───────────────────────────────────────────────────────────
function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let urlPath = decodeURIComponent(req.url.split("?")[0]);

      // Try exact path first, then /index.html, then .html suffix
      const candidates = [
        path.join(OUT_DIR, urlPath),
        path.join(OUT_DIR, urlPath, "index.html"),
        path.join(OUT_DIR, urlPath.replace(/\/$/, "") + ".html"),
      ];

      let filePath = null;
      for (const c of candidates) {
        if (fs.existsSync(c) && fs.statSync(c).isFile()) {
          filePath = c;
          break;
        }
      }

      if (!filePath) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }

      const ext = path.extname(filePath);
      res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
      fs.createReadStream(filePath).pipe(res);
    });

    server.listen(PORT, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({ server, base: `http://127.0.0.1:${port}` });
    });
  });
}

// ─── HTML LINK EXTRACTOR ─────────────────────────────────────────────────────
function extractLinks(html, pageUrl) {
  const links = new Set();
  // Match href="..." src="..." srcset="..." (first URL in srcset)
  const patterns = [
    /\shref=["']([^"'#][^"']*?)["']/gi,
    /\ssrc=["']([^"'#][^"']*?)["']/gi,
  ];
  for (const re of patterns) {
    for (const m of html.matchAll(re)) {
      try {
        const resolved = new URL(m[1], pageUrl).href;
        links.add(resolved);
      } catch {
        // ignore malformed
      }
    }
  }
  return [...links];
}

// ─── FETCH WITH TIMEOUT ──────────────────────────────────────────────────────
async function fetchWithTimeout(url, method = "GET", ms = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { method, signal: controller.signal, redirect: "follow" });
    clearTimeout(id);
    return { ok: res.ok, status: res.status, text: method === "GET" ? await res.text() : "" };
  } catch (e) {
    clearTimeout(id);
    return { ok: false, status: e.name === "AbortError" ? "TIMEOUT" : "ERROR", text: "" };
  }
}

// ─── COLOURS ─────────────────────────────────────────────────────────────────
const c = {
  reset:  "\x1b[0m",
  green:  "\x1b[32m",
  red:    "\x1b[31m",
  yellow: "\x1b[33m",
  cyan:   "\x1b[36m",
  dim:    "\x1b[2m",
  bold:   "\x1b[1m",
};
const ok    = (s) => `${c.green}✓${c.reset} ${s}`;
const fail  = (s) => `${c.red}✗${c.reset} ${s}`;
const warn  = (s) => `${c.yellow}⚠${c.reset} ${s}`;
const info  = (s) => `${c.cyan}→${c.reset} ${s}`;

// ─── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
  if (!fs.existsSync(OUT_DIR)) {
    console.error(fail(`out/ directory not found. Run ${c.bold}npm run build${c.reset} first.`));
    process.exit(1);
  }

  console.log(`\n${c.bold}anuva.blog — link sanity check${c.reset}`);
  console.log(c.dim + "─".repeat(50) + c.reset);

  const { server, base } = await startServer();
  console.log(info(`Local server: ${base}`));
  console.log(info(`External link checks: ${CHECK_EXTERNAL ? "on" : "off (pass --external to enable)"}\n`));

  const visited   = new Set();   // URLs we've fetched
  const queue     = [base + "/"];
  const broken    = [];          // { url, status, foundOn }
  const pages     = [];          // internal HTML pages checked
  const assets    = new Set();   // non-HTML resources checked

  while (queue.length > 0) {
    const url = queue.shift();
    if (visited.has(url)) continue;
    visited.add(url);

    const isInternal = url.startsWith(base);
    const isExternal = !isInternal;

    // Skip non-HTTP
    if (!url.startsWith("http")) continue;

    // External links: just HEAD-check, don't crawl
    if (isExternal) {
      if (!CHECK_EXTERNAL) continue;
      if (assets.has(url)) continue;
      assets.add(url);
      const r = await fetchWithTimeout(url, "HEAD");
      if (!r.ok) {
        broken.push({ url, status: r.status, foundOn: "external" });
        process.stdout.write(fail(`${r.status}  ${url}\n`));
      }
      continue;
    }

    // Internal: fetch and parse
    const r = await fetchWithTimeout(url, "GET");

    if (!r.ok) {
      broken.push({ url, status: r.status, foundOn: "crawl" });
      process.stdout.write(fail(`${r.status}  ${url}\n`));
      continue;
    }

    const isHtml = r.text.trimStart().startsWith("<!") || r.text.includes("<html");

    if (isHtml) {
      pages.push(url);
      process.stdout.write(ok(`${url}\n`));
      const links = extractLinks(r.text, url);
      for (const link of links) {
        // Normalise internal links to strip base
        const clean = link.startsWith(base) ? link : link;
        if (!visited.has(clean)) queue.push(clean);
      }
    } else {
      assets.add(url);
    }
  }

  server.close();

  // ─── REPORT ────────────────────────────────────────────────────────────────
  console.log("\n" + c.dim + "─".repeat(50) + c.reset);
  console.log(`${c.bold}Summary${c.reset}`);
  console.log(`  Pages crawled  : ${c.green}${pages.length}${c.reset}`);
  console.log(`  Assets checked : ${c.green}${assets.size}${c.reset}`);
  console.log(`  Broken links   : ${broken.length > 0 ? c.red : c.green}${broken.length}${c.reset}`);

  if (broken.length > 0) {
    console.log(`\n${c.bold}${c.red}Broken links:${c.reset}`);
    for (const b of broken) {
      console.log(`  ${c.red}${b.status}${c.reset}  ${b.url}`);
    }
    console.log();
    process.exit(1);
  } else {
    console.log(`\n${c.green}${c.bold}All links OK.${c.reset}\n`);
    process.exit(0);
  }
}

main().catch((e) => {
  console.error(fail("Unexpected error: " + e.message));
  process.exit(1);
});
