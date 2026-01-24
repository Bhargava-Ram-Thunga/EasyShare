import { cn } from "../../lib/utils";

interface IconProps {
  name: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  filled?: boolean;
}

const sizeMap = {
  sm: "text-[16px]",
  md: "text-[20px]",
  lg: "text-[24px]",
  xl: "text-[32px]",
};

export function Icon({
  name,
  className,
  size = "md",
  filled = false,
}: IconProps) {
  return (
    <span
      className={cn(
        "material-symbols-outlined select-none",
        sizeMap[size],
        className,
      )}
      style={{
        fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0",
      }}
    >
      {name}
    </span>
  );
}
