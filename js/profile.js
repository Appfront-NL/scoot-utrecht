/* ============================================================
   SCOOT — profile module (account, history, settings & more)

   Host integration:
     1. Add <link rel="stylesheet" href="css/profile.css"> to
        index.html.
     2. import { initProfile, openAccount, openNotifications }
          from "./js/profile.js";
        initProfile({
          onOpenRules:   () => { ... }, // show the existing rules screen
          onOpenWrapped: () => { ... }  // start the Wrapped story flow
        });
     3. Call openAccount() from an avatar/menu button and
        openNotifications() from a bell button.

   Self-contained: injects its DOM once on init, all data is
   hardcoded (demo). The settings toggles persist in
   localStorage. Sub-screens slide in from the right; the back
   button or Escape pops one screen at a time. Before invoking a
   host callback the whole stack closes itself, so host overlays
   with a lower z-index (e.g. the rules screen at z-40) are not
   hidden behind these screens (z-50).
   ============================================================ */

const SETTINGS_KEY = "scoot.profile.settings";
const DEFAULT_SETTINGS = {
  helm: true,
  zone: true,
  venster: true,
  stem: true,
  besluiten: true,
};

let rootEl = null;
let toastEl = null;
let toastTimer = 0;
const hooks = { onOpenRules: null, onOpenWrapped: null };
const stack = [];

/* ---------- icons (stroke style matches app.css markup) ---------- */

const svg = (paths, size = 20) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

const ICONS = {
  back: svg('<path d="M15 18l-6-6 6-6"/>', 22),
  chevron: svg('<path d="M9 6l6 6-6 6"/>', 16),
  arrow: svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/>'),
  card: svg('<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 9.5h19"/>'),
  shield: svg('<path d="M12 3l7.5 3v5.2c0 4.6-3.2 7.7-7.5 9.3-4.3-1.6-7.5-4.7-7.5-9.3V6z"/>'),
  sliders: svg('<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>'),
  trophy: svg('<path d="M8 21h8M12 17v4M7 4h10v4.5a5 5 0 0 1-10 0zM7 5H4a3 3 0 0 0 3 4M17 5h3a3 3 0 0 1-3 4"/>'),
  doc: svg('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>'),
  download: svg('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>'),
  helmet: svg('<path d="M4 16v-2a8 8 0 0 1 16 0v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><path d="M4 13.5h16"/>', 24),
  shieldCheck: svg('<path d="M12 3l7.5 3v5.2c0 4.6-3.2 7.7-7.5 9.3-4.3-1.6-7.5-4.7-7.5-9.3V6z"/><path d="M9 11.8l2.1 2.1 4-4.2"/>', 24),
  waves: svg('<path d="M3 10c1.8-1.8 3.7-1.8 5.5 0s3.7 1.8 5.5 0 3.7-1.8 5.5 0M3 15c1.8-1.8 3.7-1.8 5.5 0s3.7 1.8 5.5 0 3.7-1.8 5.5 0"/>', 24),
  moon: svg('<path d="M20.5 13.5A8.5 8.5 0 1 1 10.5 3.5a7 7 0 0 0 10 10z"/>', 18),
  map: svg('<path d="M9 4l6 2 5.5-2v14l-5.5 2-6-2-5.5 2V6z"/><path d="M9 4v14M15 6v14"/>', 18),
  book: svg('<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>', 18),
  warn: svg('<path d="M12 9v4M12 16.5h.01M10.3 3.9L2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>', 13),
};

/* ---------- demo data (copy taken verbatim from the design) ---------- */

