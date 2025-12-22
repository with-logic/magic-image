# Integrating magic-image with Next.js

This guide covers setting up `@with-logic/magic-image` in a Next.js project, including both App Router and Pages Router patterns.

## Prerequisites

- Node.js 18+
- Next.js 13+ (App Router) or Next.js 12+ (Pages Router)
- A Replicate API key (get one at [replicate.com](https://replicate.com))

## Step 1: Install the package

```bash
npm install @with-logic/magic-image replicate
```

## Step 2: Set up environment variables

Create or update your `.env.local` file:

```env
# Server-side only (recommended for security)
REPLICATE_API_KEY=r8_your_api_key_here

# Client-side (only if using client-side generation)
NEXT_PUBLIC_REPLICATE_API_KEY=r8_your_api_key_here
```

## Step 3: Create an API route for image generation

This keeps your API key secure on the server.

### App Router (app/api/generate-image/route.ts)

```ts
import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY,
});

export async function POST(request: Request) {
  const { prompt, aspectRatio, referenceImage } = await request.json();

  const input: Record<string, unknown> = {
    prompt,
    aspect_ratio: aspectRatio,
  };

  if (referenceImage) {
    input.image = referenceImage;
  }

  const output = await replicate.run("black-forest-labs/flux-schnell", {
    input,
  });

  const imageUrl = Array.isArray(output) ? output[0] : output;

  return NextResponse.json({ imageUrl });
}
```

### Pages Router (pages/api/generate-image.ts)

```ts
import type { NextApiRequest, NextApiResponse } from "next";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY!,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt, aspectRatio, referenceImage } = req.body;

  const input: Record<string, unknown> = {
    prompt,
    aspect_ratio: aspectRatio,
  };

  if (referenceImage) {
    input.image = referenceImage;
  }

  const output = await replicate.run("black-forest-labs/flux-schnell", {
    input,
  });

  const imageUrl = Array.isArray(output) ? output[0] : output;

  res.json({ imageUrl });
}
```

## Step 4: Configure the provider

### App Router

Create a client component for the provider:

**app/providers.tsx**

```tsx
"use client";

import {
  MagicImageProvider,
  createBrowserDownloadSaver,
} from "@with-logic/magic-image";
import "@with-logic/magic-image/styles.css";

const generateImage = async ({
  prompt,
  aspectRatio,
  referenceImage,
}: {
  prompt: string;
  aspectRatio: string;
  referenceImage?: string;
}) => {
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

const saveImage = createBrowserDownloadSaver();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MagicImageProvider
      devMode={process.env.NODE_ENV === "development"}
      generateImage={generateImage}
      saveImage={saveImage}
    >
      {children}
    </MagicImageProvider>
  );
}
```

**app/layout.tsx**

```tsx
import { Providers } from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### Pages Router

**pages/\_app.tsx**

```tsx
import type { AppProps } from "next/app";
import {
  MagicImageProvider,
  createBrowserDownloadSaver,
} from "@with-logic/magic-image";
import "@with-logic/magic-image/styles.css";

const generateImage = async ({
  prompt,
  aspectRatio,
  referenceImage,
}: {
  prompt: string;
  aspectRatio: string;
  referenceImage?: string;
}) => {
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

const saveImage = createBrowserDownloadSaver();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MagicImageProvider
      devMode={process.env.NODE_ENV === "development"}
      generateImage={generateImage}
      saveImage={saveImage}
    >
      <Component {...pageProps} />
    </MagicImageProvider>
  );
}
```

## Step 5: Use the MagicImage component

### App Router (Client Component)

```tsx
"use client";

import { MagicImage } from "@with-logic/magic-image";

export function HeroImage() {
  return (
    <MagicImage
      src="/images/hero.jpg"
      alt="Hero illustration"
      prompt="A modern tech illustration with abstract shapes and gradients"
      aspectRatio="16:9"
    />
  );
}
```

### Pages Router

```tsx
import { MagicImage } from "@with-logic/magic-image";

export default function Home() {
  return (
    <main>
      <h1>Welcome</h1>
      <MagicImage
        src="/images/hero.jpg"
        alt="Hero illustration"
        prompt="A modern tech illustration with abstract shapes and gradients"
        aspectRatio="16:9"
      />
    </main>
  );
}
```

## Step 6: Generate your first image

1. Start your dev server: `npm run dev`
2. Navigate to the page with your `MagicImage` component
3. Hover over the image to reveal the dev overlay
4. Click **Generate** to create a new image
5. Click **Save** to download the image

## Advanced: Server-Side Image Saving

To save images directly to your project's public folder during development:

**app/api/save-image/route.ts** (App Router)

```ts
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  const { imageData, targetPath } = await request.json();

  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { success: false, error: "Only available in development" },
      { status: 403 },
    );
  }

  try {
    // Fetch the image
    const response = await fetch(imageData);
    const buffer = Buffer.from(await response.arrayBuffer());

    // Save to public folder
    const fullPath = path.join(process.cwd(), "public", targetPath);
    await writeFile(fullPath, buffer);

    return NextResponse.json({ success: true, savedPath: targetPath });
  } catch (error) {
    console.error("Failed to save image:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
```

Then update your save handler:

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

### "use client" errors

`MagicImage` is a client component. In App Router, either:

- Add `"use client"` to the file using it
- Wrap it in a client component

### Hydration mismatches

Ensure the `devMode` value is consistent between server and client. Using `process.env.NODE_ENV === "development"` works because it's resolved at build time.

### API route not found

- **App Router**: Ensure file is at `app/api/generate-image/route.ts`
- **Pages Router**: Ensure file is at `pages/api/generate-image.ts`

### CORS errors when saving images

Remote image URLs may have CORS restrictions. Use the server-side save approach above to proxy the image fetch through your API.
