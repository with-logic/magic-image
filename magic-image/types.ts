import type { ComponentPropsWithoutRef } from "react";

type ImgProps = ComponentPropsWithoutRef<"img">;

/**
 * Handler for generating images from a prompt
 */
export interface GenerateImageHandler {
  (options: {
    prompt: string;
    aspectRatio: "4:3" | "16:9";
    /** Optional reference image as base64 data URL for visual inspiration */
    referenceImage?: string;
  }): Promise<{ imageUrl: string }>;
}

/**
 * Optional handler for refining prompts before generation (e.g., using an LLM)
 */
export interface RefinePromptHandler {
  (prompt: string): Promise<string>;
}

/**
 * Handler for saving generated images
 */
export interface SaveImageHandler {
  (options: {
    imageData: string;
    targetPath: string;
  }): Promise<{ success: boolean; savedPath?: string }>;
}

/**
 * Configuration for the MagicImageProvider
 */
export interface MagicImageConfig {
  /** Handler to generate images - required */
  generateImage: GenerateImageHandler;
  /** Handler to save images - required */
  saveImage: SaveImageHandler;
  /** Optional handler to refine prompts before generation */
  refinePrompt?: RefinePromptHandler;
  /** Enable dev mode (shows generate/save overlay) */
  devMode?: boolean;
}

/**
 * Props for the MagicImage component
 */
export interface MagicImageProps extends Omit<ImgProps, "src" | "alt"> {
  /** Path to the image (used for display and as save target) */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Prompt for image generation (required for dev overlay to appear) */
  prompt?: string;
  /** Aspect ratio for generated images */
  aspectRatio?: "4:3" | "16:9";
  /** Override devMode from provider for this specific image */
  devMode?: boolean;
}

export type ImageState = "idle" | "generating" | "preview";
