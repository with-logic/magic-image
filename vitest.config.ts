import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Stub replicate for tests since it's an optional peer dependency
      replicate: resolve(__dirname, "magic-image/__mocks__/replicate.ts"),
    },
  },
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["magic-image/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["magic-image/**/*.{ts,tsx}"],
      exclude: [
        "magic-image/**/*.test.{ts,tsx}",
        "magic-image/**/*.stories.{ts,tsx}",
      ],
    },
  },
});
