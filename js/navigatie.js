// ============================================================
// NAVIGATIE — manoeuvres afleiden en de rit simuleren.
//
// De briefing zegt: rijweergave hoeft geen echte turn-by-turn
// te zijn; volgende afslag + voortgang is genoeg. Dat is precies
// wat dit doet: uit de LineString van de route leiden we de
// bochten af (koersverandering > 30°) en een ticker schuift de
// rijder met een vaste snelheid over de lijn.
//
// Als spoor B later echte manoeuvres meestuurt (straatnamen!)
// vervang je alleen maakManoeuvres(); de simulatie blijft gelijk.
// ============================================================

import { CONFIG } from './config.js';
import { maakLiniaal, puntOpLiniaal, koers, afstandM } from './geo.js';

/** Leidt bochten af uit de route-lijn. */
export function maakManoeuvres(coords) {
  const liniaal = maakLiniaal(coords);
  const manoeuvres = [];

  for (let i = 1; i < coords.length - 1; i++) {
    const binnenkomst = koers(coords[i - 1], coords[i]);
    const vertrek = koers(coords[i], coords[i + 1]);
    // verschil naar [-180, 180]: positief = met de klok mee = rechtsaf
    const draai = ((vertrek - binnenkomst + 540) % 360) - 180;
    if (Math.abs(draai) > 30) {
      manoeuvres.push({
        opMeter: liniaal.cum[i],
        actie: draai > 0 ? 'Rechtsaf' : 'Linksaf',
        richting: draai > 0 ? 'rechts' : 'links',
      });
    }
  }
  manoeuvres.push({ opMeter: liniaal.totaal, actie: 'Bestemming', richting: 'aankomst' });
  return { liniaal, manoeuvres };
}

/**
 * Simuleert de rit. Roept elke frame `bijStap` aan met alles wat
 * de UI nodig heeft, en `bijKlaar` bij aankomst.
 * Retourneert handvatten om snelheid te zetten en te stoppen.
 */
export function startSimulatie({ liniaal, manoeuvres, waarschuwingen, bijStap, bijWaarschuwing, bijKlaar }) {
  let afgelegd = 0;
  let factor = 8;             // demo-versnelling (1x = realtime)
  let vorigeTijd = performance.now();
  let actief = true;
  const gemeld = new Set();   // elke waarschuwing maar één keer tonen

  // Bewust setInterval en geen requestAnimationFrame: rAF valt
  // volledig stil zodra het venster bedekt is, en dan zou de rit
  // bevriezen. Een interval blijft (vertraagd) doortikken; de
  // vloeiendheid op het scherm komt van de camera-easing in
  // kaart.js, niet van de tick-frequentie.
  function tick() {
    if (!actief) return;
    const nu = performance.now();
    const dt = Math.min(1, (nu - vorigeTijd) / 1000);
    vorigeTijd = nu;
    afgelegd += CONFIG.gemiddeldeSnelheidMs * factor * dt;

    if (afgelegd >= liniaal.totaal) {
      actief = false;
      clearInterval(interval);
      bijKlaar();
      return;
    }

    const { punt, richting } = puntOpLiniaal(liniaal, afgelegd);

    // eerstvolgende manoeuvre die nog vóór ons ligt
    const volgende = manoeuvres.find(m => m.opMeter > afgelegd + 5) ?? manoeuvres[manoeuvres.length - 1];

    // waarschuwing binnen 120 m vóór ons op de route?
    for (const w of waarschuwingen) {
      if (gemeld.has(w)) continue;
      if (afstandM(punt, w.bij) < 120) {
        gemeld.add(w);
        bijWaarschuwing(w);
      }
    }

    bijStap({
      punt,
      richting,
      afgelegd,
      resterendM: liniaal.totaal - afgelegd,
      resterendS: (liniaal.totaal - afgelegd) / CONFIG.gemiddeldeSnelheidMs,
      totManoeuvreM: volgende.opMeter - afgelegd,
      manoeuvre: volgende,
    });

  }
  const interval = setInterval(tick, 50);   // 20 Hz is ruim genoeg

  return {
    zetFactor: (x) => { factor = x; },
    stop: () => { actief = false; clearInterval(interval); },
    afgelegd: () => afgelegd,
  };
}

/* ---------- weergavehulpjes ---------- */

export function fmtAfstand(m) {
  return m >= 1000
    ? (m / 1000).toFixed(1).replace('.', ',') + ' km'
    : Math.max(10, Math.round(m / 10) * 10) + ' m';
}

export function fmtDuur(s) {
  return Math.max(1, Math.round(s / 60)) + ' min';
}

export function fmtAankomst(resterendS) {
  const t = new Date(Date.now() + resterendS * 1000);
  return t.getHours() + ':' + String(t.getMinutes()).padStart(2, '0');
}
