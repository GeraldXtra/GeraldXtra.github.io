/* Prints the resume to PDF with headless Chrome, twice: public/resume.pdf (dark, the one the
   site links to) and public/resume-light.pdf (light, for printing). Run it with `npm run resume`.

   Nothing to install: Node's own http server serves the repo so the page can load its fonts and
   the Lagos road data, and Node's built in WebSocket talks to Chrome over the DevTools protocol.
   Chrome is found in the usual places, or set CHROME_PATH to a Chrome or Chromium binary. */

import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { readFile, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PAGE = "/resume/resume.html";
const AUTHOR = "Eberechukwu Uchechukwu Gerald";
const TARGETS = [
  /* Older links point at the long file name, so the dark resume is written there too. */
  { theme: "dark", files: ["public/resume.pdf", "public/Eberechukwu-Uchechukwu-Gerald-Resume.pdf"] },
  { theme: "light", files: ["public/resume-light.pdf"] },
];
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
};

function findChrome() {
  const fromEnv = process.env.CHROME_PATH;
  if (fromEnv && existsSync(fromEnv)) return fromEnv;
  const pf = process.env["ProgramFiles"] || "C:\\Program Files";
  const pf86 = process.env["ProgramFiles(x86)"] || "C:\\Program Files (x86)";
  const local = process.env.LOCALAPPDATA || "";
  const candidates = [
    path.join(pf, "Google/Chrome/Application/chrome.exe"),
    path.join(pf86, "Google/Chrome/Application/chrome.exe"),
    path.join(local, "Google/Chrome/Application/chrome.exe"),
    path.join(pf, "Chromium/Application/chrome.exe"),
    path.join(pf, "Microsoft/Edge/Application/msedge.exe"),
    path.join(pf86, "Microsoft/Edge/Application/msedge.exe"),
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ];
  const found = candidates.find((c) => c && existsSync(c));
  if (!found) throw new Error("Chrome was not found. Install Google Chrome or set CHROME_PATH to a Chrome or Chromium binary.");
  return found;
}

