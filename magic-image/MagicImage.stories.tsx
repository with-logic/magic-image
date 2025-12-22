import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { MagicImage } from "./MagicImage";
import { MagicImageProvider } from "./MagicImageProvider";
import type { GenerateImageHandler, SaveImageHandler } from "./types";

// Sample placeholder images
const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop";

// Mock handlers
const mockGenerateImage: GenerateImageHandler = async ({ aspectRatio }) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Return different sample images based on aspect ratio
  const images = {
    "4:3":
      "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&h=600&fit=crop",
    "16:9":
      "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1600&h=900&fit=crop",
  };

  return { imageUrl: images[aspectRatio] || images["4:3"] };
};

const mockGenerateMultipleImages: GenerateImageHandler = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const images = [
    "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop",
  ];
  const randomIndex = Math.floor(Math.random() * images.length);
  return { imageUrl: images[randomIndex] };
};

const mockSaveImage: SaveImageHandler = async ({ targetPath }) => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  console.log("Saving image to:", targetPath);
  return { success: true, savedPath: targetPath };
};

const mockGenerateError: GenerateImageHandler = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  throw new Error("Failed to generate image: API rate limit exceeded");
};

function MagicImageWrapper({
  generateImage = mockGenerateImage,
  devMode = true,
  ...props
}: {
  generateImage?: GenerateImageHandler;
  devMode?: boolean;
  src?: string;
  alt?: string;
  prompt?: string;
  aspectRatio?: "4:3" | "16:9";
  className?: string;
}) {
  return (
    <MagicImageProvider
      devMode={devMode}
      generateImage={generateImage}
      saveImage={mockSaveImage}
    >
      <MagicImage
        src={props.src ?? PLACEHOLDER_IMAGE}
        alt={props.alt ?? "Demo image"}
        prompt={props.prompt ?? "A colorful abstract gradient background"}
        className={props.className ?? "w-[600px] rounded-lg"}
        aspectRatio={props.aspectRatio}
      />
    </MagicImageProvider>
  );
}

const meta: Meta<typeof MagicImage> = {
  title: "Components/MagicImage",
  component: MagicImage,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof MagicImage>;

export const ProductionMode: Story = {
  render: () => (
    <MagicImageWrapper devMode={false} prompt="This prompt won't show" />
  ),
  parameters: {
    docs: {
      description: {
        story:
          "In production mode (devMode: false), MagicImage renders as a standard img element without any overlay.",
      },
    },
  },
};

export const DevModeEnabled: Story = {
  render: () => <MagicImageWrapper />,
  parameters: {
    docs: {
      description: {
        story:
          "With devMode enabled, hover over the image to see generation controls. Click 'Generate' to create a new image.",
      },
    },
  },
};

export const WithCustomPrompt: Story = {
  render: () => (
    <MagicImageWrapper prompt="A serene mountain landscape at sunset with dramatic clouds" />
  ),
};

export const AspectRatio16x9: Story = {
  render: () => (
    <MagicImageWrapper
      aspectRatio="16:9"
      prompt="A wide cinematic landscape"
      className="w-[800px] rounded-lg"
    />
  ),
};

export const AspectRatio4x3: Story = {
  render: () => (
    <MagicImageWrapper
      aspectRatio="4:3"
      prompt="A balanced composition"
      className="w-[600px] rounded-lg"
    />
  ),
};

export const ErrorState: Story = {
  render: () => <MagicImageWrapper generateImage={mockGenerateError} />,
  parameters: {
    docs: {
      description: {
        story:
          "Click 'Generate' to see how errors are displayed when image generation fails.",
      },
    },
  },
};

export const MultipleImages: Story = {
  render: () => (
    <MagicImageWrapper generateImage={mockGenerateMultipleImages} />
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Increase the count before generating to create multiple images. Use the carousel arrows to navigate between them.",
      },
    },
  },
};

export const WithReferenceImage: Story = {
  render: () => (
    <MagicImageWrapper prompt="Transform this into a watercolor painting style" />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Click "Edit Prompt" to open the prompt editor where you can upload a reference image.',
      },
    },
  },
};

// Full integration demo
function FullIntegrationDemo() {
  const [savedImages, setSavedImages] = useState<string[]>([]);

  const handleSave: SaveImageHandler = async ({ targetPath }) => {
    setSavedImages((prev) => [...prev, targetPath]);
    return { success: true, savedPath: targetPath };
  };

  return (
    <div className="space-y-6">
      <MagicImageProvider
        devMode={true}
        generateImage={mockGenerateMultipleImages}
        saveImage={handleSave}
      >
        <div className="grid grid-cols-2 gap-4">
          <MagicImage
            src="/images/hero.jpg"
            alt="Hero image"
            prompt="A modern tech startup office with plants"
            className="w-full rounded-lg"
          />
          <MagicImage
            src="/images/feature.jpg"
            alt="Feature image"
            prompt="An abstract representation of AI and creativity"
            className="w-full rounded-lg"
          />
        </div>
      </MagicImageProvider>

      {savedImages.length > 0 && (
        <div className="p-4 bg-green-50 rounded-lg">
          <h4 className="font-medium text-green-800">Saved Images:</h4>
          <ul className="text-sm text-green-600">
            {savedImages.map((path, i) => (
              <li key={i}>{path}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export const FullIntegration: Story = {
  render: () => <FullIntegrationDemo />,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story:
          "Complete workflow demonstration with multiple MagicImage components sharing a provider. Generate and save images to see the full flow.",
      },
    },
  },
};
