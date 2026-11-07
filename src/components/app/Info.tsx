import type { ReactNode } from "react";

export default function Info({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-sm font-medium text-action-hover">{label}</dt>
      <dd className="mt-1 break-words text-base text-ink">{children}</dd>
    </div>
  );
}