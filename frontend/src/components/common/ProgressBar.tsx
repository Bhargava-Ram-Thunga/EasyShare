import { cn } from "../../lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  className?: string;
  animated?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  size = "md",
  showValue = false,
  className,
  animated = true,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizes = {
    sm: "h-1.5",
    md: "h-4",
    lg: "h-6",
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "w-full bg-black/50 rounded-full border border-white/10 relative overflow-hidden",
          sizes[size],
        )}
      >
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r from-teal-600 via-primary to-primary relative shadow-[0_0_12px_rgba(0,255,230,0.4)] transition-all duration-300 ease-out",
            animated && "transition-[width]",
          )}
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/30 rounded-full" />
        </div>
      </div>
      {showValue && (
        <div className="flex justify-between mt-1 text-xs text-gray-400">
          <span>{value}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
}
