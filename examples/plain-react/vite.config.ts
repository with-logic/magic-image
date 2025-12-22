import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api/replicate": {
          target: "https://api.replicate.com",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/replicate/, ""),
          headers: {
            Authorization: `Bearer ${env.VITE_REPLICATE_API_KEY}`,
          },
        },
      },
    },
  };
});