/* A small static server for the repo, on a free port on localhost only. */
function serve() {
  return new Promise((resolve, reject) => {
    const server = createServer(async (req, res) => {
      try {
        const url = new URL(req.url, "http://127.0.0.1");
        const rel = decodeURIComponent(url.pathname).replace(/^\/+/, "");
        const file = path.resolve(ROOT, rel);
        if (!file.startsWith(ROOT + path.sep) && file !== ROOT) throw new Error("outside the repo");
        const info = await stat(file);
        if (!info.isFile()) throw new Error("not a file");
        const body = await readFile(file);
        res.writeHead(200, { "Content-Type": MIME[path.extname(file).toLowerCase()] || "application/octet-stream", "Content-Length": body.length, "Cache-Control": "no-store" });
        res.end(body);
      } catch {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not found");
      }
    });
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

/* Starts headless Chrome and resolves with its DevTools websocket address. */
function launch(chrome, userDataDir) {
  return new Promise((resolve, reject) => {
    const args = [
      "--headless=new",
      "--remote-debugging-port=0",
      `--user-data-dir=${userDataDir}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-gpu",
      "--disable-extensions",
      "--disable-background-networking",
      "--hide-scrollbars",
      "--force-device-scale-factor=1",
      "about:blank",
    ];
    const child = spawn(chrome, args, { stdio: ["ignore", "ignore", "pipe"], windowsHide: true });
    let err = "";
    let done = false;
    const timer = setTimeout(() => {
      if (done) return;
      done = true;
      child.kill();
      reject(new Error("Chrome did not start within 30 seconds.\n" + err));
    }, 30000);
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk) => {
      err += chunk;
      const m = err.match(/DevTools listening on (ws:\/\/\S+)/);
      if (m && !done) {
        done = true;
        clearTimeout(timer);
        resolve({ child, wsUrl: m[1] });
      }
    });
    child.on("exit", (code) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      reject(new Error(`Chrome exited with code ${code} before it was ready.\n` + err));
    });
  });
}

/* The DevTools protocol over a websocket, just enough for this job. */
function connect(wsUrl) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    const pending = new Map();
    const listeners = [];
    let id = 0;
    ws.addEventListener("open", () => resolve(client));
    ws.addEventListener("error", (e) => reject(new Error("DevTools websocket failed: " + (e.message || e.type))));
    ws.addEventListener("message", (e) => {
      const msg = JSON.parse(e.data);
      if (msg.id && pending.has(msg.id)) {
        const { resolve: ok, reject: no } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) no(new Error(msg.error.message + (msg.error.data ? " " + msg.error.data : "")));
        else ok(msg.result);
      } else if (msg.method) {
        listeners.forEach((fn) => fn(msg));
      }
    });
    const client = {
      send(method, params = {}, sessionId) {
        return new Promise((ok, no) => {
          const msgId = ++id;
          pending.set(msgId, { resolve: ok, reject: no });
          ws.send(JSON.stringify({ id: msgId, method, params, sessionId }));
        });
      },
      /* Resolves the first time the named event arrives for this session. */
      once(method, sessionId) {
        return new Promise((ok) => {
          const fn = (msg) => {
            if (msg.method === method && (!sessionId || msg.sessionId === sessionId)) {
              listeners.splice(listeners.indexOf(fn), 1);
              ok(msg.params);
            }
          };
          listeners.push(fn);
        });
      },
      close() {
        ws.close();
      },
    };
  });
}

/* Chrome writes the document title into the PDF but not the author. This appends an
   incremental update that replaces the Info dictionary, which is how PDF files are meant
   to be amended, so everything Chrome wrote stays byte for byte as it was. */
function setAuthor(pdf, author) {
  const text = pdf.toString("latin1");
  const trailer = text.lastIndexOf("trailer");
  const startxref = text.lastIndexOf("startxref");
  if (trailer < 0 || startxref < 0) return pdf;
  const trailerDict = text.slice(trailer, startxref);
  const info = /\/Info\s+(\d+)\s+(\d+)\s+R/.exec(trailerDict);
  const root = /\/Root\s+(\d+)\s+(\d+)\s+R/.exec(trailerDict);
  const size = /\/Size\s+(\d+)/.exec(trailerDict);
  const prev = /startxref\s+(\d+)/.exec(text.slice(startxref));
  if (!info || !root || !size || !prev) return pdf;
  const num = info[1];
  const objStart = text.search(new RegExp(`(^|[\\r\\n])${num}\\s+${info[2]}\\s+obj\\b`));
  if (objStart < 0) return pdf;
  const dictStart = text.indexOf("<<", objStart);
  const dictEnd = text.indexOf(">>", dictStart);
  if (dictStart < 0 || dictEnd < 0) return pdf;
  let dict = text.slice(dictStart + 2, dictEnd);
  if (/\/Author\b/.test(dict)) return pdf;
  const escaped = author.replace(/([\\()])/g, "\\$1");
  dict = dict.trimEnd() + ` /Author (${escaped}) `;
  const objText = `${num} ${info[2]} obj\n<<${dict}>>\nendobj\n`;
  const base = pdf.length + 1;
  const update =
    `\n${objText}` +
    `xref\n0 1\n0000000000 65535 f \n${num} 1\n${String(base).padStart(10, "0")} 00000 n \n` +
    `trailer\n<< /Size ${size[1]} /Root ${root[1]} ${root[2]} R /Info ${num} ${info[2]} R /Prev ${prev[1]} >>\n` +
    `startxref\n${base + objText.length}\n%%EOF\n`;
  return Buffer.concat([pdf, Buffer.from(update, "latin1")]);
}

function countPages(pdf) {
  const m = pdf.toString("latin1").match(/\/Type\s*\/Page\b(?!s)/g);
  return m ? m.length : 0;
}

async function printOne(cdp, url, theme) {
  const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
  await cdp.send("Page.enable", {}, sessionId);
  await cdp.send("Runtime.enable", {}, sessionId);
  const loaded = cdp.once("Page.loadEventFired", sessionId);
  await cdp.send("Page.navigate", { url: `${url}?theme=${theme}` }, sessionId);
  await loaded;
  /* The page resolves this once its fonts are loaded and the map is drawn. */
  const ready = await cdp.send(
    "Runtime.evaluate",
    { expression: "window.__resumeReady", awaitPromise: true, returnByValue: true },
    sessionId,
  );
  const state = (ready.result && ready.result.value) || {};
  if (!state.map) throw new Error(`The Lagos map did not draw for the ${theme} version. Is public/lagos-roads.json in place?`);
  const fontsOk = await cdp.send(
    "Runtime.evaluate",
    { expression: "document.fonts.check('750 1em Archivo') && document.fonts.status === 'loaded'", returnByValue: true },
    sessionId,
  );
  if (!(fontsOk.result && fontsOk.result.value)) throw new Error("Archivo did not load. Check resume/fonts.");
  const { data } = await cdp.send(
    "Page.printToPDF",
    { printBackground: true, preferCSSPageSize: true, displayHeaderFooter: false, transferMode: "ReturnAsBase64" },
    sessionId,
  );
  await cdp.send("Target.closeTarget", { targetId });
  return Buffer.from(data, "base64");
}

async function main() {
  const chrome = findChrome();
  const server = await serve();
  const port = server.address().port;
  const userDataDir = mkdtempSync(path.join(tmpdir(), "resume-chrome-"));
  let child = null;
  let cdp = null;
  try {
    const launched = await launch(chrome, userDataDir);
    child = launched.child;
    cdp = await connect(launched.wsUrl);
    for (const target of TARGETS) {
      let pdf = await printOne(cdp, `http://127.0.0.1:${port}${PAGE}`, target.theme);
      pdf = setAuthor(pdf, AUTHOR);
      const pages = countPages(pdf);
      if (pages !== 1) throw new Error(`The ${target.theme} resume came out as ${pages} pages; it has to be one. Trim the content or the spacing in resume/resume.css.`);
      for (const file of target.files) {
        await writeFile(path.join(ROOT, file), pdf);
        console.log(`wrote ${file} (${Math.round(pdf.length / 1024)} KB, 1 page, ${target.theme})`);
      }
    }
  } finally {
    if (cdp) {
      try {
        await cdp.send("Browser.close");
      } catch {
        /* already gone */
      }
      cdp.close();
    }
    if (child) {
      await new Promise((resolve) => {
        if (child.exitCode !== null) return resolve();
        const t = setTimeout(() => {
          child.kill();
          resolve();
        }, 3000);
        child.on("exit", () => {
          clearTimeout(t);
          resolve();
        });
      });
    }
    server.close();
    try {
      rmSync(userDataDir, { recursive: true, force: true, maxRetries: 6, retryDelay: 300 });
    } catch {
      /* Chrome can hold its profile open a moment longer; a leftover temp folder is harmless. */
    }
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
