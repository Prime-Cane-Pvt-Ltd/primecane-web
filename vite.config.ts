import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": "/src" },
  },
  build: {
    target: "esnext",
    outDir: "dist",
    cssCodeSplit: true,
    sourcemap: false,
  },
  server: {
    port: 3000,
  },
});
