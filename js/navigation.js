// ============================================================
// NAVIGATION — deriving maneuvers and simulating the ride.
//
// The briefing says: the ride view doesn't need real turn-by-turn;
// next turn + progress is enough. That's exactly what this does:
// from the route's LineString we derive the turns (heading change
// > 30°) and a ticker moves the rider along the line at a fixed
// speed.
//
// If track B later ships real maneuvers (street names!), replace
// only buildManeuvers(); the simulation stays as is.
// ============================================================

import { CONFIG } from './config.js';
import { makeRuler, pointAlong, bearingDeg, distanceM } from './geo.js';

/** Derives turns from the route line. Labels are UI copy (Dutch). */
export function buildManeuvers(coords) {
  const ruler = makeRuler(coords);
  const maneuvers = [];

  for (let i = 1; i < coords.length - 1; i++) {
    const inbound = bearingDeg(coords[i - 1], coords[i]);
    const outbound = bearingDeg(coords[i], coords[i + 1]);
    // delta to [-180, 180]: positive = clockwise = right turn
    const turn = ((outbound - inbound + 540) % 360) - 180;
    if (Math.abs(turn) > 30) {
      maneuvers.push({
        atMeter: ruler.cum[i],
        label: turn > 0 ? 'Rechtsaf' : 'Linksaf',
        direction: turn > 0 ? 'right' : 'left',
      });
    }
  }
  maneuvers.push({ atMeter: ruler.total, label: 'Bestemming', direction: 'arrival' });
  return { ruler, maneuvers };
}

/**
 * Simulates the ride. Calls `onStep` every tick with everything
 * the UI needs, and `onDone` on arrival. Returns handles to set
 * the speed factor and to stop.
 */
export function startSimulation({ ruler, maneuvers, warnings, onStep, onWarning, onDone }) {
  let traveled = 0;
  let factor = 8;             // demo speedup (1x = realtime)
  let lastTime = performance.now();
  let active = true;
  const reported = new Set(); // each warning fires only once

  // Deliberately setInterval, not requestAnimationFrame: rAF fully
  // stalls once the window is covered, which would freeze the ride.
  // An interval keeps (throttled) ticking; on-screen smoothness
  // comes from the camera easing in map.js, not the tick rate.
  function tick() {
    if (!active) return;
    const now = performance.now();
    const dt = Math.min(1, (now - lastTime) / 1000);
    lastTime = now;
    traveled += CONFIG.averageSpeedMs * factor * dt;

    if (traveled >= ruler.total) {
      active = false;
      clearInterval(interval);
      onDone();
      return;
    }

    const { point, heading } = pointAlong(ruler, traveled);

    // Next maneuver still ahead of us, plus the one after that
    // (for the "Volgende:" row in the banner, as in the design).
    const next = maneuvers.find(m => m.atMeter > traveled + 5) ?? maneuvers[maneuvers.length - 1];
    const afterNext = maneuvers[maneuvers.indexOf(next) + 1] ?? null;

    // Warning within 120 m? The first 60 m are grace distance: a
    // recalculated route may start right next to the zone that
    // caused the warning, and re-alarming instantly helps nobody.
    if (traveled > 60) {
      for (const w of warnings) {
        if (reported.has(w)) continue;
        if (distanceM(point, w.bij) < 120) {
          reported.add(w);
          onWarning(w);
        }
      }
    }

    onStep({
      point,
      heading,
      traveled,
      remainingM: ruler.total - traveled,
      remainingS: (ruler.total - traveled) / CONFIG.averageSpeedMs,
      toManeuverM: next.atMeter - traveled,
      maneuver: next,
      nextManeuver: afterNext,
    });
  }
  const interval = setInterval(tick, 50);   // 20 Hz is plenty

  return {
    setFactor: (x) => { factor = x; },
    stop: () => { active = false; clearInterval(interval); },
    traveled: () => traveled,
  };
}

/* ---------- display helpers ---------- */

export function fmtDistance(m) {
  return m >= 1000
    ? (m / 1000).toFixed(1).replace('.', ',') + ' km'
    : Math.max(10, Math.round(m / 10) * 10) + ' m';
}

export function fmtDuration(s) {
  return Math.max(1, Math.round(s / 60)) + ' min';
}

export function fmtArrival(remainingS) {
  const t = new Date(Date.now() + remainingS * 1000);
  return t.getHours() + ':' + String(t.getMinutes()).padStart(2, '0');
}
