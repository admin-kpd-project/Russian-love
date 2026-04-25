import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const apiTarget = process.env.VITE_DEV_PROXY_API ?? "http://localhost:8080";
const minioTarget = process.env.VITE_DEV_PROXY_MINIO ?? "http://127.0.0.1:9000";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: apiTarget,
        changeOrigin: true,
      },
      "/s3": {
        target: minioTarget,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/s3/, "") || "/",
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
