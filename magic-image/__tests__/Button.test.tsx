import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../components/Button";

describe("Button", () => {
  it("renders with different variants", () => {
    const { rerender } = render(<Button variant="default">Default</Button>);
    expect(screen.getByRole("button", { name: "Default" })).toBeInTheDocument();

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(
      screen.getByRole("button", { name: "Secondary" }),
    ).toBeInTheDocument();

    rerender(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole("button", { name: "Ghost" })).toBeInTheDocument();

    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole("button", { name: "Outline" })).toBeInTheDocument();
  });

  it("handles click events", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Click me</Button>);

    await user.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("shows disabled state", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>,
    );

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();

    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("renders left icon when provided", () => {
    render(
      <Button leftIcon={<span data-testid="icon">Icon</span>}>
        With Icon
      </Button>,
    );

    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(screen.getByText("With Icon")).toBeInTheDocument();
  });

  it("renders with different sizes", () => {
    const { rerender } = render(<Button size="default">Default</Button>);
    expect(screen.getByRole("button", { name: "Default" })).toBeInTheDocument();

    rerender(<Button size="sm">Small</Button>);
    expect(screen.getByRole("button", { name: "Small" })).toBeInTheDocument();

    rerender(<Button size="xs">Extra Small</Button>);
    expect(
      screen.getByRole("button", { name: "Extra Small" }),
    ).toBeInTheDocument();

    rerender(<Button size="icon-sm">Icon</Button>);
    expect(screen.getByRole("button", { name: "Icon" })).toBeInTheDocument();
  });

  it("renders with rounded shape", () => {
    render(<Button shape="rounded">Rounded</Button>);
    expect(screen.getByRole("button", { name: "Rounded" })).toBeInTheDocument();
  });
});
