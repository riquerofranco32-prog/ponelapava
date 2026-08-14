#!/usr/bin/env node
/**
 * hero-clip-check.mjs — verificación medida del recorte de tinta en el H1 del hero.
 *
 * Hermano de optical-check.mjs y lcp-check.mjs: CDP crudo sobre el WebSocket
 * nativo de Node (requiere Node >= 22), cero dependencias, Chrome real headless.
 *
 * Existe porque el titular del hero se arma con un reveal línea por línea, y
 * cada línea vive dentro de un `overflow-hidden` cuya caja es exactamente el
 * line-box. Si el line-height queda por debajo de la caja de contenido de la
 * fuente (Playfair Display mide 1.33em: ascent 1.081 + descent 0.25), el
 * half-leading se vuelve negativo y la tinta sobresale de la caja que recorta:
 * los descendentes se cortan con una línea horizontal limpia. Este script mide
 * ese margen en px en vez de mirarlo a ojo.
 *
 * Qué reporta, por viewport:
 *   - font-size, line-height, letter-spacing y métricas reales de la fuente
 *     (ascent/descent del font y tinta real de la última línea, vía canvas).
 *   - half-leading, aire bajo la baseline y recorte resultante, en px.
 *   - overflow / height / clip-path / contain de toda la cadena de ancestros,
 *     para poder afirmar cuál es el contenedor que recorta.
 *   - capturas del H1 durante y después de la animación de entrada, más un A/B
 *     con `overflow: visible` forzado en vivo (solo en memoria; no toca el sitio).
 *
 * Uso:
 *   node scripts/hero-clip-check.mjs --base http://localhost:3000 --label despues
 *   node scripts/hero-clip-check.mjs --base https://ponelapava.vercel.app --label antes
 *
 * Flags:
 *   --base   URL base a medir (default: http://localhost:3000)
 *   --label  nombre de la corrida; agrupa en .optical-check/<label>/hero-clip/
 *   --vp     medir un solo viewport (mobile-390 | tablet-768 | laptop-1024 | desktop-1440)
 *   --out    directorio de salida (default: .optical-check, gitignoreado)
 *   Chrome se busca en las rutas estándar de Windows; override: env CHROME_PATH.
 *
 * Nota: tablet-768 corre con DPR 1. Con DPR 2 el renderer headless se cuelga de
 * forma reproducible al capturar; el DPR no afecta ninguna métrica de layout.
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
const LABEL = arg("label", "run");
const OUT = join(process.cwd(), arg("out", ".optical-check"), LABEL, "hero-clip");

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
  // Con timeout: una captura sobre un <video> reproduciéndose puede no
  // contestar nunca, y sin esto el proceso queda colgado sin decir nada.
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

// ── Lanzar Chrome y conectar ─────────────────────────────────────
const profile = mkdtempSync(join(tmpdir(), "hero-clip-"));
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

async function shot(name, dir, rect, pad, scale) {
  try {
    const { data } = await cdp.send(
      "Page.captureScreenshot",
      {
        format: "png",
        clip: {
          x: Math.max(0, rect.x - 8),
          y: Math.max(0, rect.y - pad),
          width: rect.w + 16,
          height: rect.h + pad * 2,
          scale,
        },
      },
      sessionId,
    );
    const file = join(dir, name + ".png");
    writeFileSync(file, Buffer.from(data, "base64"));
    console.log(`  [shot] ${file}`);
  } catch (e) {
    console.log(`  [shot] ${name}: ${e.message}`);
  }
}

// ── La sonda, que corre dentro de la página ──────────────────────
const PROBE = `
(() => {
  const h1 = document.querySelector('section#inicio h1');
  if (!h1) return { error: 'no encontré section#inicio h1' };

  const wrappers = [...h1.children];
  const lastWrap = wrappers.find(w => /tuyo/.test(w.textContent)) || wrappers.at(-1);
  const lastInner = lastWrap.firstElementChild || lastWrap;

  const box = (el) => {
    const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
    return {
      tag: el.tagName.toLowerCase(),
      cls: (el.className || '').toString().replace(/\\s+/g,' ').trim().slice(0, 120),
      text: (el.textContent || '').trim().slice(0, 24),
      rect: { x: +r.x.toFixed(2), y: +r.y.toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2), bottom: +r.bottom.toFixed(2) },
      overflow: cs.overflow, overflowX: cs.overflowX, overflowY: cs.overflowY,
      lineHeight: cs.lineHeight, fontSize: cs.fontSize, letterSpacing: cs.letterSpacing,
      fontFamily: cs.fontFamily.slice(0, 70), fontWeight: cs.fontWeight,
      height: cs.height, maxHeight: cs.maxHeight, minHeight: cs.minHeight,
      clipPath: cs.clipPath, mask: cs.maskImage, contain: cs.contain,
      padding: [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].join(' '),
      margin: [cs.marginTop, cs.marginRight, cs.marginBottom, cs.marginLeft].join(' '),
      display: cs.display, position: cs.position, transform: cs.transform,
      scrollH: el.scrollHeight, clientH: el.clientHeight,
    };
  };

  const chain = [];
  let el = lastInner;
  while (el) { chain.push(box(el)); if (el.id === 'inicio') break; el = el.parentElement; }

  const cs = getComputedStyle(lastInner);
  const fontShorthand = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + '/' + cs.lineHeight + ' ' + cs.fontFamily;
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.font = fontShorthand;
  const txt = lastInner.textContent.trim();
  const measured = ctx.measureText(txt);
  const yOnly = ctx.measureText('y');
  const fontPx = parseFloat(cs.fontSize);
  const lhPx = parseFloat(cs.lineHeight);

  const fm = {
    resolvedFont: ctx.font,
    fontSizePx: fontPx,
    lineHeightPx: lhPx,
    lineHeightRatio: +(lhPx / fontPx).toFixed(4),
    fontBoundingBoxAscent: measured.fontBoundingBoxAscent,
    fontBoundingBoxDescent: measured.fontBoundingBoxDescent,
    contentAreaPx: measured.fontBoundingBoxAscent + measured.fontBoundingBoxDescent,
    contentAreaEm: +((measured.fontBoundingBoxAscent + measured.fontBoundingBoxDescent) / fontPx).toFixed(4),
    inkAscent: +measured.actualBoundingBoxAscent.toFixed(2),
    inkDescent: +measured.actualBoundingBoxDescent.toFixed(2),
    inkDescent_y: +yOnly.actualBoundingBoxDescent.toFixed(2),
    inkDescentEm_y: +(yOnly.actualBoundingBoxDescent / fontPx).toFixed(4),
  };

  // El hijo puede llevar padding-bottom (es parte del arreglo del recorte):
  // la baseline se cuenta desde el borde superior de su caja de contenido.
  const padTop = parseFloat(cs.paddingTop) || 0;
  const halfLeading = (lhPx - fm.contentAreaPx) / 2;
  const innerRect = lastInner.getBoundingClientRect();
  const wrapRect = lastWrap.getBoundingClientRect();
  const baselineY = innerRect.top + padTop + halfLeading + fm.fontBoundingBoxAscent;
  const inkBottomY = baselineY + fm.inkDescent;
  const clipEdgeY = wrapRect.bottom;

  const geom = {
    halfLeadingPx: +halfLeading.toFixed(2),
    innerPaddingBottom: cs.paddingBottom,
    wrapperMarginBottom: getComputedStyle(lastWrap).marginBottom,
    baselineY: +baselineY.toFixed(2),
    baselineToClipEdgePx: +(clipEdgeY - baselineY).toFixed(2),
    inkDescentBelowBaselinePx: +fm.inkDescent.toFixed(2),
    recorteEnPx: +(inkBottomY - clipEdgeY).toFixed(2),   // > 0 => se corta
  };

  const hr = h1.getBoundingClientRect();
  const sig = h1.nextElementSibling?.getBoundingClientRect();
  const lr = lastWrap.getBoundingClientRect();
  return {
    chain, fm, geom,
    overflowProof: { wrapper_scrollHeight: lastWrap.scrollHeight, wrapper_clientHeight: lastWrap.clientHeight },
    h1Alto: +hr.height.toFixed(2),
    topeDelBloqueSiguiente: sig ? +sig.top.toFixed(2) : null,
    h1Rect: { x: hr.x + scrollX, y: hr.y + scrollY, w: hr.width, h: hr.height },
    lastLineRect: { x: lr.x + scrollX, y: lr.y + scrollY, w: lr.width, h: lr.height },
    fontsStatus: document.fonts.status,
  };
})()
`;

// A/B en vivo, solo en memoria: saca el recorte para mostrar la tinta que falta.
const UNCLIP = `
(() => {
  const h1 = document.querySelector('section#inicio h1');
  [...h1.children].forEach(w => { w.style.overflow = 'visible'; });
  return true;
})()
`;

const ONLY = arg("vp", null);
const VIEWPORTS = [
  { name: "mobile-390", width: 390, height: 844, dsf: 2, mobile: true },
  // DPR 1 a propósito: con DPR 2 el renderer headless se cuelga al capturar.
  { name: "tablet-768", width: 768, height: 1024, dsf: 1, mobile: true },
  { name: "laptop-1024", width: 1024, height: 768, dsf: 1, mobile: false },
  { name: "desktop-1440", width: 1440, height: 900, dsf: 1, mobile: false },
].filter((v) => !ONLY || v.name === ONLY);

const report = { base: BASE, label: LABEL, viewports: {} };

try {
  for (const vp of VIEWPORTS) {
    console.log(`\n== ${vp.name} (${vp.width}×${vp.height}) — ${BASE} ==`);
    const dir = join(OUT, vp.name);
    mkdirSync(dir, { recursive: true });
    await cdp.send(
      "Emulation.setDeviceMetricsOverride",
      { width: vp.width, height: vp.height, deviceScaleFactor: vp.dsf, mobile: vp.mobile },
      sessionId,
    );

    // Cache-buster por viewport: si no, el segundo pasa por bfcache y el
    // reveal no vuelve a correr, y la captura "durante" sale ya terminada.
    const loaded = cdp.next("Page.loadEventFired", sessionId).catch(() => {});
    await cdp.send("Page.navigate", { url: BASE + "/?vp=" + vp.width }, sessionId);
    await loaded;

    // Durante la animación: la última línea arranca con delay-400 y dura 700ms.
    await sleep(380);
    const during = await evaluate(PROBE);
    if (during.error) {
      console.log("  " + during.error);
      continue;
    }
    const pad = Math.round(during.fm.fontSizePx * 0.45);
    await shot("h1-durante-animacion", dir, during.h1Rect, pad, vp.dsf);

    // Después de la animación.
    await sleep(2600);
    // Los <video> de fondo cuelgan Page.captureScreenshot en headless.
    await evaluate(`document.querySelectorAll('video').forEach(v => { try { v.pause(); } catch {} })`);
    const after = await evaluate(PROBE);
    await shot("h1-despues-animacion", dir, after.h1Rect, pad, vp.dsf);
    await shot("ultima-linea-antes", dir, { ...after.lastLineRect, h: after.lastLineRect.h + pad }, 0, vp.dsf);

    // A/B: sin el recorte, para ver la tinta que se estaba comiendo.
    await evaluate(UNCLIP);
    await sleep(150);
    await shot("ultima-linea-sin-recorte", dir, { ...after.lastLineRect, h: after.lastLineRect.h + pad }, 0, vp.dsf);

    const g = after.geom, f = after.fm;
    console.log(`  fuente resuelta       ${f.resolvedFont}`);
    console.log(`  font-size             ${f.fontSizePx}px   letter-spacing ${after.chain[0].letterSpacing}`);
    console.log(`  line-height           ${f.lineHeightPx}px  (${f.lineHeightRatio} em)`);
    console.log(`  caja de contenido     ${f.contentAreaPx.toFixed(2)}px (${f.contentAreaEm} em)  asc ${f.fontBoundingBoxAscent.toFixed(2)} / desc ${f.fontBoundingBoxDescent.toFixed(2)}`);
    console.log(`  half-leading          ${g.halfLeadingPx}px ${g.halfLeadingPx < 0 ? "(negativo: la tinta sale de la caja de línea)" : ""}`);
    console.log(`  padding-bottom hijo   ${g.innerPaddingBottom}   margin-bottom wrapper ${g.wrapperMarginBottom}`);
    console.log(`  baseline → borde      ${g.baselineToClipEdgePx}px de aire bajo la baseline`);
    console.log(`  descendente real      ${g.inkDescentBelowBaselinePx}px ("y" sola: ${f.inkDescent_y}px = ${f.inkDescentEm_y} em)`);
    console.log(`  >>> RECORTE           ${g.recorteEnPx}px ${g.recorteEnPx > 0.5 ? "*** SE CORTA ***" : "(sin recorte)"}`);
    console.log(`  wrapper scroll/client ${after.overflowProof.wrapper_scrollHeight} / ${after.overflowProof.wrapper_clientHeight}`);
    console.log(`  alto del H1           ${after.h1Alto}px   tope del bloque siguiente ${after.topeDelBloqueSiguiente}`);
    console.log(`  recorte durante la animación: ${during.geom.recorteEnPx}px (la línea está trasladada; se informa para descartar que el corte sea de la animación)`);
    console.log(`  --- cadena de ancestros ---`);
    for (const c of after.chain) {
      console.log(`   <${c.tag}> ${c.text ? '"' + c.text + '" ' : ""}${c.overflow !== "visible" ? "overflow:" + c.overflow + "  " : ""}h=${c.rect.h} lh=${c.lineHeight} clip=${c.clipPath} contain=${c.contain}`);
      console.log(`       .${c.cls}`);
    }

    report.viewports[vp.name] = { during, after };
  }

  mkdirSync(OUT, { recursive: true });
  const jsonFile = join(OUT, "hero-clip.json");
  writeFileSync(jsonFile, JSON.stringify(report, null, 2));
  console.log(`\nJSON: ${jsonFile}`);
} finally {
  ws.close();
  chrome.kill();
  await sleep(300);
  try {
    rmSync(profile, { recursive: true, force: true });
  } catch {}
}
