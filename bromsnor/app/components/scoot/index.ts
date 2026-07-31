// ============================================================
// SCOOT component kit — one component per file, all independent.
// Import from "~/components/scoot". Live catalog: /componenten.
//
// Styling comes from app/styles/scoot.css (+ profile.css for the
// profile screens); import those once in root.tsx and every
// component here just works.
// ============================================================

// primitives
export { Button } from "./Button";
export { Switch } from "./Switch";
export { BottomSheet } from "./BottomSheet";
export { Stats } from "./Stats";
export { Plate } from "./Plate";
export { Toast, useToast } from "./Toast";

// map chrome
export { TopBar } from "./TopBar";
export { FloatStack } from "./FloatStack";
export { NavBanner } from "./NavBanner";
export { DemoSpeed } from "./DemoSpeed";

// ride flow
export { SearchPanel } from "./SearchPanel";
export { RouteOverview } from "./RouteOverview";
export { RouteCalc } from "./RouteCalc";
export { RideBar } from "./RideBar";
export { ArrivedPanel } from "./ArrivedPanel";

// map sheets
export { LayersSheet } from "./LayersSheet";
export { ZoneDetail } from "./ZoneDetail";
export { WindowExplorer } from "./WindowExplorer";
export { StreetLookup } from "./StreetLookup";

// onboarding
export { AuthScreen } from "./AuthScreen";
export { PlatePicker } from "./PlatePicker";
export { RulesDownload } from "./RulesDownload";
export { RulesScreen } from "./RulesScreen";
export { OnboardingFlow } from "./OnboardingFlow";

// profile screens (design 17/18/30/34/35/36/37)
export { AccountScreen } from "./AccountScreen";
export { RideHistoryScreen } from "./RideHistoryScreen";
export { SettingsScreen } from "./SettingsScreen";
export { NotificationsScreen } from "./NotificationsScreen";
export { AchievementsScreen } from "./AchievementsScreen";
export { RuleChangesScreen } from "./RuleChangesScreen";
export { OfflineMapScreen } from "./OfflineMapScreen";
export { ProfileStack } from "./ProfileStack";

// integrations
export { Warning, useWarning } from "./Warning";
export { useWrapped } from "./hooks";

// shared types
export type { Destination, ZoneProps, BannerState, LayerState } from "./types";