const RIDES = [
  { date: "Vandaag 13:35", route: "Oudegracht → Domplein", meta: "2,3 km · 8 min" },
  { date: "Gisteren 09:12", route: "Vredenburg → Rijnsweerd", meta: "5,8 km · 19 min", warn: "1 waarschuwing" },
  { date: "Vrijdag 16:04", route: "Kantoor → Café Thijssen", meta: "1,9 km · 7 min" },
  { date: "28 juli 18:40", route: "Domplein → Utrecht Centraal", meta: "3,1 km · 11 min", warn: "3 min omgeleid · ganzendemonstratie" },
  { date: "27 juli 08:05", route: "Jaarbeurs → Wilhelminapark", meta: "4,2 km · 14 min", warn: "2 waarschuwingen" },
  { date: "26 juli 17:22", route: "Neude → Oudegracht", meta: "1,7 km · 6 min" },
];

const TOGGLES = [
  { key: "helm", title: "Helmherinnering", sub: "Waarschuw me voor routes over de rijbaan" },
  { key: "zone", title: "Zonewaarschuwing", sub: "Trilsignaal bij een naderende verboden zone" },
  { key: "venster", title: "Venstertijden meenemen", sub: "Houd rekening met tijdgebonden verboden" },
  { key: "stem", title: "Gesproken aanwijzingen", sub: "Stem tijdens het rijden" },
  { key: "besluiten", title: "Meld nieuwe besluiten", sub: "Bericht als er iets verandert op je routes" },
];

const NOTIFICATIONS = [
  { title: "Nieuwe regel op je route", time: "2 u", body: "De Vleutenseweg gaat per 1 september naar de rijbaan. Vanaf dan geldt daar een helmplicht.", unread: true },
  { title: "Je SCOOT Wrapped staat klaar", time: "1 d", body: "Bekijk hoeveel je dit jaar door Utrecht reed.", unread: true, wrapped: true },
  { title: "Venstertijd gewijzigd", time: "3 d", body: "De Steenweg is voortaan ook op zaterdag gesloten van 11:00 tot 18:00." },
  { title: "Kaart bijgewerkt", time: "1 w", body: "340 verkeersbesluiten opnieuw ingelezen." },
  { title: "Vergeet niet je ritten te schrijven", time: "vr 15:00", body: "Wekelijkse herinnering. Je weet waarom." },
  { title: "Geplande rit wacht", time: "9 mnd", body: "Poldersport Uithoorn staat nog in je agenda. Ooit gaan we echt." },
];

const EARNED = [
  { name: "Helmheld", tint: "violet", icon: ICONS.helmet },
  { name: "Zonemeester", tint: "green", icon: ICONS.shieldCheck },
  { name: "Grachtenganger", tint: "blue", icon: ICONS.waves },
];

const QUESTS = [
  { icon: ICONS.clock, title: "De Pakketjeswachter", sub: "Ritten uitgesteld omdat er nog een pakketje kwam", count: "12/15", pct: 80 },
  { icon: ICONS.moon, title: "Nachtbraker", sub: "25 ritten na 22:00 uur", count: "18/25", pct: 72 },
  { icon: ICONS.map, title: "Stratenmaker", sub: "200 verschillende straten gereden", count: "143/200", pct: 71.5 },
  { icon: ICONS.book, title: "Wetsgeleerde", sub: "Alle 12 regels in de kennisbank gelezen", count: "9/12", pct: 75 },
];

const CHANGES = [
  { date: "Per 1 september", title: "Vleutenseweg naar de rijbaan", body: "De fietspaden aan weerszijden worden gesloten voor snorfietsen. Helmplicht vanaf dat moment." },
  { date: "Per 1 december", title: "Biltstraat volgt later", body: "Uitgesteld vanwege herinrichtingswerkzaamheden." },
  { date: "Sinds 3 juni", title: "Steenweg voetgangersgebied", body: "Gesloten voor snorfietsen van ma-za 11:00 tot 18:00." },
];

/* ---------- template helpers ---------- */

function screenShell(name, label, content) {
  return `<section class="profile-screen" data-screen="${name}" role="dialog" aria-modal="true" aria-label="${label}">
    <div class="profile-screen-inner">
      <header class="profile-header">
        <button class="profile-back" data-action="back" aria-label="Terug">${ICONS.back}</button>
      </header>
      ${content}
    </div>
  </section>`;
}

