import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import RuntimeErrorModal from "@replit/vite-plugin-runtime-error-modal";
import themeConfig from "@replit/vite-plugin-shadcn-theme-json";

export default defineConfig({
  plugins: [react(), RuntimeErrorModal(), themeConfig()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
