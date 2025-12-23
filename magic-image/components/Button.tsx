import * as React from "react";
import { cn } from "../utils/cn";

type ButtonVariant = "default" | "secondary" | "ghost" | "outlineSecondary";
type ButtonSize = "default" | "sm" | "xs" | "icon-sm";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: "default" | "rounded";
  leftIcon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  default: "magic-btn--default",
  secondary: "magic-btn--secondary",
  ghost: "magic-btn--ghost",
  outlineSecondary: "magic-btn--outline",
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "",
  sm: "magic-btn--sm",
  xs: "magic-btn--xs",
  "icon-sm": "magic-btn--icon",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      shape = "default",
      leftIcon,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "magic-btn",
          variantClasses[variant],
          sizeClasses[size],
          shape === "rounded" && "magic-btn--rounded",
          className,
        )}
        {...props}
      >
        {leftIcon && <span className="magic-btn__icon">{leftIcon}</span>}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
