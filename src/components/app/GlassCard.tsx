import type { ReactNode } from "react";

type GlassCardProps = {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export default function GlassCard({
  title,
  description,
  action,
  children,
  className = "",
}: GlassCardProps) {
  return (
    <section className={`glass-card rounded-3xl p-4 sm:p-6 ${className}`}>
      {(title || action) && (
        <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            {title && <h2 className="text-lg font-medium text-deep sm:text-xl">{title}</h2>}
            {description && <p className="mt-1 text-sm text-ink-soft">{description}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}