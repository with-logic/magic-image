import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createBrowserDownloadSaver } from "../savers/browserDownload";

describe("createBrowserDownloadSaver", () => {
  let mockCreateObjectURL: ReturnType<typeof vi.fn>;
  let mockRevokeObjectURL: ReturnType<typeof vi.fn>;
  let mockAppendChild: ReturnType<typeof vi.fn>;
  let mockRemoveChild: ReturnType<typeof vi.fn>;
  let mockClick: ReturnType<typeof vi.fn>;
  let createdLink: HTMLAnchorElement | null = null;

  beforeEach(() => {
    mockCreateObjectURL = vi.fn().mockReturnValue("blob:test-url");
    mockRevokeObjectURL = vi.fn();
    mockAppendChild = vi.fn();
    mockRemoveChild = vi.fn();
    mockClick = vi.fn();

    URL.createObjectURL = mockCreateObjectURL;
    URL.revokeObjectURL = mockRevokeObjectURL;

    document.body.appendChild = mockAppendChild;
    document.body.removeChild = mockRemoveChild;

    // Mock canvas for image conversion
    const mockContext = {
      fillStyle: "",
      fillRect: vi.fn(),
      drawImage: vi.fn(),
    };

    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn().mockReturnValue(mockContext),
      toBlob: vi.fn((callback: BlobCallback) => {
        callback(new Blob(["converted"], { type: "image/jpeg" }));
      }),
    };

    vi.spyOn(document, "createElement").mockImplementation((tag) => {
      if (tag === "a") {
        createdLink = {
          href: "",
          download: "",
          click: mockClick,
        } as unknown as HTMLAnchorElement;
        return createdLink;
      }
      if (tag === "canvas") {
        return mockCanvas as unknown as HTMLCanvasElement;
      }
      return document.createElement(tag);
    });

    // Mock Image class for conversion
    const MockImage = vi.fn().mockImplementation(() => {
      const img = {
        src: "",
        naturalWidth: 800,
        naturalHeight: 600,
        onload: null as (() => void) | null,
        onerror: null as (() => void) | null,
      };
      // Trigger onload asynchronously
      setTimeout(() => {
        if (img.onload) img.onload();
      }, 0);
      return img;
    });
    vi.stubGlobal("Image", MockImage);

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(["test"], { type: "image/png" })),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    createdLink = null;
  });

  it("triggers download with correct filename", async () => {
    const saveImage = createBrowserDownloadSaver();

    const result = await saveImage({
      imageData: "data:image/png;base64,test",
      targetPath: "/images/hero.png",
    });

    expect(result.success).toBe(true);
    expect(result.savedPath).toBe("hero.jpg"); // Default format is JPEG
    expect(createdLink?.download).toBe("hero.jpg");
    expect(mockClick).toHaveBeenCalled();
  });

  it("allows custom filename derivation", async () => {
    const saveImage = createBrowserDownloadSaver({
      getFilename: (path) => `custom-${path.split("/").pop()}`,
    });

    const result = await saveImage({
      imageData: "data:image/png;base64,test",
      targetPath: "/images/hero.png",
    });

    expect(result.savedPath).toBe("custom-hero.jpg"); // Extension corrected to .jpg
    expect(createdLink?.download).toBe("custom-hero.jpg");
  });

  it("handles blob conversion from base64 data URL", async () => {
    const saveImage = createBrowserDownloadSaver();

    await saveImage({
      imageData: "data:image/png;base64,iVBORw0KGgo=",
      targetPath: "/test.png",
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "data:image/png;base64,iVBORw0KGgo=",
    );
    expect(mockCreateObjectURL).toHaveBeenCalled();
  });

  it("handles remote URL", async () => {
    const saveImage = createBrowserDownloadSaver();

    await saveImage({
      imageData: "https://example.com/image.png",
      targetPath: "/test.png",
    });

    expect(global.fetch).toHaveBeenCalledWith("https://example.com/image.png");
    expect(mockCreateObjectURL).toHaveBeenCalled();
  });

  it("returns success status", async () => {
    const saveImage = createBrowserDownloadSaver();

    const result = await saveImage({
      imageData: "data:image/png;base64,test",
      targetPath: "/test.png",
    });

    expect(result).toEqual({ success: true, savedPath: "test.jpg" });
  });

  it("returns failure on fetch error", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      statusText: "Not Found",
    });

    const saveImage = createBrowserDownloadSaver();

    const result = await saveImage({
      imageData: "https://example.com/nonexistent.png",
      targetPath: "/test.png",
    });

    expect(result.success).toBe(false);
  });

  it("returns failure on invalid image data format", async () => {
    const saveImage = createBrowserDownloadSaver();

    const result = await saveImage({
      imageData: "invalid-data",
      targetPath: "/test.png",
    });

    expect(result.success).toBe(false);
  });

  it("cleans up blob URL after download", async () => {
    const saveImage = createBrowserDownloadSaver();

    await saveImage({
      imageData: "data:image/png;base64,test",
      targetPath: "/test.png",
    });

    expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:test-url");
  });
});
