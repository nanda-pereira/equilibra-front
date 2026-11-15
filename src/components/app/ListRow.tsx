
import type { ComponentProps, ReactNode } from "react";
import Icon from "../ui/Icon";

type ListRowProps = {
  icon: ComponentProps<typeof Icon>["icon"];
  title: string;
  subtitle?: string;
  trailing?: ReactNode;
  onClick?: () => void;
};

export default function ListRow({
  icon,
  title,
  subtitle,
  trailing,
  onClick,
}: ListRowProps) {
  return (
    <li className="flex flex-wrap items-center gap-4 rounded-[20px] bg-mint-100/70 px-4 py-3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-action">
        <Icon icon={icon} size={22} />
      </span>

      <div className="min-w-0 flex-1">
        {onClick ? (
          <button
            type="button"
            onClick={onClick}
            className="block w-full rounded-lg text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-action"
            aria-label={`Ver detalhes: ${title}`}
          >
            <span className="block text-base font-medium text-ink">
              {title}
            </span>

            {subtitle && (
              <span className="mt-1 block break-words text-sm leading-6 text-ink-soft">
                {subtitle}
              </span>
            )}

            <span className="mt-2 block text-sm font-medium text-action">
              Ver registro completo
            </span>
          </button>
        ) : (
          <>
            <p className="text-base font-medium text-ink">
              {title}
            </p>

            {subtitle && (
              <p className="break-words text-sm leading-6 text-ink-soft">
                {subtitle}
              </p>
            )}
          </>
        )}
      </div>

      {trailing}
    </li>
  );
}
