/* ============================================================
   SCOOT Wrapped 2026 — self-contained year-in-review module.

   An Instagram-stories style fullscreen overlay with six steps:
   intro, kilometers, favourite place, zone discipline, rider
   type and a share card. All data is hardcoded demo content;
   the module imports nothing from the rest of the app.

   Host usage:
     import { initWrapped, openWrapped } from "./js/wrapped.js";
     initWrapped();   // once at boot — injects DOM (+ stylesheet)
     openWrapped();   // shows the overlay, starting at step 1

   Companion stylesheet: css/wrapped.css (auto-injected when the
   host page has not linked it). DM Sans is loaded by the host.
   ============================================================ */

const STEP_COUNT = 6;
const STEP_DURATION = 7000; // ms — keep in sync with `wrapped-fill` in wrapped.css
const COUNTER_TARGET = 1284;
const COUNTER_DURATION = 1600; // ms
const SHARE_URL = "https://scoot.nl/wrapped";
const SHARE_TEXT =
  "Mijn SCOOT Wrapped 2026: 1.284 km door Utrecht, 0 overtredingen — De Grachtenganger.";

/* Decorative monthly bar chart, jan → dec (percent heights). */
const BAR_HEIGHTS = [38, 30, 46, 58, 52, 72, 66, 60, 78, 100, 64, 44];

let root = null;
let currentStep = 0;
let advanceTimer = null;
let counterRaf = 0;
let toastTimer = null;

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Read a design token off :root so the canvas export uses the
   exact same palette as the CSS; fallback for safety. */
function token(name, fallback) {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
}

/* ---------- markup ---------- */

