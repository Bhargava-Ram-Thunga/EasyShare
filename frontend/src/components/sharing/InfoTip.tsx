import { type ReactNode } from "react";
import { Icon } from "../common";
import { cn } from "../../lib/utils";

interface InfoTipProps {
  icon?: string;
  title: string;
  children: ReactNode;
  variant?: "primary" | "warning" | "info";
  className?: string;
}

export function InfoTip({
  icon = "bolt",
  title,
  children,
  variant = "primary",
  className,
}: InfoTipProps) {
  const variants = {
    primary: "bg-primary/5 border-primary/20",
    warning: "bg-accent-amber/5 border-accent-amber/20",
    info: "bg-blue-500/5 border-blue-500/20",
  };

  const iconColors = {
    primary: "text-primary",
    warning: "text-accent-amber",
    info: "text-blue-400",
  };

  const titleColors = {
    primary: "text-primary",
    warning: "text-accent-amber",
    info: "text-blue-400",
  };

  return (
    <div
      className={cn(
        "border rounded-xl p-4 flex items-start gap-3",
        variants[variant],
        className,
      )}
    >
      <Icon
        name={icon}
        className={cn("shrink-0 mt-0.5", iconColors[variant])}
        size="sm"
      />
      <p className="text-xs text-gray-300 leading-relaxed">
        <strong className={cn("block mb-1", titleColors[variant])}>
          {title}
        </strong>
        {children}
      </p>
    </div>
  );
}
