# @with-logic/magic-image

AI-powered image generation with an in-browser dev overlay for React.

Generate, preview, and save AI images directly in your development environment. Perfect for rapidly iterating on content imagery during development.

## Installation

```bash
npm install @with-logic/magic-image
```

For the built-in Replicate generator:

```bash
npm install replicate
```

## Quick Start

```tsx
import {
  MagicImage,
  MagicImageProvider,
  createBrowserDownloadSaver,
} from "@with-logic/magic-image";
import { createReplicateGenerator } from "@with-logic/magic-image/replicate";
import "@with-logic/magic-image/styles.css";

const generateImage = createReplicateGenerator({
  apiKey: import.meta.env.VITE_REPLICATE_API_KEY,
});

const saveImage = createBrowserDownloadSaver();

function App() {
  return (
    <MagicImageProvider
      devMode={import.meta.env.DEV}
      generateImage={generateImage}
      saveImage={saveImage}
    >
      <MagicImage
        src="/images/hero.jpg"
        alt="Hero image"
        prompt="A minimalist illustration of a modern workspace"
        aspectRatio="16:9"
      />
    </MagicImageProvider>
  );
}
```

## API Reference

### MagicImage

The main component that displays images and provides the dev overlay for generation.

```tsx
<MagicImage
  src="/images/hero.jpg"
  alt="Hero image"
  prompt="A minimalist illustration of a modern workspace"
  aspectRatio="16:9"
  devMode={true}
/>
```

| Prop          | Type              | Required | Description                                                  |
| ------------- | ----------------- | -------- | ------------------------------------------------------------ |
| `src`         | `string`          | Yes      | Path to the image (used for display and as save target)      |
| `alt`         | `string`          | Yes      | Alt text for accessibility                                   |
| `prompt`      | `string`          | No       | Prompt for image generation (required for overlay to appear) |
| `aspectRatio` | `"4:3" \| "16:9"` | No       | Aspect ratio for generated images. Default: `"4:3"`          |
| `devMode`     | `boolean`         | No       | Override provider's devMode for this specific image          |

All standard `<img>` props are also supported.

### MagicImageProvider

Provider component that supplies configuration to all `MagicImage` components.

```tsx
<MagicImageProvider
  devMode={process.env.NODE_ENV === "development"}
  generateImage={generateImage}
  saveImage={saveImage}
  refinePrompt={refinePrompt}
>
  <App />
</MagicImageProvider>
```

| Prop            | Type                   | Required | Description                                            |
| --------------- | ---------------------- | -------- | ------------------------------------------------------ |
| `devMode`       | `boolean`              | No       | Enables the generation overlay. Default: `false`       |
| `generateImage` | `GenerateImageHandler` | Yes      | Function that generates images from prompts            |
| `saveImage`     | `SaveImageHandler`     | Yes      | Function that saves/downloads images                   |
| `refinePrompt`  | `RefinePromptHandler`  | No       | Optional function to enhance prompts before generation |

### Hooks

#### useMagicImage

Returns the MagicImage configuration. Throws if used outside a provider.

```tsx
import { useMagicImage } from "@with-logic/magic-image";

function MyComponent() {
  const { generateImage, saveImage, devMode } = useMagicImage();
  // ...
}
```

#### useMagicImageConfig

Returns the MagicImage configuration or `undefined` if outside a provider.

```tsx
import { useMagicImageConfig } from "@with-logic/magic-image";

function MyComponent() {
  const config = useMagicImageConfig();
  if (!config) {
    return <div>Not in provider</div>;
  }
  // ...
}
```

### Generators

#### createReplicateGenerator

Creates an image generator using Replicate's API with FLUX as the default model.

```tsx
import { createReplicateGenerator } from "@with-logic/magic-image/replicate";

const generateImage = createReplicateGenerator({
  apiKey: process.env.REPLICATE_API_KEY!,
  model: "black-forest-labs/flux-schnell", // optional
});
```

| Option   | Type     | Required | Description                                                   |
| -------- | -------- | -------- | ------------------------------------------------------------- |
| `apiKey` | `string` | Yes      | Your Replicate API key                                        |
| `model`  | `string` | No       | Model identifier. Default: `"black-forest-labs/flux-schnell"` |

### Savers

#### createBrowserDownloadSaver

Creates a save handler that triggers the browser's native download dialog.

```tsx
import { createBrowserDownloadSaver } from "@with-logic/magic-image";

const saveImage = createBrowserDownloadSaver({
  getFilename: (targetPath) => targetPath.split("/").pop() ?? "image.png",
});
```

| Option        | Type                             | Required | Description                                  |
| ------------- | -------------------------------- | -------- | -------------------------------------------- |
| `getFilename` | `(targetPath: string) => string` | No       | Custom function to derive filename from path |

### Custom Handlers

You can implement custom generate and save handlers:

```tsx
// Custom generate handler
const generateImage: GenerateImageHandler = async ({
  prompt,
  aspectRatio,
  referenceImage,
}) => {
  const response = await fetch("/api/generate-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, aspectRatio, referenceImage }),
  });
  return response.json(); // Must return { imageUrl: string }
};

// Custom save handler
const saveImage: SaveImageHandler = async ({ imageData, targetPath }) => {
  const response = await fetch("/api/save-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageData, targetPath }),
  });
  return response.json(); // Must return { success: boolean, savedPath?: string }
};

// Optional prompt refinement
const refinePrompt: RefinePromptHandler = async (prompt) => {
  const response = await fetch("/api/refine-prompt", {
    method: "POST",
    body: JSON.stringify({ prompt }),
  });
  const { refinedPrompt } = await response.json();
  return refinedPrompt;
};
```

### Types

```tsx
import type {
  MagicImageProps,
  MagicImageConfig,
  GenerateImageHandler,
  SaveImageHandler,
  RefinePromptHandler,
  ImageState,
} from "@with-logic/magic-image";
```

## Integration Guides

- [Plain React / Vite](docs/integration-plain-react.md)
- [React Router](docs/integration-react-router.md)
- [Next.js](docs/integration-nextjs.md)

## License

MIT
