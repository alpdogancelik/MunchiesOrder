import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
// runtime error overlay plugin opens its own WS to '/'.
// In middleware mode (Express on :5000), this can collide with our WS routing
// and cause 'Invalid frame header'. Keep it disabled by default.
// import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react(),
    ...(process.env.NODE_ENV !== "production" &&
      process.env.REPL_ID !== undefined
      ? [
        await import("@replit/vite-plugin-cartographer").then((m) =>
          m.cartographer(),
        ),
      ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    // Ensure HMR WS uses a dedicated path when running behind Express middleware
    hmr: {
      path: "/__vite_hmr",
    },
    // When running the client standalone (not through the Express middleware),
    // proxy API requests to the backend server
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
        // Do not rewrite the path; keep /api prefix
        // bypass can be used later to skip in certain envs
      },
    },
  },
});
