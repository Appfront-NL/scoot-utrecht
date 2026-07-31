// ============================================================
// ProfileStack: ready-made composition of the seven profile
// screens as a slide-in navigation stack (React port of the
// vanilla app/lib/profile.js module). Screens stay mounted so
// the profile.css slide transitions play; later pushes get a
// higher z-index so they paint on top. Back button or Escape
// pops one screen at a time; popping the last screen calls
// onClose. Includes the demo toast for the payment and decree
// jokes ("Geld is maar een sociaal construct." / "Opent het
// Gemeenteblad").
// ============================================================

/**
 * Drop-in profile navigation stack. The host owns the `open` flag
 * (avatar button opens the account, bell button opens notifications)
 * and the two host flows (rules screen, Wrapped story) — before
 * either callback fires the whole stack closes itself, like the
 * original module did.
 *
 * @example
 * const [profile, setProfile] = useState<null | "account" | "notifications">(null);
 * <ProfileStack
 *   open={profile !== null}
 *   initial={profile ?? "account"}
 *   onClose={() => setProfile(null)}
 *   onWrapped={() => startWrapped()}
 *   onRules={() => showRules()}
 * />
 */

import { useEffect, useRef, useState } from "react";
import { AccountScreen } from "./AccountScreen";
import { RideHistoryScreen } from "./RideHistoryScreen";
import { SettingsScreen } from "./SettingsScreen";
import { NotificationsScreen } from "./NotificationsScreen";
import { AchievementsScreen } from "./AchievementsScreen";
import { RuleChangesScreen } from "./RuleChangesScreen";
import { OfflineMapScreen } from "./OfflineMapScreen";

type ScreenName =
  | "account"
  | "rides"
  | "settings"
  | "notifications"
  | "achievements"
  | "rulechanges"
  | "offline";

export type ProfileStackProps = {
  /** Whether the stack is shown. Flipping to true (re)opens at `initial`. */
  open: boolean;
  /** Which screen to open with. Defaults to "account". */
  initial?: "account" | "notifications";
  /** Called when the stack has fully popped itself (or closed for a host flow). */
  onClose: () => void;
  /** Host flow: start the Wrapped story. The stack closes itself first. */
  onWrapped?: () => void;
  /** Host flow: show the rules screen. The stack closes itself first. */
  onRules?: () => void;
};

export function ProfileStack({ open, initial = "account", onClose, onWrapped, onRules }: ProfileStackProps) {
  const [stack, setStack] = useState<ScreenName[]>([]);
  // z-indexes are assigned on push and kept after pop, so a popping
  // screen stays on top of the screen below while it slides out.
  const [zMap, setZMap] = useState<Partial<Record<ScreenName, number>>>({});

  // Toast for the demo jokes (payment row, decree links).
  const [toast, setToast] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showToast = (message: string) => {
    setToast(message);
    setToastVisible(true);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastVisible(false), 1800);
  };

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  // Sync the stack with the host's open flag.
  useEffect(() => {
    if (open) {
      setStack([initial]);
      setZMap((z) => ({ ...z, [initial]: 51 }));
    } else {
      setStack([]);
    }
  }, [open, initial]);

  const push = (name: ScreenName) => {
    setStack((s) => {
      if (s.includes(name)) return s;
      setZMap((z) => ({ ...z, [name]: 51 + s.length }));
      return [...s, name];
    });
  };

  const pop = () => {
    setStack((s) => s.slice(0, -1));
    if (stack.length <= 1) onClose();
  };

  // Close everything before handing off to a host flow, so host
  // overlays with a lower z-index are not hidden behind the stack.
  const handOff = (hook?: () => void) => {
    setStack([]);
    onClose();
    hook?.();
  };

  // Escape pops one screen at a time, like the original module.
  useEffect(() => {
    if (!stack.length) return;
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        pop();
      }
    };
    document.addEventListener("keydown", onKeydown);
    return () => document.removeEventListener("keydown", onKeydown);
  });

  const isOpen = (name: ScreenName) => stack.includes(name);

  return (
    <>
      <AccountScreen
        open={isOpen("account")}
        zIndex={zMap.account}
        onBack={pop}
        onRideHistory={() => push("rides")}
        onPayment={() => showToast("Geld is maar een sociaal construct.")}
        onRules={() => handOff(onRules)}
        onSettings={() => push("settings")}
        onAchievements={() => push("achievements")}
        onRuleChanges={() => push("rulechanges")}
        onOfflineMap={() => push("offline")}
        onWrapped={() => handOff(onWrapped)}
      />
      <RideHistoryScreen open={isOpen("rides")} zIndex={zMap.rides} onBack={pop} />
      <SettingsScreen open={isOpen("settings")} zIndex={zMap.settings} onBack={pop} />
      <NotificationsScreen
        open={isOpen("notifications")}
        zIndex={zMap.notifications}
        onBack={pop}
        onWrapped={() => handOff(onWrapped)}
      />
      <AchievementsScreen open={isOpen("achievements")} zIndex={zMap.achievements} onBack={pop} />
      <RuleChangesScreen
        open={isOpen("rulechanges")}
        zIndex={zMap.rulechanges}
        onBack={pop}
        onDecree={() => showToast("Opent het Gemeenteblad")}
      />
      <OfflineMapScreen open={isOpen("offline")} zIndex={zMap.offline} onBack={pop} />
      <div className={"profile-toast" + (toastVisible ? " is-visible" : "")} role="status">
        {toast}
      </div>
    </>
  );
}
