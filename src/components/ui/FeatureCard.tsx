import type { ComponentProps, ReactNode } from "react";
import Icon from "./Icon";
import Reveal from "./Reveal";

type IconType = ComponentProps<typeof Icon>["icon"];

type FeatureCardProps = {
  title: ReactNode;
  description: string;
  variant?: "stacked" | "inline"; // stacked = Problema, inline = Solução
  icon?: IconType;
  className?: string;
  delay?: number;
};

// raio, fundo e sombra
const shadow = "shadow-[0_8px_32px_rgba(36,116,119,0.08)]";

function IconCircle({ icon, className }: { icon?: IconType; className: string }) {
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full ${
        icon ? "bg-mint-100 text-action" : "bg-[#E9E9E9]"
      } ${className}`}
    >
      {icon && <Icon icon={icon} size={32} />}
    </span>
  );
}

export default function FeatureCard({
  title,
  description,
  variant = "stacked",
  icon,
  className = "",
  delay = 0,
}: FeatureCardProps) {
  if (variant === "inline") {
    return (
      <Reveal
        as="li"
        delay={delay}
        className={`flex min-h-[131px] items-center gap-4 rounded-2xl bg-white py-5 pl-4 pr-5 sm:gap-[25px] sm:py-[23px] sm:pl-[14px] sm:pr-[27px] ${shadow} ${className}`}
      >
        <IconCircle icon={icon} className="size-16 sm:size-[82px]" />
        <div className="min-w-0">
          <h3 className="text-[17px] font-normal leading-[25px] text-ink">{title}</h3>
          <p className="mt-1 text-sm leading-[22px] text-ink-soft">{description}</p>
        </div>
      </Reveal>
    );
  }

  return (
    <Reveal
      as="li"
      delay={delay}
      className={`flex flex-col rounded-3xl bg-white px-6 pb-8 pt-8 sm:px-[29px] sm:pt-[34px] xl:min-h-[372px] ${shadow} ${className}`}
    >
      <IconCircle icon={icon} className="size-[72px]" />
      <h3 className="mt-[19px] text-lg font-normal leading-[26px] text-ink">{title}</h3>
      <p className="mt-[18px] text-sm leading-[22px] text-ink-soft">{description}</p>
    </Reveal>
  );
}