function buildMarkup() {
  const segments = Array.from(
    { length: STEP_COUNT },
    () => '<span class="wrapped-seg"><i></i></span>'
  ).join("");

  const bars = BAR_HEIGHTS.map(
    (h, i) =>
      `<i class="wrapped-bar${h === 100 ? " wrapped-bar-top" : ""}" ` +
      `style="--h:${h}%;--d:${(0.3 + i * 0.055).toFixed(3)}s"></i>`
  ).join("");

  return `
    <div class="wrapped-bg"></div>

    <div class="wrapped-progress">${segments}</div>
    <button class="wrapped-close" type="button" aria-label="Sluiten">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
      </svg>
    </button>

    <!-- 1 · intro -->
    <section class="wrapped-step">
      <div class="wrapped-body">
        <p class="wrapped-eyebrow wrapped-anim">SCOOT</p>
        <p class="wrapped-huge wrapped-anim" style="--d:.08s">2026</p>
        <h2 class="wrapped-title wrapped-anim" style="--d:.18s">Jouw jaar op de scooter</h2>
        <p class="wrapped-sub wrapped-anim" style="--d:.28s">We hebben je ritten door Utrecht op een rij gezet. Even terugkijken?</p>
      </div>
      <button class="wrapped-pill wrapped-anim wrapped-start" style="--d:.38s" type="button">Bekijk je jaar</button>
    </section>

    <!-- 2 · kilometers -->
    <section class="wrapped-step">
      <div class="wrapped-body">
        <p class="wrapped-eyebrow wrapped-anim">Je reed dit jaar</p>
        <p class="wrapped-huge wrapped-counter wrapped-anim" style="--d:.08s">0</p>
        <p class="wrapped-title wrapped-anim" style="--d:.16s">kilometer</p>
        <p class="wrapped-sub wrapped-anim" style="--d:.26s">Dat zijn 31 rondjes om de Singel. Of, als je was doorgereden, Utrecht tot Barcelona.</p>
      </div>
      <div class="wrapped-chart" aria-hidden="true">${bars}</div>
      <div class="wrapped-chart-labels" aria-hidden="true"><span>jan</span><span>dec</span></div>
    </section>

    <!-- 3 · favoriete plek -->
    <section class="wrapped-step">
      <div class="wrapped-body">
        <p class="wrapped-eyebrow wrapped-anim">Je kwam het vaakst bij</p>
        <p class="wrapped-big wrapped-anim" style="--d:.08s">Domplein</p>
        <p class="wrapped-sub wrapped-anim" style="--d:.18s">47 keer. Gemiddeld op dinsdagavond, meestal vanaf de Oudegracht.</p>
        <ol class="wrapped-ranking">
          <li class="wrapped-rank wrapped-anim" style="--d:.32s"><span class="wrapped-rank-nr">1</span><b>Domplein</b><small>47 ritten</small></li>
          <li class="wrapped-rank wrapped-anim" style="--d:.44s"><span class="wrapped-rank-nr">2</span><b>Utrecht Centraal</b><small>31 ritten</small></li>
          <li class="wrapped-rank wrapped-anim" style="--d:.56s"><span class="wrapped-rank-nr">3</span><b>Wilhelminapark</b><small>22 ritten</small></li>
        </ol>
      </div>
    </section>

    <!-- 4 · zonediscipline -->
    <section class="wrapped-step">
      <div class="wrapped-body">
        <p class="wrapped-eyebrow wrapped-anim">Verboden zones ingereden</p>
        <p class="wrapped-huge wrapped-anim" style="--d:.08s">0</p>
        <p class="wrapped-sub wrapped-anim" style="--d:.18s">keer. Dat lukt niet veel mensen: je zit in de top 3% van alle rijders in Utrecht.</p>
        <div class="wrapped-badge wrapped-anim" style="--d:.32s">
          <span class="wrapped-badge-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2l8 3v6c0 5-3.4 9.4-8 11-4.6-1.6-8-6-8-11V5l8-3z" fill="currentColor" opacity=".25"/>
              <path d="M8.5 12.2l2.4 2.4 4.6-4.8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          <span><b>Zonemeester</b><small>Heel 2026 binnen de lijntjes</small></span>
        </div>
      </div>
      <p class="wrapped-note wrapped-anim" style="--d:.46s">Onderweg kreeg je 12 waarschuwingen voor een naderende zone. Elke keer week je op tijd uit.</p>
    </section>

    <!-- 5 · rijderstype -->
    <section class="wrapped-step">
      <div class="wrapped-body">
        <p class="wrapped-eyebrow wrapped-anim">Jouw rijderstype</p>
        <p class="wrapped-big wrapped-anim" style="--d:.08s">De Grachten-<br>ganger</p>
        <p class="wrapped-sub wrapped-anim" style="--d:.18s">Je blijft het liefst binnen de Singel, rijdt rustig en kiest bijna altijd de route langs het water, ook als die iets langer is.</p>
        <dl class="wrapped-statlist">
          <div class="wrapped-statrow wrapped-anim" style="--d:.32s"><dt>Gemiddelde rit</dt><dd>2,8 km</dd></div>
          <div class="wrapped-statrow wrapped-anim" style="--d:.44s"><dt>Favoriete tijd</dt><dd>dinsdag 18:00</dd></div>
          <div class="wrapped-statrow wrapped-anim" style="--d:.56s"><dt>Rustigste maand</dt><dd>februari</dd></div>
        </dl>
      </div>
    </section>

    <!-- 6 · deelkaart -->
    <section class="wrapped-step">
      <div class="wrapped-body">
        <h2 class="wrapped-title wrapped-anim">Deel je jaar</h2>
        <div class="wrapped-card wrapped-anim" style="--d:.12s">
          <span class="wrapped-card-mini">Groenten en fruit</span>
          <p class="wrapped-card-label">SCOOT 2026</p>
          <p class="wrapped-card-title">Fabian reed 1.284 km door Utrecht</p>
          <div class="wrapped-chips">
            <div class="wrapped-chip"><b>47×</b><small>Domplein</small></div>
            <div class="wrapped-chip"><b>0</b><small>overtredingen</small></div>
            <div class="wrapped-chip"><b>top 3%</b><small>van Utrecht</small></div>
          </div>
          <span class="wrapped-card-type">De Grachtenganger</span>
          <p class="wrapped-card-foot">scoot.nl/wrapped</p>
        </div>
      </div>
      <div class="wrapped-actions wrapped-anim" style="--d:.26s">
        <button class="wrapped-pill wrapped-share" type="button">Deel je kaart</button>
        <button class="wrapped-pill wrapped-ghost wrapped-save" type="button">Bewaar als afbeelding</button>
      </div>
    </section>

    <div class="wrapped-toast" role="status">Gekopieerd</div>
  `;
}

/* ---------- step flow ---------- */

function goToStep(index) {
  currentStep = Math.max(0, Math.min(STEP_COUNT - 1, index));

  root.querySelectorAll(".wrapped-step").forEach((el, i) => {
    el.classList.toggle("wrapped-active", i === currentStep);
  });
  root.querySelectorAll(".wrapped-seg").forEach((el, i) => {
    el.classList.toggle("wrapped-done", i < currentStep);
    el.classList.toggle("wrapped-active", i === currentStep);
  });

  updateParallax();
  if (currentStep === 1) startCounter();
  scheduleAdvance();
}

