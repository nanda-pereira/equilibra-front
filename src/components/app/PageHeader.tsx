import type { ReactNode } from "react";
import { useSession } from "../../modules/session/session";
import Avatar from "./Avatar";

function greeting(now: Date) {
  const hour = now.getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

function longDate(now: Date) {
  const text = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);
  return text.charAt(0).toUpperCase() + text.slice(1);
}

type PageHeaderProps = {
  title?: string;
  subtitle?: string;
  demo?: boolean;
  children?: ReactNode;
};

export default function PageHeader({ title, subtitle, demo = false, children }: PageHeaderProps) {
  const { session } = useSession();
  const now = new Date();
  const name = session?.name ?? "";
  const firstName = name.split(" ")[0] ?? "";

  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-[28px] font-medium leading-tight text-deep md:text-[32px]">
          {title ?? `${greeting(now)}, ${firstName}`}
        </h1>
        <p className="mt-1 text-sm text-ink-soft">{subtitle ?? longDate(now)}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {demo && (
          <span className="inline-flex h-8 items-center rounded-full bg-info-bg px-3 text-sm font-medium text-info-text">
            Dados de demonstração
          </span>
        )}
        {children}
        <Avatar name={name} />
      </div>
    </header>
  );
}