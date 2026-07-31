import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  base: "/",
  optimizeDeps: {
    // MapLibre spawns a web worker from inside the package; Vite's dep
    // optimizer doesn't emit that worker file, which leaves the map
    // permanently loading (blank canvas). Excluding the package makes
    // Vite serve it as-is, worker included.
    exclude: ["maplibre-gl"],
  },
});
