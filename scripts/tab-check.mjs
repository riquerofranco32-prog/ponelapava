#!/usr/bin/env node
/**
 * tab-check.mjs — recorrido de foco de teclado, medido.
 *
 * Hermano de optical-check.mjs y lcp-check.mjs: CDP crudo sobre el WebSocket
 * nativo de Node (requiere Node >= 22), cero dependencias, Chrome real headless.
 *
 * Recorre la página con Tab REAL (Input.dispatchKeyEvent). Importa que sea Tab
 * real y no `el.focus()` de script: `:focus-visible` depende de la modalidad de
 * interacción, y con `.focus()` programático el resultado no es confiable —
 * medir así daba lecturas contradictorias entre corridas.
 *
 * En cada parada reporta:
 *   - si el anillo de foco existe (outline-style / width) y si la parada matchea
 *     :focus-visible.
 *   - el contraste del anillo contra el fondo compuesto de atrás. Se calcula
 *     componiendo el color declarado con su alpha contra la pila de fondos de
 *     los ancestros (cualquier notación: rgba, lab(), oklch(), color-mix). No se
 *     mide sobre texto encima de imagen/video/gradiente: eso se marca aparte.
 *   - si el anillo se recorta contra un ancestro con overflow != visible, y
 *     cuántos px se come.
 *   - si el border-radius propio del control queda pisado al enfocarlo. La regla
 *     `:focus-visible` de globals.css va sin capa a propósito (así le gana a los
 *     `focus:outline-none` sueltos), y por eso mismo cualquier propiedad de más
 *     que lleve pisa a las utilidades: este chequeo es la red para eso.
 *
 * Uso:
 *   node scripts/tab-check.mjs --base http://localhost:3000 --path /catalogo
 *   node scripts/tab-check.mjs --base https://ponelapava.vercel.app --vp mobile-390 --n 30
 *
 * Flags:
 *   --base   URL base a medir (default: http://localhost:3000)
 *   --path   ruta a recorrer (default: /)
 *   --vp     desktop-1440 (default) | mobile-390
 *   --n      cuántas paradas de Tab recorrer (default: 30)
 *   --label  nombre de la corrida; agrupa en .optical-check/<label>/tab/
 *   --out    directorio de salida (default: .optical-check, gitignoreado)
 *   Chrome se busca en las rutas estándar de Windows; override: env CHROME_PATH.
 *
 * Sale con código 1 si encuentra alguna parada con problema, para poder usarlo
 * como gate.
 */
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync, readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const arg = (name, def) => {
  const i = process.argv.indexOf("--" + name);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : def;
};
const BASE = arg("base", "http://localhost:3000").replace(/\/$/, "");
const PATH = arg("path", "/");
const NAME = arg("vp", "desktop-1440");
const N = +arg("n", "30");
const LABEL = arg("label", "run");
const OUT = join(
  process.cwd(),
  arg("out", ".optical-check"),
  LABEL,
  "tab",
  NAME + (PATH === "/" ? "_home" : PATH.replace(/\//g, "_")),
);

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
  send(method, params = {}, sessionId, timeoutMs = 30000) {
    return new Promise((resolve, reject) => {
      const id = ++this.seq;
      const t = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error("timeout CDP " + method));
      }, timeoutMs);
      this.pending.set(id, {
        resolve: (v) => { clearTimeout(t); resolve(v); },
        reject: (e) => { clearTimeout(t); reject(e); },
      });
      this.ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
  }
  next(method, sessionId, timeoutMs = 45000) {
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => {
        this.listeners.delete(fn);
        reject(new Error("timeout esperando " + method));
      }, timeoutMs);
      const fn = (msg) => {
        if (msg.method === method && (!sessionId || msg.sessionId === sessionId)) {
          clearTimeout(t);
          this.listeners.delete(fn);
          resolve(msg.params);
        }
      };
      this.listeners.add(fn);
    });
  }
}