function next() {
  if (currentStep < STEP_COUNT - 1) goToStep(currentStep + 1);
}

function prev() {
  goToStep(Math.max(0, currentStep - 1));
}

function scheduleAdvance() {
  clearTimeout(advanceTimer);
  // Last step holds; with reduced motion the user taps through.
  if (currentStep >= STEP_COUNT - 1 || prefersReducedMotion()) return;
  advanceTimer = setTimeout(() => goToStep(currentStep + 1), STEP_DURATION);
}

/* Subtle parallax/scale on the gradient as the story progresses. */
function updateParallax() {
  const bg = root.querySelector(".wrapped-bg");
  if (prefersReducedMotion()) {
    bg.style.transform = "";
    return;
  }
  bg.style.transform =
    `translateX(${currentStep * -12}px) scale(${(1.03 + currentStep * 0.012).toFixed(3)})`;
}

/* Count-up for the big kilometre number (0 → 1.284). */
function startCounter() {
  const el = root.querySelector(".wrapped-counter");
  cancelAnimationFrame(counterRaf);
  if (prefersReducedMotion()) {
    el.textContent = COUNTER_TARGET.toLocaleString("nl-NL");
    return;
  }
  const start = performance.now();
  const tick = (now) => {
    const p = Math.min(1, (now - start) / COUNTER_DURATION);
    const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
    el.textContent = Math.round(COUNTER_TARGET * eased).toLocaleString("nl-NL");
    if (p < 1) counterRaf = requestAnimationFrame(tick);
  };
  el.textContent = "0";
  counterRaf = requestAnimationFrame(tick);
}

/* ---------- open / close ---------- */

function onKeyDown(event) {
  if (event.key === "Escape") closeWrapped();
  else if (event.key === "ArrowRight") next();
  else if (event.key === "ArrowLeft") prev();
}

function closeWrapped() {
  clearTimeout(advanceTimer);
  cancelAnimationFrame(counterRaf);
  document.removeEventListener("keydown", onKeyDown);
  root.classList.remove("wrapped-open");
}

/* ---------- share & save ---------- */

