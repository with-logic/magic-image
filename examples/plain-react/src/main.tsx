import React from "react";
import ReactDOM from "react-dom/client";
import {
  MagicImageProvider,
  createBrowserDownloadSaver,
  type GenerateImageHandler,
} from "@with-logic/magic-image";
import "@with-logic/magic-image/styles.css";
import App from "./App";
import "./index.css";

if (!import.meta.env.VITE_REPLICATE_API_KEY) {
  console.error(
    "Missing VITE_REPLICATE_API_KEY. Copy .env.example to .env and add your Replicate API key.",
  );
}

// Custom generator that uses Vite's proxy to avoid CORS issues
const generateImage: GenerateImageHandler = async ({
  prompt,
  aspectRatio,
  referenceImage,
}) => {
  const model = "black-forest-labs/flux-schnell";

  const input: Record<string, unknown> = {
    prompt,
    aspect_ratio: aspectRatio,
  };

  if (referenceImage) {
    input.image = referenceImage;
  }

  // Use Vite proxy to call Replicate API
  const response = await fetch(
    `/api/replicate/v1/models/${model}/predictions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Prefer: "wait",
      },
      body: JSON.stringify({ input }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Replicate API error: ${error}`);
  }

  const result = await response.json();

  // Handle different output formats
  let imageUrl: string;
  if (Array.isArray(result.output) && result.output.length > 0) {
    imageUrl = result.output[0];
  } else if (typeof result.output === "string") {
    imageUrl = result.output;
  } else {
    throw new Error("Unexpected output format from Replicate");
  }

  return { imageUrl };
};

const saveImage = createBrowserDownloadSaver();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MagicImageProvider
      devMode={import.meta.env.DEV}
      generateImage={generateImage}
      saveImage={saveImage}
    >
      <App />
    </MagicImageProvider>
  </React.StrictMode>,
);
