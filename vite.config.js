import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Deployed as a GitHub user site, so the app is served from the domain root.
export default defineConfig({
  plugins: [react()],
  base: "/",
  build: {
    outDir: "dist",
    assetsDir: "assets",
    // Anything under 2kb rides along inside the bundle instead of costing a request.
    assetsInlineLimit: 2048,
    // One page, one stylesheet. Keeps the first paint free of style flashes.
    cssCodeSplit: false,
    sourcemap: false,
    rollupOptions: {
      output: {
        // React changes far less often than the portfolio does, so it gets its
        // own chunk and stays in the visitor's cache across deploys.
        codeSplitting: {
          groups: [{ name: "react", test: /[\\/]node_modules[\\/]/ }],
        },
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  preview: {
    port: 4173,
  },
});
