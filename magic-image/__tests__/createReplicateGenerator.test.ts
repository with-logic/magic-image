import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockRun } from "../__mocks__/replicate";
import { createReplicateGenerator } from "../generators/replicate";

describe("createReplicateGenerator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRun.mockResolvedValue(["https://example.com/generated.jpg"]);
  });

  it("calls Replicate API with correct parameters", async () => {
    const generateImage = createReplicateGenerator({
      apiKey: "test-api-key",
    });

    await generateImage({
      prompt: "A test image",
      aspectRatio: "16:9",
    });

    expect(mockRun).toHaveBeenCalledWith(
      "black-forest-labs/flux-schnell",
      expect.objectContaining({
        input: expect.objectContaining({
          aspect_ratio: "16:9",
        }),
      }),
    );
  });

  it("uses FLUX model by default", async () => {
    const generateImage = createReplicateGenerator({
      apiKey: "test-api-key",
    });

    await generateImage({
      prompt: "A test image",
      aspectRatio: "4:3",
    });

    expect(mockRun).toHaveBeenCalledWith(
      "black-forest-labs/flux-schnell",
      expect.any(Object),
    );
  });

  it("allows model override", async () => {
    const generateImage = createReplicateGenerator({
      apiKey: "test-api-key",
      model: "stability-ai/sdxl",
    });

    await generateImage({
      prompt: "A test image",
      aspectRatio: "4:3",
    });

    expect(mockRun).toHaveBeenCalledWith(
      "stability-ai/sdxl",
      expect.any(Object),
    );
  });

  it("handles API errors gracefully", async () => {
    mockRun.mockRejectedValue(new Error("API Error"));

    const generateImage = createReplicateGenerator({
      apiKey: "test-api-key",
    });

    await expect(
      generateImage({
        prompt: "A test image",
        aspectRatio: "4:3",
      }),
    ).rejects.toThrow("API Error");
  });

  it("includes prompt wrapper in request", async () => {
    const generateImage = createReplicateGenerator({
      apiKey: "test-api-key",
    });

    await generateImage({
      prompt: "A minimalist workspace",
      aspectRatio: "4:3",
    });

    expect(mockRun).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        input: expect.objectContaining({
          prompt: expect.stringContaining("A minimalist workspace"),
        }),
      }),
    );

    // Verify the prompt wrapper is included
    const callArgs = mockRun.mock.calls[0][1];
    expect(callArgs.input.prompt).toContain(
      "You are generating a content image",
    );
    expect(callArgs.input.prompt).toContain("User Request:");
  });

  it("includes reference image when provided", async () => {
    const generateImage = createReplicateGenerator({
      apiKey: "test-api-key",
    });

    await generateImage({
      prompt: "Make it better",
      aspectRatio: "4:3",
      referenceImage: "data:image/png;base64,abc123",
    });

    expect(mockRun).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        input: expect.objectContaining({
          image: "data:image/png;base64,abc123",
        }),
      }),
    );
  });

  it("handles array output format", async () => {
    mockRun.mockResolvedValue(["https://example.com/image.jpg"]);

    const generateImage = createReplicateGenerator({
      apiKey: "test-api-key",
    });

    const result = await generateImage({
      prompt: "A test image",
      aspectRatio: "4:3",
    });

    expect(result.imageUrl).toBe("https://example.com/image.jpg");
  });

  it("handles string output format", async () => {
    mockRun.mockResolvedValue("https://example.com/image.jpg");

    const generateImage = createReplicateGenerator({
      apiKey: "test-api-key",
    });

    const result = await generateImage({
      prompt: "A test image",
      aspectRatio: "4:3",
    });

    expect(result.imageUrl).toBe("https://example.com/image.jpg");
  });

  it("handles object output format with url property", async () => {
    mockRun.mockResolvedValue({ url: "https://example.com/image.jpg" });

    const generateImage = createReplicateGenerator({
      apiKey: "test-api-key",
    });

    const result = await generateImage({
      prompt: "A test image",
      aspectRatio: "4:3",
    });

    expect(result.imageUrl).toBe("https://example.com/image.jpg");
  });

  it("throws on unexpected output format", async () => {
    mockRun.mockResolvedValue({ unexpected: "format" });

    const generateImage = createReplicateGenerator({
      apiKey: "test-api-key",
    });

    await expect(
      generateImage({
        prompt: "A test image",
        aspectRatio: "4:3",
      }),
    ).rejects.toThrow("Unexpected output format from Replicate");
  });
});
