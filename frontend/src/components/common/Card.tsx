import { type ReactNode } from "react";
import { cn } from "../../lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "glass" | "glow";
  padding?: "none" | "sm" | "md" | "lg";
}

export function Card({
  children,
  className,
  variant = "default",
  padding = "md",
}: CardProps) {
  const variants = {
    default: "bg-surface-dark border-border-dark",
    glass: "glass-panel",
    glow: "bg-surface-dark border-border-dark border-glow shadow-glow hover:shadow-glow-strong transition-shadow",
  };

  const paddings = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={cn(
        "rounded-xl border",
        variants[variant],
        paddings[padding],
        className,
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div
      className={cn(
        "px-6 py-4 border-b border-border-dark bg-[#122927] flex justify-between items-center -mx-6 -mt-6 mb-6 rounded-t-xl",
        className,
      )}
    >
      {children}
    </div>
  );
}
