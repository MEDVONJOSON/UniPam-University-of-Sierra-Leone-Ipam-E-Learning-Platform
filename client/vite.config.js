import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["img/unipam-logo.png"],
      manifest: {
        name: "UniPam",
        short_name: "UniPam",
        description: "Smart Hybrid E-Learning Platform",
        theme_color: "#0B5E3C",
        icons: [
          {
            src: "img/unipam-logo.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "img/unipam-logo.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
  preview: {
    allowedHosts: true,
  },
});

