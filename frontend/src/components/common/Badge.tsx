import { type ReactNode } from "react";
import { cn } from "../../lib/utils";

interface BadgeProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "success" | "warning" | "outline";
  size?: "sm" | "md";
  pulse?: boolean;
  className?: string;
}

export function Badge({
  children,
  variant = "primary",
  size = "sm",
  pulse = false,
  className,
}: BadgeProps) {
  const variants = {
    primary: "bg-primary/10 text-primary border-primary/20",
    secondary: "bg-white/5 text-gray-400 border-white/10",
    success: "bg-green-500/10 text-green-400 border-green-500/20",
    warning: "bg-accent-amber/10 text-accent-amber border-accent-amber/20",
    outline: "bg-transparent text-primary border-primary/30",
  };

  const sizes = {
    sm: "text-[10px] px-2 py-0.5",
    md: "text-xs px-3 py-1",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full border",
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
        </span>
      )}
      {children}
    </span>
  );
}
