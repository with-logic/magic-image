# Magic Image - Plain React Example

A fully working example of `@with-logic/magic-image` using Vite and React.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment file and add your Replicate API key:

```bash
cp .env.example .env
```

Edit `.env` and add your API key from [replicate.com/account/api-tokens](https://replicate.com/account/api-tokens):

```env
VITE_REPLICATE_API_KEY=r8_your_actual_api_key
```

3. Start the dev server:

```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Usage

1. Hover over any image to reveal the generation overlay
2. Click **Edit Prompt** to modify the generation prompt
3. Use the number stepper to generate multiple images at once
4. Click **Generate** to create new images using Replicate's FLUX model
5. Browse through generated images using the carousel
6. Click **Save** to download the image to your machine

## What This Example Demonstrates

- Setting up `MagicImageProvider` with a custom image generator
- Using Vite's proxy to call Replicate API (avoids CORS issues)
- Using `createBrowserDownloadSaver` for client-side downloads
- Multiple `MagicImage` components with different prompts and aspect ratios
- Environment variable configuration for API keys

## How It Works

Since browser requests to Replicate's API are blocked by CORS, this example uses Vite's built-in proxy to forward requests:

1. The custom generator in `main.tsx` calls `/api/replicate/...`
2. Vite's dev server proxies these requests to `api.replicate.com`
3. The proxy adds the Authorization header with your API key

This approach keeps your API key secure (it's only used server-side in the proxy) and avoids CORS issues.

## Project Structure

```
src/
  main.tsx      # Provider setup with custom generator using Vite proxy
  App.tsx       # Example MagicImage usage
  index.css     # Basic styling
  vite-env.d.ts # TypeScript env types
vite.config.ts  # Proxy configuration for Replicate API
```
