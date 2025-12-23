import React from "react";
import type { ReactNode } from "react";
import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { MagicImageProvider, useMagicImage, useMagicImageConfig } from "../";

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

describe("useMagicImage", () => {
  it("returns config when inside provider", () => {
    const { result } = renderHook(() => useMagicImage(), {
      wrapper: createWrapper(),
    });

    expect(result.current.devMode).toBe(true);
    expect(result.current.generateImage).toBe(mockGenerateImage);
    expect(result.current.saveImage).toBe(mockSaveImage);
  });

  it("throws descriptive error when outside provider", () => {
    expect(() => {
      renderHook(() => useMagicImage());
    }).toThrow("useMagicImage must be used within a MagicImageProvider");
  });
});

describe("useMagicImageConfig", () => {
  it("returns config when inside provider", () => {
    const { result } = renderHook(() => useMagicImageConfig(), {
      wrapper: createWrapper(false),
    });

    expect(result.current).toBeDefined();
    expect(result.current?.devMode).toBe(false);
    expect(result.current?.generateImage).toBe(mockGenerateImage);
    expect(result.current?.saveImage).toBe(mockSaveImage);
  });

  it("returns undefined when outside provider", () => {
    const { result } = renderHook(() => useMagicImageConfig());

    expect(result.current).toBeUndefined();
  });
});
