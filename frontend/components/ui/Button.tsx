"use client";

import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<string, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-dark active:bg-primary-dark shadow-sm",
  secondary:
    "bg-secondary text-white hover:opacity-90 active:opacity-80 shadow-sm",
  outline:
    "border-2 border-primary text-primary hover:bg-primary-light active:bg-primary-light",
  ghost:
    "text-text-secondary hover:bg-primary-light active:bg-primary-light",
  danger:
    "bg-danger text-white hover:opacity-90 active:opacity-80 shadow-sm",
  success:
    "bg-success text-white hover:opacity-90 active:opacity-80 shadow-sm",
};

const sizeStyles: Record<string, string> = {
  sm: "px-4 py-2 text-sm rounded-lg min-h-[40px]",
  md: "px-6 py-3 text-base rounded-xl min-h-[48px]",
  lg: "px-8 py-4 text-lg rounded-xl min-h-[56px]",
  xl: "px-10 py-5 text-xl rounded-2xl min-h-[64px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      fullWidth = false,
      className = "",
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center
          font-semibold
          transition-all duration-200 ease-in-out
          focus-visible:outline-3 focus-visible:outline-primary focus-visible:outline-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
          touch-target cursor-pointer
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? "w-full" : ""}
          ${className}
        `}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
