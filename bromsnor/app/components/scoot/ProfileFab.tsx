// ============================================================
// ProfileFab: floating avatar + bell in the top-right corner
// that link the map screens to the profile pages. Mounted once
// in root.tsx; hides itself on every route that has its own
// header (profile pages, catalog), so it only shows on top of
// the map screens.
// ============================================================

/**
 * Self-positioning navigation to /account and /notifications.
 * Renders only on the routes listed in SHOW_ON.
 *
 * @example
 * // in root.tsx, inside the app shell:
 * <ProfileFab />
 */

import { Link, useLocation } from "react-router";

const SHOW_ON = ["/", "/map"];

const bellIcon = (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.7 21a2 2 0 0 1-3.4 0" />
  </svg>
);

const wrap: React.CSSProperties = {
  position: "fixed", top: 14, right: 14, zIndex: 1100,
  display: "flex", gap: 8, alignItems: "center",
};
const circle: React.CSSProperties = {
  width: 40, height: 40, borderRadius: "50%",
  display: "grid", placeItems: "center",
  boxShadow: "0 2px 10px rgba(15, 23, 42, .14)",
  textDecoration: "none",
};

export function ProfileFab({ initials = "FD" }: { initials?: string }) {
  const { pathname } = useLocation();
  if (!SHOW_ON.includes(pathname)) return null;
  return (
    <nav style={wrap} aria-label="Profiel">
      <Link to="/notifications" aria-label="Meldingen"
        style={{ ...circle, background: "#fff", color: "#0f172a" }}>
        {bellIcon}
      </Link>
      <Link to="/account" aria-label="Account"
        style={{ ...circle, background: "#6d3ae6", color: "#fff", font: "700 14px 'DM Sans', sans-serif" }}>
        {initials}
      </Link>
    </nav>
  );
}