function showToast() {
  const toast = root.querySelector(".wrapped-toast");
  toast.classList.add("wrapped-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("wrapped-visible"), 1800);
}

async function shareCard() {
  const payload = { title: "SCOOT Wrapped 2026", text: SHARE_TEXT, url: SHARE_URL };
  if (navigator.share) {
    try {
      await navigator.share(payload);
    } catch {
      /* user dismissed the share sheet */
    }
    return;
  }
  try {
    await navigator.clipboard.writeText(`${SHARE_TEXT} ${SHARE_URL}`);
    showToast();
  } catch {
    /* clipboard unavailable (insecure context) — silently ignore */
  }
}

/* Rounded-rect path helper (fallback for older ctx.roundRect). */
function roundedRect(ctx, x, y, w, h, r) {
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/* Redraw the share card by hand on a 1080×1350 canvas and
   download it as scoot-wrapped-2026.png. */
async function saveShareImage() {
  try {
    await Promise.all([
      document.fonts.load('600 92px "DM Sans"'),
      document.fonts.load('700 44px "DM Sans"'),
      document.fonts.load('400 28px "DM Sans"'),
    ]);
  } catch {
    /* font loading is best-effort; system fallback is acceptable */
  }

  const W = 1080;
  const H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  const font = (spec) => `${spec} "DM Sans", system-ui, sans-serif`;

  const violet500 = token("--violet-500", "#8b5cf6");
  const violet700 = token("--violet-700", "#6d3ae6");
  const violet50 = token("--violet-50", "#f5f3ff");
  const ink = token("--ink", "#0f172a");
  const ink3 = token("--ink-3", "#64748b");
  const paper = token("--paper", "#ffffff");

  // gradient background — same ramp as the overlay
  const gradient = ctx.createLinearGradient(0, 0, 0, H);
  gradient.addColorStop(0, violet500);
  gradient.addColorStop(0.55, "#5b21b6");
  gradient.addColorStop(1, "#2e1065");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);

  // white card
  const cardX = 90;
  const cardY = 170;
  const cardW = 900;
  const cardH = 1010;
  ctx.save();
  ctx.shadowColor = "rgba(15, 23, 42, 0.4)";
  ctx.shadowBlur = 60;
  ctx.shadowOffsetY = 26;
  roundedRect(ctx, cardX, cardY, cardW, cardH, 56);
  ctx.fillStyle = paper;
  ctx.fill();
  ctx.restore();

  const pad = 74;
  const left = cardX + pad;
  ctx.textBaseline = "alphabetic";

  // "SCOOT 2026" label
  ctx.fillStyle = violet500;
  ctx.font = font("700 34px");
  if ("letterSpacing" in ctx) ctx.letterSpacing = "3px";
  ctx.fillText("SCOOT 2026", left, cardY + 118);
  if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";

  // title, three lines like the design
  ctx.fillStyle = ink;
  ctx.font = font("600 92px");
  ctx.fillText("Fabian reed", left, cardY + 250);
  ctx.fillText("1.284 km", left, cardY + 362);
  ctx.fillText("door Utrecht", left, cardY + 474);

  // three chips
  const chips = [
    ["47×", "Domplein"],
    ["0", "overtredingen"],
    ["top 3%", "van Utrecht"],
  ];
  const chipGap = 24;
  const chipW = (cardW - pad * 2 - chipGap * 2) / 3;
  const chipH = 150;
  const chipY = cardY + 540;
  chips.forEach(([value, label], i) => {
    const x = left + i * (chipW + chipGap);
    roundedRect(ctx, x, chipY, chipW, chipH, 24);
    ctx.fillStyle = violet50;
    ctx.fill();
    ctx.fillStyle = violet700;
    ctx.font = font("700 44px");
    ctx.fillText(value, x + 30, chipY + 66);
    ctx.fillStyle = ink3;
    ctx.font = font("400 27px");
    ctx.fillText(label, x + 30, chipY + 114);
  });

  // yellow rider-type pill
  ctx.font = font("600 36px");
  const typeText = "De Grachtenganger";
  const typeW = ctx.measureText(typeText).width + 76;
  const typeY = chipY + chipH + 60;
  roundedRect(ctx, left, typeY, typeW, 78, 39);
  ctx.fillStyle = "#fdecbc";
  ctx.fill();
  ctx.fillStyle = "#92610f";
  ctx.fillText(typeText, left + 38, typeY + 51);

  // grey footnote
  ctx.fillStyle = "#94a3b8";
  ctx.font = font("400 28px");
  ctx.fillText("scoot.nl/wrapped", left, typeY + 172);

  // purple micro-badge, tilted over the top-right corner
  ctx.save();
  ctx.font = font("700 27px");
  const miniText = "Groenten en fruit";
  const miniW = ctx.measureText(miniText).width + 60;
  ctx.translate(cardX + cardW - miniW / 2 - 46, cardY + 4);
  ctx.rotate((5 * Math.PI) / 180);
  roundedRect(ctx, -miniW / 2, -29, miniW, 58, 29);
  ctx.fillStyle = violet700;
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.fillText(miniText, -miniW / 2 + 30, 10);
  ctx.restore();

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "scoot-wrapped-2026.png";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }, "image/png");
}

/* ---------- stylesheet ---------- */

function ensureStylesheet() {
  if (document.querySelector('link[href*="wrapped.css"]')) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = new URL("../css/wrapped.css", import.meta.url).href;
  document.head.appendChild(link);
}

/* ---------- public API ---------- */

export function initWrapped() {
  if (root) return;
  ensureStylesheet();

  root = document.createElement("div");
  root.className = "wrapped";
  root.innerHTML = buildMarkup();
  document.body.appendChild(root);

  root.querySelector(".wrapped-close").addEventListener("click", closeWrapped);
  root.querySelector(".wrapped-start").addEventListener("click", next);
  root.querySelector(".wrapped-share").addEventListener("click", shareCard);
  root.querySelector(".wrapped-save").addEventListener("click", saveShareImage);

  // stories tap navigation: right half = next, left half = previous
  root.addEventListener("click", (event) => {
    if (event.target.closest("button")) return;
    if (event.clientX >= window.innerWidth / 2) next();
    else prev();
  });
}

export function openWrapped() {
  if (!root) initWrapped();
  root.classList.add("wrapped-open");
  document.addEventListener("keydown", onKeyDown);
  goToStep(0);
  root.querySelector(".wrapped-close").focus({ preventScroll: true });
}
