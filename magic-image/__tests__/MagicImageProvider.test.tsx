import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MagicImageProvider, useMagicImageConfig } from "../";

const mockGenerateImage = vi.fn();
const mockSaveImage = vi.fn();

function ConfigConsumer() {
  const config = useMagicImageConfig();
  return (
    <div>
      <span data-testid="devMode">
        {String(config?.devMode ?? "undefined")}
      </span>
      <span data-testid="hasGenerate">
        {String(typeof config?.generateImage === "function")}
      </span>
      <span data-testid="hasSave">
        {String(typeof config?.saveImage === "function")}
      </span>
    </div>
  );
}

describe("MagicImageProvider", () => {
  it("provides config to child components", () => {
    render(
      <MagicImageProvider
        devMode={true}
        generateImage={mockGenerateImage}
        saveImage={mockSaveImage}
      >
        <ConfigConsumer />
      </MagicImageProvider>,
    );

    expect(screen.getByTestId("devMode")).toHaveTextContent("true");
    expect(screen.getByTestId("hasGenerate")).toHaveTextContent("true");
    expect(screen.getByTestId("hasSave")).toHaveTextContent("true");
  });

  it("defaults devMode to false", () => {
    render(
      <MagicImageProvider
        generateImage={mockGenerateImage}
        saveImage={mockSaveImage}
      >
        <ConfigConsumer />
      </MagicImageProvider>,
    );

    expect(screen.getByTestId("devMode")).toHaveTextContent("false");
  });

  it("provides optional refinePrompt handler", () => {
    const mockRefinePrompt = vi.fn();

    function RefineConsumer() {
      const config = useMagicImageConfig();
      return (
        <span data-testid="hasRefine">
          {String(typeof config?.refinePrompt === "function")}
        </span>
      );
    }

    render(
      <MagicImageProvider
        generateImage={mockGenerateImage}
        saveImage={mockSaveImage}
        refinePrompt={mockRefinePrompt}
      >
        <RefineConsumer />
      </MagicImageProvider>,
    );

    expect(screen.getByTestId("hasRefine")).toHaveTextContent("true");
  });
});
