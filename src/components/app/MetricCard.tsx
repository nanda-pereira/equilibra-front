import type { ComponentProps } from "react";
import Icon from "../ui/Icon";

type MetricCardProps = {
  icon: ComponentProps<typeof Icon>["icon"];
  label: string;
  value: string;
  unit?: string;
  note?: string;
};

export default function MetricCard({ icon, label, value, unit, note }: MetricCardProps) {
  return (
    <div className="glass-card flex flex-col gap-3 rounded-3xl p-5">
      <div className="flex items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-mint-100 text-action">
          <Icon icon={icon} size={20} />
        </span>
        <span className="text-sm text-ink-soft">{label}</span>
      </div>
      <p className="text-[32px] font-semibold leading-none text-deep">
        {value}
        {unit && <span className="ml-1.5 text-base font-normal text-ink-soft">{unit}</span>}
      </p>
      {note && <p className="text-sm text-ink-soft">{note}</p>}
    </div>
  );
}