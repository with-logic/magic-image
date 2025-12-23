/**
 * @with-logic/magic-image
 *
 * A React component for AI-powered image generation with an in-browser dev overlay.
 *
 * @example
 * ```tsx
 * import { MagicImage, MagicImageProvider } from "@with-logic/magic-image";
 * import "@with-logic/magic-image/styles.css";
 *
 * // Wrap your app with the provider
 * <MagicImageProvider
 *   devMode={process.env.NODE_ENV === "development"}
 *   generateImage={async ({ prompt, aspectRatio }) => {
 *     const res = await fetch("/api/generate-image", {
 *       method: "POST",
 *       body: JSON.stringify({ prompt, aspectRatio }),
 *     });
 *     return res.json();
 *   }}
 *   saveImage={async ({ imageData, targetPath }) => {
 *     const res = await fetch("/api/save-image", {
 *       method: "POST",
 *       body: JSON.stringify({ imageData, targetPath }),
 *     });
 *     return res.json();
 *   }}
 * >
 *   <App />
 * </MagicImageProvider>
 *
 * // Use the component
 * <MagicImage
 *   src="/images/hero.jpg"
 *   alt="Hero image"
 *   prompt="A minimalist illustration of a workspace"
 * />
 * ```
 */

// Main component
export { MagicImage } from "./MagicImage";

// Provider and hooks
export {
  MagicImageProvider,
  useMagicImage,
  useMagicImageConfig,
} from "./MagicImageProvider";

// Savers
export { createBrowserDownloadSaver } from "./savers";

// Types
export type {
  MagicImageProps,
  MagicImageConfig,
  GenerateImageHandler,
  SaveImageHandler,
  RefinePromptHandler,
  ImageState,
} from "./types";
