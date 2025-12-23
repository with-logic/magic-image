import type { SaveImageHandler } from "../types";

interface BrowserDownloadSaverOptions {
  /** Custom function to derive filename from target path */
  getFilename?: (targetPath: string) => string;
  /** Output format for the image. Default: 'jpeg' */
  format?: "jpeg" | "png" | "webp";
  /** Quality for JPEG/WebP output (0-1). Default: 0.92 */
  quality?: number;
}

/**
 * Converts a blob to a different image format using canvas
 */
async function convertImageFormat(
  blob: Blob,
  format: "jpeg" | "png" | "webp",
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      // Fill with white background for JPEG (no transparency support)
      if (format === "jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (newBlob) => {
          if (newBlob) {
            resolve(newBlob);
          } else {
            reject(new Error("Failed to convert image"));
          }
        },
        `image/${format}`,
        quality,
      );
    };
    img.onerror = () =>
      reject(new Error("Failed to load image for conversion"));
    img.src = URL.createObjectURL(blob);
  });
}

/**
 * Creates a browser download save handler that triggers the native file save dialog.
 *
 * @example
 * ```typescript
 * import { createBrowserDownloadSaver } from "@with-logic/magic-image";
 *
 * const saveImage = createBrowserDownloadSaver({
 *   format: "jpeg",
 *   quality: 0.9,
 *   getFilename: (targetPath) => targetPath.split("/").pop() ?? "image.jpg",
 * });
 * ```
 */
export function createBrowserDownloadSaver(
  options: BrowserDownloadSaverOptions = {},
): SaveImageHandler {
  const {
    getFilename = (path) => path.split("/").pop() ?? "image.jpg",
    format = "jpeg",
    quality = 0.92,
  } = options;

  return async ({ imageData, targetPath }) => {
    try {
      let blob: Blob;

      if (imageData.startsWith("data:")) {
        // Base64 data URL
        const response = await fetch(imageData);
        blob = await response.blob();
      } else if (
        imageData.startsWith("http://") ||
        imageData.startsWith("https://")
      ) {
        // Remote URL - fetch and convert to blob
        const response = await fetch(imageData);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        blob = await response.blob();
      } else {
        throw new Error("Invalid image data format");
      }

      // Convert to desired format
      blob = await convertImageFormat(blob, format, quality);

      // Create download link
      const url = URL.createObjectURL(blob);
      let filename = getFilename(targetPath);

      // Ensure filename has correct extension
      const ext = `.${format === "jpeg" ? "jpg" : format}`;
      if (!filename.toLowerCase().endsWith(ext)) {
        filename = filename.replace(/\.[^.]+$/, ext);
      }

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup
      URL.revokeObjectURL(url);

      return { success: true, savedPath: filename };
    } catch (error) {
      console.error("Failed to download image:", error);
      return { success: false };
    }
  };
}
