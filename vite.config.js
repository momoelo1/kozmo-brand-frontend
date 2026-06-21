/* eslint-disable no-undef */
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  return {
    base: mode === "production" ? "/kozmo-brand-frontend/" : "/",

    plugins: [react()],
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/test/setup.js",
      css: false,
    },
    server: {
      host: "0.0.0.0",
      proxy: {
        "/api": {
          target: "http://localhost:3001",
          changeOrigin: true,
          xfwd: true,
          secure: false,
        },
      },
    },
    build: {
      target: ["es2015", "safari11", "firefox60"],
      cssTarget: ["safari11", "firefox60"],
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom", "react-router-dom"],
            redux: ["@reduxjs/toolkit", "react-redux"],
            ui: ["@fortawesome/react-fontawesome"],
          },
        },
      },
    },
  };
});
