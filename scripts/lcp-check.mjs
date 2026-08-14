#!/usr/bin/env node
/**
 * lcp-check.mjs — medición de carga de la home: LCP, FCP y bytes por tipo.
 *
 * Hermano de optical-check.mjs: mismo enfoque (CDP crudo, cero dependencias,
 * Node >= 22, Chrome real headless), pero mide peso y tiempos en vez de
 * geometría.
 *
 * Corre dos perfiles sobre la misma URL:
 *   · "4g"  — default móvil de Lighthouse (Slow 4G): 1,6 Mbit/s bajada,
 *             750 Kbit/s subida, 150 ms RTT, CPU ×4, 390×844 DPR 2.
 *             Esta es la cifra que gobierna: el objetivo del proyecto es
 *             LCP < 2500 ms en este perfil.
 *   · "piso" — sin throttling, como referencia de lo que aporta la red.
 *
 * Cada perfil se corre --runs veces (default 2) para descartar ruido; se
 * reporta la mediana y el rango. La caché se deshabilita siempre: lo que se
 * mide es la primera visita.
 *
 * Uso:
 *   node scripts/lcp-check.mjs --base http://localhost:3000 --label antes
 *   node scripts/lcp-check.mjs --base https://ponelapava.vercel.app --label despues
 *
 * Flags:
 *   --base   URL base a medir (default: http://localhost:3000)
 *   --path   ruta dentro del sitio (default: /)
 *   --label  nombre de la corrida; agrupa salidas en .optical-check/<label>/
 *   --runs   corridas por perfil (default: 2)
 *   --out    directorio de salida (default: .optical-check, gitignoreado)
 *   Chrome se busca en las rutas estándar de Windows; override: env CHROME_PATH.
 *
 * Salida: tabla por consola + .optical-check/<label>/lcp.json con el detalle
 * de cada corrida (incluido el listado completo de recursos y sus bytes).
 */
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// ── CLI ──────────────────────────────────────────────────────────
const arg = (name, def) => {
  const i = process.argv.indexOf("--" + name);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : def;
};
const BASE = arg("base", "http://localhost:3000").replace(/\/$/, "");
const PATH = arg("path", "/");
const LABEL = arg("label", "run");
const RUNS = Number(arg("runs", "2"));
const OUT = join(process.cwd(), arg("out", ".optical-check"), LABEL);
const URL_ = BASE + PATH;

const CHROME =
  process.env.CHROME_PATH ||
  [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  ].find(existsSync);
