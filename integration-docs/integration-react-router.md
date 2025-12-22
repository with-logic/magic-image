# Integrating magic-image with React Router

This guide walks you through adding `@with-logic/magic-image` to a React Router project from scratch.

## Prerequisites

- Node.js 18+
- A React Router project (v6 or v7)
- A Replicate API key (get one at [replicate.com](https://replicate.com))

## Step 1: Install the package

```bash
npm install @with-logic/magic-image
```

If you plan to use the built-in Replicate generator, also install the Replicate SDK:

```bash
npm install replicate
```

## Step 2: Set up environment variables

Create or update your `.env` file:

```env
REPLICATE_API_KEY=r8_your_api_key_here
```

Add `.env` to your `.gitignore` if not already present.

## Step 3: Configure the provider

Wrap your app with `MagicImageProvider`. In React Router, this typically goes in your root layout or entry point.

**app/root.tsx** (or your root layout file):

```tsx
import {
  MagicImageProvider,
  createBrowserDownloadSaver,
} from "@with-logic/magic-image";
import { createReplicateGenerator } from "@with-logic/magic-image/replicate";
import "@with-logic/magic-image/styles.css";

// Create the image generator (uses FLUX model by default)
const generateImage = createReplicateGenerator({
  apiKey: import.meta.env.VITE_REPLICATE_API_KEY,
});

// Create the save handler (triggers browser download)
const saveImage = createBrowserDownloadSaver();

export default function Root() {
  return (
    <MagicImageProvider
      devMode={import.meta.env.DEV}
      generateImage={generateImage}
      saveImage={saveImage}
    >
      {/* Your app content / Outlet */}
    </MagicImageProvider>
  );
}
```

> **Note**: Update your `.env` variable name to `VITE_REPLICATE_API_KEY` for Vite-based React Router projects. The `VITE_` prefix exposes it to client code.

## Step 4: Use the MagicImage component

Replace any `<img>` tag with `<MagicImage>` and add a `prompt` prop:

```tsx
import { MagicImage } from "@with-logic/magic-image";

export function HeroSection() {
  return (
    <section>
      <h1>Welcome to Our App</h1>
      <MagicImage
        src="/images/hero.jpg"
        alt="Hero illustration"
        prompt="A modern, minimalist illustration of a collaborative workspace with people using laptops"
        aspectRatio="16:9"
      />
    </section>
  );
}
```

## Step 5: Generate your first image

1. Start your dev server: `npm run dev`
2. Navigate to the page with your `MagicImage` component
3. Hover over the image to reveal the dev overlay
4. Click **Generate** to create a new image
5. Use the carousel to browse generated images (if you generated multiple)
6. Click **Save** to download the image to your machine

## Configuration Options

### MagicImageProvider Props

| Prop            | Type                   | Required | Description                                            |
| --------------- | ---------------------- | -------- | ------------------------------------------------------ |
| `devMode`       | `boolean`              | No       | Enables the generation overlay. Default: `false`       |
| `generateImage` | `GenerateImageHandler` | Yes      | Function that generates images from prompts            |
| `saveImage`     | `SaveImageHandler`     | Yes      | Function that saves/downloads images                   |
| `refinePrompt`  | `RefinePromptHandler`  | No       | Optional function to enhance prompts before generation |

### MagicImage Props

| Prop          | Type              | Required | Description                                                  |
| ------------- | ----------------- | -------- | ------------------------------------------------------------ |
| `src`         | `string`          | Yes      | Path to the image (used for display and as save target)      |
| `alt`         | `string`          | Yes      | Alt text for accessibility                                   |
| `prompt`      | `string`          | No       | Prompt for image generation (required for overlay to appear) |
| `aspectRatio` | `"4:3" \| "16:9"` | No       | Aspect ratio for generated images                            |
| `devMode`     | `boolean`         | No       | Override provider's devMode for this specific image          |

## Advanced: Custom Generate/Save Handlers

If you need server-side generation or custom save behavior, implement your own handlers:

```tsx
const generateImage = async ({ prompt, aspectRatio, referenceImage }) => {
  const response = await fetch("/api/generate-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, aspectRatio, referenceImage }),
  });
  return response.json(); // Must return { imageUrl: string }
};

const saveImage = async ({ imageData, targetPath }) => {
  const response = await fetch("/api/save-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageData, targetPath }),
  });
  return response.json(); // Must return { success: boolean, savedPath?: string }
};
```

## Advanced: Prompt Refinement

Use an LLM to enhance prompts before generation:

```tsx
const refinePrompt = async (prompt: string) => {
  const response = await fetch("/api/refine-prompt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  const { refinedPrompt } = await response.json();
  return refinedPrompt;
};

<MagicImageProvider
  devMode={import.meta.env.DEV}
  generateImage={generateImage}
  saveImage={saveImage}
  refinePrompt={refinePrompt}
>
```

## Troubleshooting

### Overlay doesn't appear

- Ensure `devMode` is `true` (check `import.meta.env.DEV` is working)
- Ensure the `prompt` prop is set on the `MagicImage` component

### API key not working

- Verify the environment variable name matches your bundler's requirements (`VITE_` prefix for Vite)
- Restart your dev server after changing `.env`

### Images not generating

- Check the browser console for errors
- Verify your Replicate API key is valid and has credits
- Ensure `replicate` package is installed

### CORS errors when saving

- The browser download saver fetches remote URLs; ensure the image host allows CORS
- Alternatively, proxy the image through your server
