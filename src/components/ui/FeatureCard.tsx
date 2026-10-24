import type { ReactNode } from "react";

type FeatureCardProps = {
  title: ReactNode;
  description: string;
  variant?: "stacked" | "inline"; // stacked = Problema, inline = Solução
  icon?: ReactNode;
};

// raio, fundo e sombra 
const shadow = "shadow-[0_8px_32px_rgba(36,116,119,0.08)]";

export default function FeatureCard({
  title,
  description,
  variant = "stacked",
  icon,
}: FeatureCardProps) {
  if (variant === "inline") {
    return (
      <li
        className={`flex min-h-[131px] items-center gap-[25px] rounded-2xl bg-white py-[23px] pl-[14px] pr-[27px] ${shadow}`}
      >
        <div className="h-[82px] w-[82px] shrink-0" aria-hidden="true">
          {icon ?? <div className="h-full w-full rounded-full bg-[#E9E9E9]" />}
        </div>
        <div className="min-w-0">
          <h3 className="text-[17px] font-normal leading-[25px] text-ink">{title}</h3>
          <p className="mt-1 text-sm leading-[22px] text-ink-soft">{description}</p>
        </div>
      </li>
    );
  }

  return (
    <li
      className={`flex flex-col rounded-3xl bg-white px-[29px] pb-8 pt-[34px] xl:min-h-[372px] ${shadow}`}
    >
      <div className="h-[71px] w-[75px]" aria-hidden="true">
        {icon ?? <div className="h-full w-full rounded-full bg-[#E9E9E9]" />}
      </div>
      <h3 className="mt-[19px] text-lg font-normal leading-[26px] text-ink">{title}</h3>
      <p className="mt-[18px] text-sm leading-[17px] text-ink-soft">{description}</p>
    </li>
  );
}