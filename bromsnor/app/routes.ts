import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("map", "routes/map.tsx"),
  route("componenten", "routes/componenten.tsx"),
  route("login", "components/scoot/AuthScreen.tsx"),
  route("settings", "components/scoot/SettingsScreen.tsx"),
  route("account", "components/scoot/AccountScreen.tsx"),
  route("rides", "components/scoot/RideHistoryScreen.tsx"),
  route("notifications", "components/scoot/NotificationsScreen.tsx"),
  route("achievements", "components/scoot/AchievementsScreen.tsx"),
  route("rule-changes", "components/scoot/RuleChangesScreen.tsx"),
  route("offline-map", "components/scoot/OfflineMapScreen.tsx"),
] satisfies RouteConfig;