function linkRow({ action, target, icon, title, sub }) {
  const attrs = target
    ? `data-action="push" data-target="${target}"`
    : `data-action="${action}"`;
  return `<button class="profile-row" ${attrs}>
    <span class="profile-row-icon">${icon}</span>
    <span class="profile-row-text"><b>${title}</b><small>${sub}</small></span>
    <span class="profile-row-chevron">${ICONS.chevron}</span>
  </button>`;
}

/* ---------- screens ---------- */

function accountScreen() {
  const stat = (value, label, ok) =>
    `<div class="profile-stat${ok ? " is-ok" : ""}"><b>${value}</b><small>${label}</small></div>`;

  const rows = [
    { target: "rides", icon: ICONS.clock, title: "Ritgeschiedenis", sub: "34 ritten" },
    { action: "pay", icon: ICONS.card, title: "Betaalmethode", sub: "Visa •••• 4127" },
    { action: "rules", icon: ICONS.shield, title: "Regels en wetgeving", sub: "Utrecht" },
    { target: "settings", icon: ICONS.sliders, title: "Instellingen", sub: "Voertuig, stem, meldingen" },
    { target: "achievements", icon: ICONS.trophy, title: "Prestaties", sub: "Verdiend door slim en netjes te rijden" },
    { target: "rulechanges", icon: ICONS.doc, title: "Regelwijzigingen", sub: "Nieuwe verkeersbesluiten die jouw vaste routes raken" },
    { target: "offline", icon: ICONS.download, title: "Offline kaart", sub: "Utrecht, 84 MB van 112 MB" },
  ].map(linkRow).join("");

  return screenShell("account", "Account", `
    <h1 class="profile-title">Account</h1>
    <div class="profile-identity">
      <span class="profile-avatar" aria-hidden="true">FD</span>
      <span><b>Fabian van Dijk</b><small>fabian@appfront.nl</small></span>
    </div>
    <div class="profile-stats">
      ${stat("34", "Ritten")}
      ${stat("128 km", "Gereden")}
      ${stat("0", "Overtredingen", true)}
    </div>
    <button class="profile-wrapped" data-action="wrapped">
      <span class="profile-wrapped-icon">${ICONS.trophy}</span>
      <span class="profile-wrapped-copy">
        <b>SCOOT Wrapped 2026</b>
        <small>1.284 km, 0 overtredingen. Bekijk je jaar.</small>
      </span>
      <span class="profile-wrapped-arrow">${ICONS.arrow}</span>
    </button>
    <nav class="profile-rows" aria-label="Accountonderdelen">${rows}</nav>
  `);
}

function ridesScreen() {
  const items = RIDES.map((ride) => `
    <article class="profile-ride">
      <span class="profile-ride-date">${ride.date}</span>
      <b>${ride.route}</b>
      <span class="profile-ride-meta">
        ${ride.meta}
        ${ride.warn ? `<span class="profile-warnbadge">${ICONS.warn}${ride.warn}</span>` : ""}
      </span>
    </article>
  `).join("");

  return screenShell("rides", "Ritgeschiedenis", `
    <h1 class="profile-title">Ritgeschiedenis</h1>
    <div class="profile-rides">${items}</div>
  `);
}

function settingsScreen() {
  const toggles = TOGGLES.map((item) => `
    <label class="profile-toggle">
      <span class="profile-toggle-text"><b>${item.title}</b><small>${item.sub}</small></span>
      <span class="profile-switch">
        <input type="checkbox" data-setting="${item.key}">
        <i></i>
      </span>
    </label>
  `).join("");

  return screenShell("settings", "Instellingen", `
    <h1 class="profile-title">Instellingen</h1>
    <h2 class="profile-section">Jouw voertuig</h2>
    <p class="profile-sub">Bepaalt welke verkeersregels op je kaart staan.</p>
    <div class="profile-card profile-vehicle">
      <span class="profile-plate" aria-label="Kenteken 52-ND-3">
        <span class="profile-plate-band">NL</span>
        <span class="profile-plate-number">52-ND-3</span>
      </span>
      <span class="profile-vehicle-label">Snorfiets, blauw kenteken</span>
    </div>
    <div class="profile-card profile-toggles">${toggles}</div>
  `);
}

