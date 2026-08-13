#!/usr/bin/env node
/**
 * optical-check.mjs — verificación óptica medida del sitio público.
 *
 * Mide el border-radius computado (y caja renderizada) de los elementos
 * de interfaz relevantes, y saca capturas de card / botón / chip / drawer
 * en desktop (1440×900) y mobile (390×844, DPR 2).
 *
 * Cero dependencias: habla CDP crudo sobre el WebSocket nativo de Node
 * (requiere Node >= 22) contra un Chrome real headless.
 *
 * Uso:
 *   node scripts/optical-check.mjs --base http://localhost:3000 --label despues
 *   node scripts/optical-check.mjs --base https://ponelapava.vercel.app --label antes
 *
 * Flags:
 *   --base   URL base a medir (default: http://localhost:3000)
 *   --label  nombre de la corrida; agrupa salidas en .optical-check/<label>/
 *   --out    directorio de salida (default: .optical-check, gitignoreado)
 *   Chrome se busca en las rutas estándar de Windows; override: env CHROME_PATH.
 *
 * No escribe nada en el sitio: el ítem que agrega al carrito para abrir el
 * drawer se limpia de localStorage al terminar (no hay backend de carrito).
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
const OUT = join(process.cwd(), arg("out", ".optical-check"), LABEL);

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
        msg.error ? reject(new Error(`${msg.error.message} (${msg.error.code})`)) : resolve(msg.result);
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
  // Devuelve una promesa que resuelve con el próximo evento `method` de la sesión.
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
const profile = mkdtempSync(join(tmpdir(), "optical-check-"));
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

// ── Helpers de página ────────────────────────────────────────────
async function goto(path) {
  const loaded = cdp.next("Page.loadEventFired", sessionId);
  await cdp.send("Page.navigate", { url: BASE + path }, sessionId);
  await loaded;
  await sleep(1500); // settle: fuentes, imágenes lazy, animaciones de entrada
}

async function evaluate(expression) {
  const { result, exceptionDetails } = await cdp.send(
    "Runtime.evaluate",
    { expression, returnByValue: true },
    sessionId,
  );
  if (exceptionDetails) throw new Error("evaluate: " + (exceptionDetails.exception?.description || exceptionDetails.text));
  return result.value;
}

// Serializa la medición de un elemento localizado por una expresión JS.
async function measure(label, expr) {
  const value = await evaluate(`
    (() => {
      const el = (${expr});
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return {
        w: Math.round(r.width * 10) / 10,
        h: Math.round(r.height * 10) / 10,
        radius: {
          tl: cs.borderTopLeftRadius,
          tr: cs.borderTopRightRadius,
          br: cs.borderBottomRightRadius,
          bl: cs.borderBottomLeftRadius,
        },
        overflow: cs.overflow,
      };
    })()
  `);
  return { label, ...(value || { missing: true }) };
}

async function screenshot(name, expr, viewportDir, pad = 16) {
  const rect = await evaluate(`
    (() => {
      const el = (${expr});
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: r.x + scrollX, y: r.y + scrollY, w: r.width, h: r.height };
    })()
  `);
  if (!rect) return console.log(`  [shot] ${name}: elemento no encontrado, salteado`);
  const clip = {
    x: Math.max(0, rect.x - pad),
    y: Math.max(0, rect.y - pad),
    width: rect.w + pad * 2,
    height: rect.h + pad * 2,
    scale: 1,
  };
  const { data } = await cdp.send(
    "Page.captureScreenshot",
    { format: "png", clip, captureBeyondViewport: true },
    sessionId,
  );
  const file = join(viewportDir, name + ".png");
  writeFileSync(file, Buffer.from(data, "base64"));
  console.log(`  [shot] ${file}`);
}

// ── Qué se mide ──────────────────────────────────────────────────
// Cada entrada: label → expresión JS que devuelve el elemento.
const q = (sel) => `document.querySelector(${JSON.stringify(sel)})`;
const PAGES = [
  {
    path: "/",
    items: {
      "cta-hero-solido": q("#hero-cta-catalogo"),
      "cta-hero-outline": q("#hero-cta-local"),
      "cta-destacados": q("#featured-cta"),
      "cta-como-comprar": q("#howtobuy-cta"),
      "cta-navbar": q("#navbar-cta"),
      "banner-categorias": `[...document.querySelectorAll('a[href="/catalogo"]')].find(a => a.className.includes('justify-between'))`,
    },
    shots: { boton: q("#hero-cta-catalogo") },
  },
  {
    path: "/catalogo",
    items: {
      "card-producto-grid": q("article.product-card"),
      "imagen-en-card": q("article.product-card > div.relative"),
      "badge-categoria": q("article.product-card span.uppercase"),
      "boton-card-overlay": q("article.product-card .product-card-btn button"),
      "boton-card-pie": `[...document.querySelectorAll("article.product-card button")].at(-1)`,
      "cartel-agotado-card": q("article.product-card span.bg-pava-cream"),
      "input-busqueda": q("#catalog-search"),
      "select-orden": q("#catalog-sort"),
      "toggle-vista": `document.querySelector('button[aria-label="Vista en grilla"]').parentElement`,
      // Los chips de categoría llevan el conteo "(N)"; el toggle grilla/lista
      // también tiene aria-pressed pero no lo lleva.
      "chip-filtro-activo": `[...document.querySelectorAll('button[aria-pressed="true"]')].find(b => b.textContent.includes("("))`,
      "chip-filtro-inactivo": `[...document.querySelectorAll('button[aria-pressed="false"]')].find(b => b.textContent.includes("("))`,
    },
    shots: {
      card: q("article.product-card"),
      chip: `[...document.querySelectorAll('button[aria-pressed="false"]')].find(b => b.textContent.includes("("))`,
    },
  },
  {
    path: "/producto/1",
    items: {
      "pdp-imagen-principal": q("div.aspect-square"),
      "pdp-tag": q("div.flex.flex-wrap span.bg-pava-cream-dark"),
      "pdp-stepper": q("div.flex.items-center.border-2"),
      "pdp-boton-agregar": `[...document.querySelectorAll("button")].find(b => b.textContent.includes("Agregar al carrito"))`,
      // Por texto: el Navbar (menú mobile, oculto) también tiene un a.bg-whatsapp
      "pdp-cta-whatsapp": `[...document.querySelectorAll("a.bg-whatsapp")].find(a => a.textContent.includes("Consultar"))`,
    },
    shots: {},
  },
  {
    path: "/producto/8", // producto sin stock
    items: {
      "pdp-cartel-agotado": q("div.aspect-square span.bg-pava-cream"),
      "pdp-aviso-sin-stock": q("div.bg-pava-cream-dark.border"),
    },
    shots: {},
  },
];

// Flujo del drawer: agrega 1 ítem (se auto-abre), mide, y después /carrito.
async function drawerAndCartFlow(viewportDir, results) {
  await goto("/catalogo");
  await evaluate(`
    [...document.querySelectorAll("article.product-card button")]
      .find(b => !b.disabled && /Agregar/.test(b.textContent))?.click()
  `);
  await sleep(2200); // 1s de "Agregado" + apertura + transición

  for (const [label, expr] of Object.entries({
    "drawer-panel": q('[role="dialog"][aria-label="Carrito de compras"]'),
    "drawer-miniatura": q('[role="dialog"] li > div.relative'),
    "drawer-boton-mas": q('[role="dialog"] button[aria-label="Aumentar cantidad"]'),
    "drawer-cta": q('[role="dialog"] a[href="/carrito"]'),
  })) {
    results.push(await measure(label, expr));
  }
  await screenshot("drawer", q('[role="dialog"][aria-label="Carrito de compras"]'), viewportDir, 0);

  await goto("/carrito");
  for (const [label, expr] of Object.entries({
    "carrito-fila-item": q("li.bg-white"),
    "carrito-miniatura": q("li.bg-white div.relative"),
    "carrito-stepper": q("li.bg-white div.flex.items-center.border"),
    "carrito-panel-resumen": q("div.sticky"),
    "carrito-input-nombre": q("#customer-name"),
    "carrito-textarea": q("#order-comment"),
    "carrito-cta-whatsapp": q("div.sticky button"),
  })) {
    results.push(await measure(label, expr));
  }
  // Limpieza: el carrito de prueba no debe quedar
  await evaluate(`localStorage.removeItem("ponelapava_cart")`);
}

// ── Corrida ──────────────────────────────────────────────────────
const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900, deviceScaleFactor: 1, mobile: false },
  { name: "mobile", width: 390, height: 844, deviceScaleFactor: 2, mobile: true },
];

const report = { base: BASE, label: LABEL, viewports: {} };

try {
  for (const vp of VIEWPORTS) {
    console.log(`\n== ${vp.name} (${vp.width}×${vp.height}) — ${BASE} ==`);
    const viewportDir = join(OUT, vp.name);
    mkdirSync(viewportDir, { recursive: true });
    await cdp.send(
      "Emulation.setDeviceMetricsOverride",
      { width: vp.width, height: vp.height, deviceScaleFactor: vp.deviceScaleFactor, mobile: vp.mobile },
      sessionId,
    );

    const results = [];
    for (const pg of PAGES) {
      await goto(pg.path);
      for (const [label, expr] of Object.entries(pg.items)) {
        results.push(await measure(label, expr));
      }
      for (const [name, expr] of Object.entries(pg.shots)) {
        await screenshot(name, expr, viewportDir);
      }
    }
    await drawerAndCartFlow(viewportDir, results);

    for (const r of results) {
      const radius = r.missing
        ? "— no visible —"
        : [r.radius.tl, r.radius.tr, r.radius.br, r.radius.bl].every((v) => v === r.radius.tl)
          ? r.radius.tl
          : `${r.radius.tl} ${r.radius.tr} ${r.radius.br} ${r.radius.bl}`;
      console.log(`  ${r.label.padEnd(24)} ${radius.padEnd(10)} ${r.missing ? "" : `(${r.w}×${r.h})`}`);
    }
    report.viewports[vp.name] = results;
  }

  const jsonFile = join(OUT, "measurements.json");
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
