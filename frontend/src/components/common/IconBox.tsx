import { cn } from "../../lib/utils";
import { Icon } from "./Icon";

interface IconBoxProps {
  icon: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "primary" | "outline";
  className?: string;
}

export function IconBox({
  icon,
  size = "md",
  variant = "default",
  className,
}: IconBoxProps) {
  const sizes = {
    sm: "size-8",
    md: "size-12",
    lg: "size-14",
    xl: "size-16",
  };

  const iconSizes = {
    sm: "sm" as const,
    md: "md" as const,
    lg: "lg" as const,
    xl: "xl" as const,
  };

  const variants = {
    default: "bg-border-dark border-border-dark-alt text-primary",
    primary: "bg-primary/10 border-primary/20 text-primary",
    outline: "bg-transparent border-border-dark-alt text-primary",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-lg border shrink-0",
        sizes[size],
        variants[variant],
        className,
      )}
    >
      <Icon name={icon} size={iconSizes[size]} />
    </div>
  );
}
