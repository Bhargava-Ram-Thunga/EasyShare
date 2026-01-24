import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "../../lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  iconPosition?: "left" | "right";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, iconPosition = "right", ...props }, ref) => {
    return (
      <div className="relative group">
        <input
          ref={ref}
          className={cn(
            "w-full bg-[#0f2422] border border-border-dark-alt rounded-lg py-4 px-4 text-white font-mono text-sm",
            "focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all",
            "placeholder:text-gray-500",
            icon && iconPosition === "right" && "pr-12",
            icon && iconPosition === "left" && "pl-12",
            className,
          )}
          {...props}
        />
        {icon && (
          <div
            className={cn(
              "absolute top-1/2 -translate-y-1/2 text-primary",
              iconPosition === "right" ? "right-3" : "left-3",
            )}
          >
            {icon}
          </div>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
