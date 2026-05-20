import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/UniPam-University-Of-Sierra-Leone-eCampus-E-leaning-/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["img/logo.jpg"],
      manifest: {
        name: "UniPam",
        short_name: "UniPam",
        description: "Smart Hybrid E-Learning Platform",
        theme_color: "#0d2d57",
        icons: [
          {
            src: "img/logo.jpg",
            sizes: "192x192",
            type: "image/jpg",
          },
          {
            src: "img/logo.jpg",
            sizes: "512x512",
            type: "image/jpg",
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
    },
  },
});