if (!CHROME) {
  console.error("No encontré Chrome. Seteá CHROME_PATH.");
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Perfiles de red ──────────────────────────────────────────────
// El settle es fijo a propósito: comparar "antes" y "después" exige la misma
// ventana de tiempo en las dos puntas, no un corte por evento que se mueve.
const PERFILES = [
  {
    id: "4g",
    nombre: "Slow 4G + CPU ×4 (perfil móvil Lighthouse)",
    red: {
      offline: false,
      latency: 150,
      downloadThroughput: (1.6 * 1024 * 1024) / 8,
      uploadThroughput: (750 * 1024) / 8,
    },
    cpu: 4,
    settle: 35000,
  },
  { id: "piso", nombre: "sin throttling (piso)", red: null, cpu: 1, settle: 12000 },
];

// ── Cliente CDP mínimo ───────────────────────────────────────────
class CDP {
  constructor(ws) {
    this.ws = ws;
    this.seq = 0;
    this.pending = new Map();
    this.listeners = new Set();
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(`${msg.error.message} (${msg.error.code})`));
        else resolve(msg.result);
      } else if (msg.method) {
        for (const l of this.listeners) l(msg);
      }
    };
  }
  send(method, params = {}, sessionId) {
    return new Promise((resolve, reject) => {
      const id = ++this.seq;
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
  }
  on(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
}

// ── Una corrida ──────────────────────────────────────────────────
async function correr(perfil, nro) {
  const profile = mkdtempSync(join(tmpdir(), "lcp-check-"));
  const chrome = spawn(
    CHROME,
    [
      "--headless=new",
      "--remote-debugging-port=0",
      `--user-data-dir=${profile}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-features=Translate",
      "--hide-scrollbars",
      // Sin esto el <video autoplay muted> no arranca en headless y los bytes
      // del video no aparecerían en la medición.
      "--autoplay-policy=no-user-gesture-required",
      "--window-size=390,844",
      "about:blank",
    ],
    { stdio: "ignore" },
  );

  let wsUrl;
  for (let i = 0; i < 150; i++) {
    await sleep(100);
    try {
      const [port, path] = readFileSync(join(profile, "DevToolsActivePort"), "utf8").split("\n");
      if (port && path) {
        wsUrl = `ws://127.0.0.1:${port.trim()}${path.trim()}`;
        break;
      }
    } catch {}
  }
  if (!wsUrl) throw new Error("Chrome no expuso el puerto de DevTools");

  const ws = new WebSocket(wsUrl);
  await new Promise((res, rej) => ((ws.onopen = res), (ws.onerror = rej)));
  const cdp = new CDP(ws);

  const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
  await cdp.send("Page.enable", {}, sessionId);
  await cdp.send("Runtime.enable", {}, sessionId);
  await cdp.send("Network.enable", {}, sessionId);
  await cdp.send(
    "Emulation.setDeviceMetricsOverride",
    { width: 390, height: 844, deviceScaleFactor: 2, mobile: true },
    sessionId,
  );
  if (perfil.red) await cdp.send("Network.emulateNetworkConditions", perfil.red, sessionId);
  if (perfil.cpu > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate: perfil.cpu }, sessionId);
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true }, sessionId);

  // Bytes reales sobre el cable: encodedDataLength incluye headers y ya viene
  // comprimido, así que es lo que efectivamente paga el usuario.
  const pedidos = new Map();
  const recursos = [];
  cdp.on((msg) => {
    if (msg.sessionId !== sessionId) return;
    if (msg.method === "Network.requestWillBeSent")
      pedidos.set(msg.params.requestId, { url: msg.params.request.url, tipo: msg.params.type });
    if (msg.method === "Network.responseReceived") {
      const r = pedidos.get(msg.params.requestId);
      if (r) r.tipo = msg.params.type || r.tipo;
    }
    if (msg.method === "Network.loadingFinished") {
      const r = pedidos.get(msg.params.requestId);
      if (r) recursos.push({ ...r, bytes: msg.params.encodedDataLength });
    }
  });

  // El observador tiene que existir antes de navegar o se pierden las
  // entradas tempranas de paint.
  await cdp.send(
    "Page.addScriptToEvaluateOnNewDocument",
    {
      source: `
        window.__perf = { lcp: null, lcpEl: null, lcpSize: null, fcp: null };
        new PerformanceObserver((list) => {
          for (const e of list.getEntries()) {
            window.__perf.lcp = e.startTime;
            window.__perf.lcpSize = e.size;
            window.__perf.lcpEl = e.element
              ? e.element.tagName +
                (e.element.id ? "#" + e.element.id : "") +
                (e.element.className ? "." + String(e.element.className).split(" ")[0] : "") +
                (e.element.currentSrc ? " src=" + e.element.currentSrc.split("/").pop() : "")
              : e.url || "(sin elemento)";
          }
        }).observe({ type: "largest-contentful-paint", buffered: true });
        new PerformanceObserver((list) => {
          for (const e of list.getEntries())
            if (e.name === "first-contentful-paint") window.__perf.fcp = e.startTime;
        }).observe({ type: "paint", buffered: true });
      `,
    },
    sessionId,
  );

  await cdp.send("Page.navigate", { url: URL_ }, sessionId);
  await sleep(perfil.settle);

  const { result } = await cdp.send(
    "Runtime.evaluate",
    {
      expression: `(() => {
        const n = performance.getEntriesByType("navigation")[0] || {};
        return { ...window.__perf, ttfb: n.responseStart, dcl: n.domContentLoadedEventEnd, load: n.loadEventEnd };
      })()`,
      returnByValue: true,
    },
    sessionId,
  );

  ws.close();
  chrome.kill();
  await sleep(300);
  try {
    rmSync(profile, { recursive: true, force: true });
  } catch {}

  return { perfil: perfil.id, nro, perf: result.value, recursos };
}