function notificationsScreen() {
  const items = NOTIFICATIONS.map((item) => {
    const inner = `
      <span class="profile-notif-head">
        ${item.unread ? '<span class="profile-dot" aria-label="Ongelezen"></span>' : ""}
        <b>${item.title}</b>
        <span class="profile-notif-time">${item.time}</span>
      </span>
      <p>${item.body}</p>
    `;
    return item.wrapped
      ? `<button class="profile-notif" data-action="wrapped">${inner}</button>`
      : `<article class="profile-notif">${inner}</article>`;
  }).join("");

  return screenShell("notifications", "Meldingen", `
    <h1 class="profile-title">Meldingen</h1>
    <div class="profile-notifs">${items}</div>
  `);
}

function achievementsScreen() {
  const badges = EARNED.map((badge) => `
    <div class="profile-badge">
      <span class="profile-badge-medal ${badge.tint}">${badge.icon}</span>
      <b>${badge.name}</b>
    </div>
  `).join("");

  const quest = (item) => `
    <div class="profile-quest">
      <div class="profile-quest-head">
        <span class="profile-quest-icon">${item.icon}</span>
        <span class="profile-quest-text"><b>${item.title}</b><small>${item.sub}</small></span>
        <span class="profile-quest-count">${item.count}</span>
      </div>
      <div class="profile-progress"><i style="width:${item.pct}%"></i></div>
    </div>
  `;

  return screenShell("achievements", "Prestaties", `
    <h1 class="profile-title">Prestaties</h1>
    <p class="profile-sub">Verdiend door slim en netjes te rijden.</p>
    <div class="profile-badges">${badges}</div>
    <div class="profile-card">${QUESTS.map(quest).join("")}</div>
    <div class="profile-mystery">${quest({
      icon: "🐭",
      title: "Mickront",
      sub: "Spot de muis die zich ergens op de kaart verstopt",
      count: "0/1",
      pct: 0,
    })}</div>
  `);
}

function ruleChangesScreen() {
  const cards = CHANGES.map((change) => `
    <article class="profile-change">
      <span class="profile-change-date">${change.date}</span>
      <b>${change.title}</b>
      <p>${change.body}</p>
      <a href="#" class="profile-decree" data-action="decree">Lees het besluit ${ICONS.arrow}</a>
    </article>
  `).join("");

  return screenShell("rulechanges", "Regelwijzigingen", `
    <h1 class="profile-title">Wat verandert er</h1>
    <p class="profile-sub">Nieuwe verkeersbesluiten die jouw vaste routes raken.</p>
    <div class="profile-timeline">${cards}</div>
  `);
}

function offlineScreen() {
  return screenShell("offline", "Offline kaart", `
    <h1 class="profile-title">Offline kaart</h1>
    <p class="profile-sub">Bewaar Utrecht op je telefoon. Handig als je in een tunnel of kelder geen bereik hebt.</p>
    <div class="profile-card profile-offline">
      <div class="profile-offline-head">
        <span class="profile-offline-pct">75%</span>
        <span class="profile-offline-label">Utrecht, 84 MB van 112 MB</span>
      </div>
      <div class="profile-progressbar" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100"><i></i></div>
      <dl class="profile-offline-break">
        <div><dt>Kaart en straten</dt><dd>68 MB</dd></div>
        <div><dt>Zones en verkeersbesluiten</dt><dd>14 MB</dd></div>
        <div><dt>Venstertijden</dt><dd>2 MB</dd></div>
      </dl>
    </div>
    <div class="profile-note">
      <b>Regels verlopen</b>
      <p>Offline zie je de regels van vandaag. Ververs minstens eens per maand.</p>
    </div>
  `);
}

