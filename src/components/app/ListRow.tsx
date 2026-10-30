import type { ComponentProps, ReactNode } from "react";
import Icon from "../ui/Icon";

type ListRowProps = {
  icon: ComponentProps<typeof Icon>["icon"];
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
};

export default function ListRow({ icon, title, subtitle, trailing }: ListRowProps) {
  return (
    <li className="flex flex-wrap items-center gap-4 rounded-[20px] bg-mint-100/70 px-4 py-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-action">
        <Icon icon={icon} size={22} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-base font-medium text-ink">{title}</p>
        {subtitle && <p className="text-sm text-ink-soft">{subtitle}</p>}
      </div>
      {trailing}
    </li>
  );
}