const profile = mkdtempSync(join(tmpdir(), "tab-check-"));
const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    "--remote-debugging-port=0",
    `--user-data-dir=${profile}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-features=Translate",
    "--window-size=1440,1000",
    "about:blank",
  ],
  { stdio: "ignore" },
);

let wsUrl;
for (let i = 0; i < 100; i++) {
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

async function evaluate(expression) {
  const { result, exceptionDetails } = await cdp.send(
    "Runtime.evaluate",
    { expression, returnByValue: true, awaitPromise: true },
    sessionId,
  );
  if (exceptionDetails)
    throw new Error("evaluate: " + (exceptionDetails.exception?.description || exceptionDetails.text));
  return result.value;
}
async function tab() {
  for (const type of ["rawKeyDown", "keyUp"])
    await cdp.send(
      "Input.dispatchKeyEvent",
      { type, windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9, key: "Tab", code: "Tab" },
      sessionId,
    );
}
async function shot(name, dir, r, pad, scale) {
  try {
    const { data } = await cdp.send(
      "Page.captureScreenshot",
      {
        format: "png",
        clip: { x: Math.max(0, r.x - pad), y: Math.max(0, r.y - pad), width: r.w + pad * 2, height: r.h + pad * 2, scale },
      },
      sessionId,
    );
    writeFileSync(join(dir, name + ".png"), Buffer.from(data, "base64"));
  } catch (e) {
    console.log(`  [shot] ${name}: ${e.message}`);
  }
}

const ESTADO = `(() => {
  const el = document.activeElement;
  if (!el || el === document.body) return { fin: true };
  const cs = getComputedStyle(el);
  const r = el.getBoundingClientRect();

  // Resuelve cualquier notación de color a rgba pintándola en un canvas: así
  // entran lab(), oklch() y las alphas de las utilidades tipo /65 sin parsear.
  const cv = document.createElement('canvas'); cv.width = cv.height = 1;
  const cx = cv.getContext('2d', { willReadFrequently: true });
  const rgba = (s) => { cx.clearRect(0,0,1,1); cx.fillStyle = s; cx.fillRect(0,0,1,1);
    const d = cx.getImageData(0,0,1,1).data; return [d[0], d[1], d[2], d[3]/255]; };
  const lum = (r,g,b) => { const f = (v) => { v/=255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); };
    return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b); };
  const over = (f,b) => [f[0]*f[3]+b[0]*(1-f[3]), f[1]*f[3]+b[1]*(1-f[3]), f[2]*f[3]+b[2]*(1-f[3]), 1];
  const ratio = (a,b) => { const hi = Math.max(a,b), lo = Math.min(a,b); return (hi+0.05)/(lo+0.05); };

  let bg = null, p = el.parentElement, sobreMedia = false;
  while (p) { const pcs = getComputedStyle(p);
    if (pcs.backgroundImage && pcs.backgroundImage !== 'none') { sobreMedia = true; break; }
    const c = rgba(pcs.backgroundColor);
    if (c[3] > 0) { bg = bg === null ? c : over(bg, c); if (bg[3] >= 0.999) break; }
    p = p.parentElement; }
  if (!bg || bg[3] < 0.999) bg = over(bg || [0,0,0,0], rgba(getComputedStyle(document.body).backgroundColor));

  const ow = parseFloat(cs.outlineWidth) || 0;
  const oc = rgba(cs.outlineColor);
  const contrasteAnillo = (cs.outlineStyle !== 'none' && ow > 0 && !sobreMedia)
    ? +ratio(lum(...over(oc, bg).slice(0,3)), lum(bg[0], bg[1], bg[2])).toFixed(2) : null;

  let recortado = null;
  if (cs.outlineStyle !== 'none' && ow > 0) {
    const g = ow + (parseFloat(cs.outlineOffset) || 0);
    let q = el.parentElement;
    while (q && q !== document.body) { const qcs = getComputedStyle(q);
      if (qcs.overflowX !== 'visible' || qcs.overflowY !== 'visible') {
        const qr = q.getBoundingClientRect();
        const fuera = Math.max(qr.top - (r.top - g), (r.bottom + g) - qr.bottom, qr.left - (r.left - g), (r.right + g) - qr.right);
        if (fuera > 0.5) recortado = { ancestro: q.tagName.toLowerCase() + '.' + (q.className||'').toString().replace(/\\s+/g,'.').slice(0,55), fueraPx: +fuera.toFixed(2) };
        break; }
      q = q.parentElement; }
  }
  return { sel: el.id ? '#'+el.id : el.tagName.toLowerCase() + '.' + (el.className||'').toString().replace(/\\s+/g,'.').slice(0,60),
    texto: ((el.textContent||'').trim() || el.getAttribute('aria-label') || '').slice(0,38),
    focusVisible: el.matches(':focus-visible'), outlineStyle: cs.outlineStyle, outlineWidth: cs.outlineWidth,
    outlineColor: cs.outlineColor, outlineOffset: cs.outlineOffset, borderRadius: cs.borderRadius,
    contrasteAnillo, sobreMedia, recortado,
    caja: [+r.width.toFixed(1), +r.height.toFixed(1)],
    rect: { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) },
    fondo: '#' + bg.slice(0,3).map(v => Math.round(v).toString(16).padStart(2,'0')).join('') };
})()`;

// Radio de cada control SIN foco, para comparar contra el de la parada.
const RADIOS = `(() => { const m = {};
  for (const el of document.querySelectorAll('a[href],button,input,select,textarea')) {
    const k = el.id ? '#'+el.id : el.tagName.toLowerCase() + '.' + (el.className||'').toString().replace(/\\s+/g,'.').slice(0,60);
    if (!(k in m)) m[k] = getComputedStyle(el).borderRadius; }
  return m; })()`;

const VPS = {
  "desktop-1440": { w: 1440, h: 900, d: 1, m: false },
  "mobile-390": { w: 390, h: 844, d: 2, m: true },
};
const vp = VPS[NAME];
if (!vp) {
  console.error(`--vp desconocido: ${NAME}. Usá desktop-1440 o mobile-390.`);
  process.exit(1);
}

let problemas = [];
try {
  mkdirSync(OUT, { recursive: true });
  await cdp.send(
    "Emulation.setDeviceMetricsOverride",
    { width: vp.w, height: vp.h, deviceScaleFactor: vp.d, mobile: vp.m },
    sessionId,
  );
  const l = cdp.next("Page.loadEventFired", sessionId).catch(() => {});
  await cdp.send("Page.navigate", { url: BASE + PATH }, sessionId);
  await l;
  await sleep(2800);
  // Los <video> de fondo cuelgan Page.captureScreenshot en headless.
  await evaluate(`document.querySelectorAll('video').forEach(v => { try { v.pause(); } catch {} })`);
  const radios = await evaluate(RADIOS);

  console.log(`\n== Tab real — ${NAME} ${PATH} — ${BASE} ==`);
  for (let i = 0; i < N; i++) {
    await tab();
    await sleep(130);
    const s = await evaluate(ESTADO);
    if (!s || s.fin) {
      console.log(`  (fin de la cadena de tabulación en la parada ${i})`);
      break;
    }
    const radioSin = radios[s.sel] ?? "?";
    const pisado = radioSin !== "?" && radioSin !== s.borderRadius;
    const sinAnillo = s.outlineStyle === "none" || parseFloat(s.outlineWidth) === 0;
    const flojo = s.contrasteAnillo !== null && s.contrasteAnillo < 3;
    const marca = [
      sinAnillo ? "SIN-ANILLO" : null,
      s.recortado ? `ANILLO RECORTADO ${s.recortado.fueraPx}px por ${s.recortado.ancestro}` : null,
      pisado ? `RADIO PISADO ${radioSin} -> ${s.borderRadius}` : null,
      flojo ? `ANILLO FLOJO ${s.contrasteAnillo}:1` : null,
    ].filter(Boolean);
    console.log(
      `  ${String(i).padStart(2)} ${s.focusVisible ? "fv" : "--"} ${s.outlineStyle} ${s.outlineWidth} off ${s.outlineOffset} | anillo ${s.contrasteAnillo ?? "n/m"}:1 sobre ${s.fondo}${s.sobreMedia ? " (sobre imagen: no medible)" : ""} | radio ${radioSin} → ${s.borderRadius} | ${s.caja.join("×")} "${s.texto}"`,
    );
    if (marca.length) {
      console.log(`       >>> ${marca.join(" · ")}   ${s.sel}`);
      problemas.push({ i, marca, ...s, radioSin });
      if (problemas.length <= 6) await shot(`parada-${i}`, OUT, s.rect, 18, vp.d);
    }
  }
  console.log(`\n  ${problemas.length} paradas con problema`);
  writeFileSync(join(OUT, "tab.json"), JSON.stringify({ base: BASE, path: PATH, vp: NAME, problemas }, null, 2));
  console.log(`  JSON: ${join(OUT, "tab.json")}`);
} finally {
  ws.close();
  chrome.kill();
  await sleep(300);
  try {
    rmSync(profile, { recursive: true, force: true });
  } catch {}
}

process.exit(problemas.length ? 1 : 0);
