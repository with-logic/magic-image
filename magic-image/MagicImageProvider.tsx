import { createContext, useContext, type ReactNode } from "react";
import type { MagicImageConfig } from "./types";

const MagicImageContext = createContext<MagicImageConfig | undefined>(
  undefined,
);

interface MagicImageProviderProps extends MagicImageConfig {
  children: ReactNode;
}

/**
 * Provider component that supplies configuration to all MagicImage components.
 *
 * @example
 * ```tsx
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
 * ```
 */
export function MagicImageProvider({
  children,
  generateImage,
  saveImage,
  refinePrompt,
  devMode = false,
}: MagicImageProviderProps) {
  return (
    <MagicImageContext.Provider
      value={{ generateImage, saveImage, refinePrompt, devMode }}
    >
      {children}
    </MagicImageContext.Provider>
  );
}

/**
 * Hook to access the MagicImage configuration from context.
 * Returns undefined if used outside of a MagicImageProvider.
 */
export function useMagicImageConfig(): MagicImageConfig | undefined {
  return useContext(MagicImageContext);
}

/**
 * Hook to access the MagicImage configuration, throwing if not in a provider.
 * Use this when you require the config to be present.
 */
export function useMagicImage(): MagicImageConfig {
  const context = useContext(MagicImageContext);
  if (context === undefined) {
    throw new Error("useMagicImage must be used within a MagicImageProvider");
  }
  return context;
}
