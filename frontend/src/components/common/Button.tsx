import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Icon } from "./Icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: string;
  iconPosition?: "left" | "right";
  loading?: boolean;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      icon,
      iconPosition = "left",
      loading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 font-bold transition-all duration-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary:
        "bg-primary hover:bg-[#33ffeb] text-background-dark shadow-neon hover:shadow-neon-hover",
      secondary:
        "bg-surface-dark hover:bg-surface-dark/80 text-white border border-white/10 hover:border-white/20",
      ghost: "bg-transparent hover:bg-white/5 text-gray-400 hover:text-white",
      outline:
        "bg-transparent border border-border-dark-alt hover:border-primary text-white hover:text-primary",
      danger:
        "bg-transparent hover:bg-red-500/10 text-gray-400 hover:text-red-500 border border-transparent hover:border-red-500/30",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base",
    };

    const iconSizes = {
      sm: "sm" as const,
      md: "sm" as const,
      lg: "md" as const,
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Icon
            name="progress_activity"
            className="animate-spin"
            size={iconSizes[size]}
          />
        ) : icon && iconPosition === "left" ? (
          <Icon name={icon} size={iconSizes[size]} />
        ) : null}
        {children}
        {!loading && icon && iconPosition === "right" ? (
          <Icon name={icon} size={iconSizes[size]} />
        ) : null}
      </button>
    );
  },
);

Button.displayName = "Button";