/* ---------- settings persistence ---------- */

function loadSettings() {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}") };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function applyStoredSettings() {
  const settings = loadSettings();
  rootEl.querySelectorAll("[data-setting]").forEach((input) => {
    input.checked = settings[input.dataset.setting] !== false;
  });
}

/* ---------- navigation stack ---------- */

function screenFor(name) {
  return rootEl.querySelector(`[data-screen="${name}"]`);
}

function push(name) {
  const el = screenFor(name);
  if (!el || stack.includes(name)) return;
  stack.push(name);
  el.style.zIndex = String(50 + stack.length); // later pushes paint on top
  el.classList.add("is-open");
  if (name === "offline") animateOfflineBar(el);
  const back = el.querySelector(".profile-back");
  if (back) back.focus({ preventScroll: true });
}

function pop() {
  const name = stack.pop();
  if (!name) return;
  screenFor(name).classList.remove("is-open");
  const below = stack[stack.length - 1];
  if (below) {
    const back = screenFor(below).querySelector(".profile-back");
    if (back) back.focus({ preventScroll: true });
  }
}

function closeAll() {
  while (stack.length) pop();
}

function animateOfflineBar(el) {
  const bar = el.querySelector(".profile-progressbar i");
  if (!bar) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    bar.style.width = "75%";
    return;
  }
  bar.style.width = "0%";
  // double rAF so the reset paints before the transition starts
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      bar.style.width = "75%";
    });
  });
}

/* ---------- toast ---------- */

function toast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("is-visible"), 1800);
}

/* ---------- events ---------- */

function onClick(event) {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const action = target.dataset.action;
  if (action === "back") {
    pop();
  } else if (action === "push") {
    push(target.dataset.target);
  } else if (action === "rules") {
    closeAll();
    if (hooks.onOpenRules) hooks.onOpenRules();
  } else if (action === "wrapped") {
    closeAll();
    if (hooks.onOpenWrapped) hooks.onOpenWrapped();
  } else if (action === "pay") {
    toast("Demo");
  } else if (action === "decree") {
    event.preventDefault();
    toast("Opent het Gemeenteblad");
  }
}

function onChange(event) {
  const input = event.target;
  if (!input.matches("[data-setting]")) return;
  const settings = loadSettings();
  settings[input.dataset.setting] = input.checked;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // storage unavailable (private mode): the toggle still works for this session
  }
}

function onKeydown(event) {
  if (event.key === "Escape" && stack.length) {
    event.stopPropagation();
    pop();
  }
}

/* ---------- public API ---------- */

export function initProfile({ onOpenRules, onOpenWrapped } = {}) {
  hooks.onOpenRules = onOpenRules || null;
  hooks.onOpenWrapped = onOpenWrapped || null;
  if (rootEl) return; // DOM is injected once; only the callbacks refresh

  rootEl = document.createElement("div");
  rootEl.id = "profile-root";
  rootEl.innerHTML =
    accountScreen() +
    ridesScreen() +
    settingsScreen() +
    notificationsScreen() +
    achievementsScreen() +
    ruleChangesScreen() +
    offlineScreen();
  document.body.appendChild(rootEl);

  toastEl = document.createElement("div");
  toastEl.className = "profile-toast";
  toastEl.setAttribute("role", "status");
  document.body.appendChild(toastEl);

  applyStoredSettings();
  rootEl.addEventListener("click", onClick);
  rootEl.addEventListener("change", onChange);
  document.addEventListener("keydown", onKeydown);
}

export function openAccount() {
  if (rootEl) push("account");
}

export function openNotifications() {
  if (rootEl) push("notifications");
}
