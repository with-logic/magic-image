import { defineConfig } from "tsup";
import { copyFileSync } from "fs";

export default defineConfig({
  entry: {
    index: "magic-image/index.ts",
    replicate: "magic-image/replicate.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom", "replicate"],
  treeshake: true,
  onSuccess: async () => {
    // Copy CSS after each build (works in both build and watch mode)
    copyFileSync("magic-image/styles.css", "dist/styles.css");
    console.log("CSS copied to dist/styles.css");
  },
});
