import type { ComponentProps } from "react";
import Icon from "./Icon";

type IconBadgeProps = {
  icon: ComponentProps<typeof Icon>["icon"];
  size?: "md" | "lg";
  className?: string;
};

export default function IconBadge({ icon, size = "md", className = "" }: IconBadgeProps) {
  const box = size === "lg" ? "size-16" : "size-12";

  return (
    <span
      aria-hidden="true"
      className={`flex ${box} shrink-0 items-center justify-center rounded-full bg-mint-100 text-action ${className}`}
    >
      <Icon icon={icon} size={size === "lg" ? 32 : 24} />
    </span>
  );
}