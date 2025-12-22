import type { GenerateImageHandler } from "../types";

interface ReplicateGeneratorOptions {
  /** Replicate API key */
  apiKey: string;
  /** Model identifier (defaults to black-forest-labs/flux-schnell) */
  model?: string;
}

const DEFAULT_MODEL = "black-forest-labs/flux-schnell";

const PROMPT_WRAPPER = `You are generating a content image for a website or application.

Base Image Context: {baseImage}
User Request: {userPrompt}
Aspect Ratio: {aspectRatio}

Generate an image that:
1. Addresses the user's request in the context of the base image
2. Maintains professional quality suitable for web/app content
3. Follows the specified aspect ratio
4. Is visually clean and appropriate for content imagery

If the user request is vague (e.g., "make it better", "improve this"), interpret it as a request to enhance visual clarity, composition, and professional appearance while maintaining the subject matter of the base image.`;

/**
 * Wraps a user prompt with structured context for better LLM results.
 */
function wrapPrompt(
  userPrompt: string,
  aspectRatio: string,
  baseImage?: string,
): string {
  return PROMPT_WRAPPER.replace("{userPrompt}", userPrompt)
    .replace("{aspectRatio}", aspectRatio)
    .replace("{baseImage}", baseImage ?? "None provided");
}

/**
 * Creates a Replicate-based image generator using FLUX as the default model.
 *
 * @example
 * ```typescript
 * import { createReplicateGenerator } from "@with-logic/magic-image/replicate";
 *
 * const generateImage = createReplicateGenerator({
 *   apiKey: process.env.REPLICATE_API_KEY!,
 *   model: "black-forest-labs/flux-schnell", // optional
 * });
 * ```
 */
export function createReplicateGenerator(
  options: ReplicateGeneratorOptions,
): GenerateImageHandler {
  const { apiKey, model = DEFAULT_MODEL } = options;

  return async ({ prompt, aspectRatio, referenceImage }) => {
    // Dynamic import to make replicate an optional peer dependency
    const { default: Replicate } = await import("replicate");

    const replicate = new Replicate({ auth: apiKey });

    // Wrap the prompt with structured context
    const wrappedPrompt = wrapPrompt(prompt, aspectRatio, referenceImage);

    // Map aspect ratio to model-expected format
    const aspectRatioMap: Record<string, string> = {
      "4:3": "4:3",
      "16:9": "16:9",
    };

    const input: Record<string, unknown> = {
      prompt: wrappedPrompt,
      aspect_ratio: aspectRatioMap[aspectRatio] ?? "4:3",
    };

    // Add reference image if provided
    if (referenceImage) {
      input.image = referenceImage;
    }

    const output = await replicate.run(model as `${string}/${string}`, {
      input,
    });

    // Handle different output formats from Replicate
    let imageUrl: string;
    if (Array.isArray(output) && output.length > 0) {
      imageUrl = String(output[0]);
    } else if (typeof output === "string") {
      imageUrl = output;
    } else if (
      output &&
      typeof output === "object" &&
      "url" in output &&
      typeof (output as { url: unknown }).url === "string"
    ) {
      imageUrl = (output as { url: string }).url;
    } else {
      throw new Error("Unexpected output format from Replicate");
    }

    return { imageUrl };
  };
}