// ── Agregación y salida ──────────────────────────────────────────
const mediana = (xs) => {
  const s = xs.filter((x) => x != null).sort((a, b) => a - b);
  if (!s.length) return null;
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const ms = (v) => (v == null ? "—" : Math.round(v) + " ms");
const kb = (v) => (v / 1024).toFixed(0) + " KB";
const porTipo = (recursos) => {
  const acc = {};
  for (const r of recursos) acc[r.tipo] = (acc[r.tipo] || 0) + r.bytes;
  return acc;
};

mkdirSync(OUT, { recursive: true });
console.log(`\nlcp-check — ${URL_}`);
console.log(`etiqueta: ${LABEL} · ${RUNS} corrida(s) por perfil\n`);

const todo = [];
for (const perfil of PERFILES) {
  const corridas = [];
  for (let i = 1; i <= RUNS; i++) {
    process.stdout.write(`  midiendo ${perfil.id} (${i}/${RUNS})... `);
    const r = await correr(perfil, i);
    corridas.push(r);
    console.log(`LCP ${ms(r.perf.lcp)}`);
  }
  todo.push({ perfil: perfil.id, nombre: perfil.nombre, corridas });

  const lcps = corridas.map((c) => c.perf.lcp);
  const totales = corridas.map((c) => c.recursos.reduce((a, r) => a + r.bytes, 0));
  const lcpMed = mediana(lcps);

  console.log(`\n===== ${perfil.nombre}`);
  console.log(
    `  TTFB ${ms(mediana(corridas.map((c) => c.perf.ttfb)))} | ` +
      `FCP ${ms(mediana(corridas.map((c) => c.perf.fcp)))} | ` +
      `DCL ${ms(mediana(corridas.map((c) => c.perf.dcl)))} | ` +
      `load ${ms(mediana(corridas.map((c) => c.perf.load)))}`,
  );
  console.log(
    `  LCP  ${ms(lcpMed)} (mediana de ${RUNS}; rango ${ms(Math.min(...lcps))}–${ms(Math.max(...lcps))})` +
      (perfil.id === "4g" ? `  ${lcpMed > 2500 ? "← FALLA el objetivo de 2500 ms" : "← dentro de 2500 ms"}` : ""),
  );
  console.log(`  elemento LCP: ${corridas[0].perf.lcpEl}  (${corridas[0].perf.lcpSize} px²)`);
  console.log(`  transferencia: ${(mediana(totales) / 1024 / 1024).toFixed(2)} MB en ${corridas[0].recursos.length} pedidos`);
  for (const [tipo, v] of Object.entries(porTipo(corridas[0].recursos)).sort((a, b) => b[1] - a[1]))
    console.log(`     ${tipo.padEnd(12)} ${kb(v).padStart(9)}`);
  console.log(`  recursos más pesados:`);
  for (const r of [...corridas[0].recursos].sort((a, b) => b.bytes - a.bytes).slice(0, 6))
    console.log(`     ${kb(r.bytes).padStart(9)}  ${r.tipo.padEnd(10)} ${r.url.split("/").pop().slice(0, 56)}`);
  console.log("");
}

const destino = join(OUT, "lcp.json");
writeFileSync(destino, JSON.stringify({ url: URL_, label: LABEL, runs: RUNS, perfiles: todo }, null, 2));
console.log(`JSON: ${destino}\n`);
