# Integrating magic-image with Plain React / Vite

This guide covers setting up `@with-logic/magic-image` in a standard React project using Vite, Create React App, or similar bundlers.

## Prerequisites

- Node.js 18+
- A React 18+ project
- A Replicate API key (get one at [replicate.com](https://replicate.com))

## Step 1: Install the package

```bash
npm install @with-logic/magic-image replicate
```

## Step 2: Set up environment variables

### Vite

Create or update your `.env` file:

```env
VITE_REPLICATE_API_KEY=r8_your_api_key_here
```

### Create React App

```env
REACT_APP_REPLICATE_API_KEY=r8_your_api_key_here
```

Add `.env` to your `.gitignore` if not already present.

## Step 3: Configure the provider

Wrap your app with `MagicImageProvider` in your entry point.

**src/main.tsx** (Vite) or **src/index.tsx** (CRA):

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import {
  MagicImageProvider,
  createBrowserDownloadSaver,
} from "@with-logic/magic-image";
import { createReplicateGenerator } from "@with-logic/magic-image/replicate";
import "@with-logic/magic-image/styles.css";

// Create the image generator
const generateImage = createReplicateGenerator({
  // Vite
  apiKey: import.meta.env.VITE_REPLICATE_API_KEY,
  // CRA: apiKey: process.env.REACT_APP_REPLICATE_API_KEY,
});

// Create the save handler
const saveImage = createBrowserDownloadSaver();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MagicImageProvider
      devMode={import.meta.env.DEV} // CRA: process.env.NODE_ENV === "development"
      generateImage={generateImage}
      saveImage={saveImage}
    >
      <App />
    </MagicImageProvider>
  </React.StrictMode>,
);
```

## Step 4: Use the MagicImage component

Replace `<img>` tags with `<MagicImage>` and add a `prompt` prop:

```tsx
import { MagicImage } from "@with-logic/magic-image";

function App() {
  return (
    <div>
      <h1>My App</h1>
      <MagicImage
        src="/images/hero.jpg"
        alt="Hero illustration"
        prompt="A vibrant illustration of a creative workspace with plants and natural lighting"
        aspectRatio="16:9"
      />
    </div>
  );
}

export default App;
```

## Step 5: Generate your first image

1. Start your dev server: `npm run dev`
2. Navigate to the page with your `MagicImage` component
3. Hover over the image to reveal the dev overlay
4. Click **Generate** to create a new image
5. Use the carousel to browse multiple generated images
6. Click **Save** to download the image

## Alternative: Server-Side Generation

For production use or to keep your API key secure, you can proxy requests through your own API:

```tsx
const generateImage = async ({ prompt, aspectRatio, referenceImage }) => {
  const response = await fetch("/api/generate-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, aspectRatio, referenceImage }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate image");
  }

  return response.json();
};
```

Then implement the `/api/generate-image` endpoint on your backend to call Replicate with your server-side API key.

## Alternative: File System Save (Development)

If you're running a local dev server with file system access, you can implement a save handler that writes files:

```tsx
const saveImage = async ({ imageData, targetPath }) => {
  const response = await fetch("/api/save-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageData, targetPath }),
  });

  return response.json();
};
```

## Troubleshooting

### Overlay doesn't appear

- Ensure `devMode` is `true`
- Ensure the `prompt` prop is set on the `MagicImage` component
- Check that styles are imported: `import "@with-logic/magic-image/styles.css"`

### Environment variables not working

- **Vite**: Variables must start with `VITE_`
- **CRA**: Variables must start with `REACT_APP_`
- Restart your dev server after changing `.env`

### TypeScript errors

Ensure you have the correct types installed:

```bash
npm install -D @types/react @types/react-dom
```

### CORS errors

The browser download saver fetches remote image URLs. If you encounter CORS issues:

1. Use a proxy endpoint on your server
2. Or use a custom save handler that handles the fetch server-side
