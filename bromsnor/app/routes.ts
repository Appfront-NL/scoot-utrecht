import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("map", "routes/map.tsx"),
  route("componenten", "routes/componenten.tsx"),
  route("settings", "components/scoot/SettingsScreen.tsx"),
] satisfies RouteConfig;
