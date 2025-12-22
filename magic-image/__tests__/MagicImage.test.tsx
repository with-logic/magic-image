/// <reference types="@testing-library/jest-dom" />
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MagicImage, MagicImageProvider } from "../";
import type { ReactNode } from "react";

const mockGenerateImage = vi.fn();
const mockSaveImage = vi.fn();

function createWrapper(devMode = true) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MagicImageProvider
        devMode={devMode}
        generateImage={mockGenerateImage}
        saveImage={mockSaveImage}
      >
        {children}
      </MagicImageProvider>
    );
  };
}

describe("MagicImage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerateImage.mockResolvedValue({
      imageUrl: "https://example.com/generated.jpg",
    });
    mockSaveImage.mockResolvedValue({ success: true });
  });

  describe("production mode", () => {
    it("renders standard img when devMode is false", () => {
      render(
        <MagicImage src="/test.jpg" alt="Test image" prompt="A test prompt" />,
        { wrapper: createWrapper(false) },
      );

      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("src", "/test.jpg");
      expect(img).toHaveAttribute("alt", "Test image");
      expect(screen.queryByText("Generate")).not.toBeInTheDocument();
    });

    it("renders standard img when no prompt provided", () => {
      render(<MagicImage src="/test.jpg" alt="Test image" />, {
        wrapper: createWrapper(true),
      });

      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("src", "/test.jpg");
      expect(screen.queryByText("Generate")).not.toBeInTheDocument();
    });
  });

  describe("dev mode overlay", () => {
    it("shows dev overlay when devMode is true and prompt exists", () => {
      render(
        <MagicImage src="/test.jpg" alt="Test image" prompt="A test prompt" />,
        { wrapper: createWrapper(true) },
      );

      expect(screen.getByText("Generate")).toBeInTheDocument();
      expect(screen.getByText("Edit Prompt")).toBeInTheDocument();
    });

    it("respects devMode override prop vs provider setting", () => {
      // Provider has devMode=true, but component overrides to false
      render(
        <MagicImage
          src="/test.jpg"
          alt="Test image"
          prompt="A test prompt"
          devMode={false}
        />,
        { wrapper: createWrapper(true) },
      );

      expect(screen.queryByText("Generate")).not.toBeInTheDocument();
    });
  });

  describe("generation flow", () => {
    it("displays loading state during generation", async () => {
      const user = userEvent.setup();
      mockGenerateImage.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () => resolve({ imageUrl: "https://example.com/img.jpg" }),
              100,
            ),
          ),
      );

      render(
        <MagicImage src="/test.jpg" alt="Test image" prompt="A test prompt" />,
        { wrapper: createWrapper(true) },
      );

      await user.click(screen.getByText("Generate"));

      expect(screen.getByText(/Generating/)).toBeInTheDocument();
    });

    it("shows error messages on generation failure", async () => {
      const user = userEvent.setup();
      mockGenerateImage.mockRejectedValue(new Error("Generation failed"));

      render(
        <MagicImage src="/test.jpg" alt="Test image" prompt="A test prompt" />,
        { wrapper: createWrapper(true) },
      );

      await user.click(screen.getByText("Generate"));

      await waitFor(() => {
        expect(screen.getByText("Generation failed")).toBeInTheDocument();
      });
    });

    it("shows generated image after successful generation", async () => {
      const user = userEvent.setup();

      render(
        <MagicImage src="/test.jpg" alt="Test image" prompt="A test prompt" />,
        { wrapper: createWrapper(true) },
      );

      await user.click(screen.getByText("Generate"));

      await waitFor(() => {
        const img = screen.getByRole("img");
        expect(img).toHaveAttribute("src", "https://example.com/generated.jpg");
      });
    });
  });

  describe("save flow", () => {
    it("triggers save handler with correct data", async () => {
      const user = userEvent.setup();

      render(
        <MagicImage src="/test.jpg" alt="Test image" prompt="A test prompt" />,
        { wrapper: createWrapper(true) },
      );

      await user.click(screen.getByText("Generate"));

      await waitFor(() => {
        expect(screen.getByText("Save")).toBeInTheDocument();
      });

      await user.click(screen.getByText("Save"));

      await waitFor(() => {
        expect(mockSaveImage).toHaveBeenCalledWith({
          imageData: "https://example.com/generated.jpg",
          targetPath: "/test.jpg",
        });
      });
    });

    it("single image auto-selected for save", async () => {
      const user = userEvent.setup();

      render(
        <MagicImage src="/test.jpg" alt="Test image" prompt="A test prompt" />,
        { wrapper: createWrapper(true) },
      );

      await user.click(screen.getByText("Generate"));

      await waitFor(() => {
        // Save button should be visible without needing to select
        expect(screen.getByText("Save")).toBeInTheDocument();
      });
    });
  });

  describe("prompt editor", () => {
    it("opens on edit button click", async () => {
      const user = userEvent.setup();

      render(
        <MagicImage src="/test.jpg" alt="Test image" prompt="A test prompt" />,
        { wrapper: createWrapper(true) },
      );

      await user.click(screen.getByText("Edit Prompt"));

      await waitFor(() => {
        expect(
          screen.getByRole("dialog", { name: /edit.*prompt/i }),
        ).toBeInTheDocument();
      });
    });

    it("updates prompt text", async () => {
      const user = userEvent.setup();

      render(
        <MagicImage src="/test.jpg" alt="Test image" prompt="A test prompt" />,
        { wrapper: createWrapper(true) },
      );

      await user.click(screen.getByText("Edit Prompt"));

      const textarea = screen.getByRole("textbox");
      await user.clear(textarea);
      await user.type(textarea, "New prompt");

      expect(textarea).toHaveValue("New prompt");
    });

    it("reset clears changes", async () => {
      const user = userEvent.setup();

      render(
        <MagicImage
          src="/test.jpg"
          alt="Test image"
          prompt="Original prompt"
        />,
        { wrapper: createWrapper(true) },
      );

      await user.click(screen.getByText("Edit Prompt"));

      const textarea = screen.getByRole("textbox");
      await user.clear(textarea);
      await user.type(textarea, "Modified prompt");

      await user.click(screen.getByText("Reset"));

      // Dialog should close and prompt should be reset (verified on re-open)
      await user.click(screen.getByText("Edit Prompt"));
      expect(screen.getByRole("textbox")).toHaveValue("Original prompt");
    });
  });

  describe("regenerate flow", () => {
    it("regenerate clears previous and generates new", async () => {
      const user = userEvent.setup();

      render(
        <MagicImage src="/test.jpg" alt="Test image" prompt="A test prompt" />,
        { wrapper: createWrapper(true) },
      );

      await user.click(screen.getByText("Generate"));

      await waitFor(() => {
        expect(screen.getByText("Regenerate")).toBeInTheDocument();
      });

      mockGenerateImage.mockResolvedValue({
        imageUrl: "https://example.com/regenerated.jpg",
      });

      await user.click(screen.getByText("Regenerate"));

      await waitFor(() => {
        const img = screen.getByRole("img");
        expect(img).toHaveAttribute(
          "src",
          "https://example.com/regenerated.jpg",
        );
      });
    });
  });
});
