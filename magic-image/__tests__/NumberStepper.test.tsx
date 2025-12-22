import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NumberStepper } from "../components/NumberStepper";

describe("NumberStepper", () => {
  it("displays current value", () => {
    render(<NumberStepper value={5} onChange={() => {}} />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("increments value on plus click", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<NumberStepper value={5} onChange={handleChange} />);

    await user.click(screen.getByRole("button", { name: /increase/i }));
    expect(handleChange).toHaveBeenCalledWith(6);
  });

  it("decrements value on minus click", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<NumberStepper value={5} onChange={handleChange} />);

    await user.click(screen.getByRole("button", { name: /decrease/i }));
    expect(handleChange).toHaveBeenCalledWith(4);
  });

  it("respects min bound", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<NumberStepper value={1} onChange={handleChange} min={1} />);

    const decreaseButton = screen.getByRole("button", { name: /decrease/i });
    expect(decreaseButton).toBeDisabled();

    await user.click(decreaseButton);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("respects max bound", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<NumberStepper value={10} onChange={handleChange} max={10} />);

    const increaseButton = screen.getByRole("button", { name: /increase/i });
    expect(increaseButton).toBeDisabled();

    await user.click(increaseButton);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("disables buttons at bounds", () => {
    render(<NumberStepper value={5} onChange={() => {}} min={5} max={5} />);

    expect(screen.getByRole("button", { name: /decrease/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /increase/i })).toBeDisabled();
  });
});
