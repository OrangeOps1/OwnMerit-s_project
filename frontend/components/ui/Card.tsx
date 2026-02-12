"use client";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
  hover?: boolean;
  onClick?: () => void;
  role?: string;
  ariaLabel?: string;
}

const paddingStyles: Record<string, string> = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({
  children,
  className = "",
  padding = "md",
  hover = false,
  onClick,
  role,
  ariaLabel,
}: CardProps) {
  const isInteractive = !!onClick;

  const Component = isInteractive ? "button" : "div";

  return (
    <Component
      className={`
        bg-surface rounded-2xl border border-border
        shadow-sm
        ${paddingStyles[padding]}
        ${hover ? "hover:shadow-md hover:border-primary/30 transition-all duration-200" : ""}
        ${isInteractive ? "cursor-pointer text-left w-full touch-target" : ""}
        ${className}
      `}
      onClick={onClick}
      role={role}
      aria-label={ariaLabel}
    >
      {children}
    </Component>
  );
}
