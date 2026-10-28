import type { ComponentProps } from "react";
import { HugeiconsIcon } from "@hugeicons/react";

type IconProps = {
  icon: ComponentProps<typeof HugeiconsIcon>["icon"];
  size?: number;
  strokeWidth?: number;
  className?: string; // usar text-* para colorir
};

export default function Icon({
  icon,
  size = 24,
  strokeWidth = 1.5,
  className = "",
}: IconProps) {
  return (
    <span aria-hidden="true" className={`inline-flex shrink-0 ${className}`}>
      <HugeiconsIcon
        icon={icon}
        size={size}
        strokeWidth={strokeWidth}
        color="currentColor"
      />
    </span>
  );
}