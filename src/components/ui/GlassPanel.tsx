import type { ReactNode } from "react";

type GlassPanelProps = {
  children: ReactNode;
  labelledBy?: string;
  className?: string;
};

export default function GlassPanel({
  children,
  labelledBy,
  className = "",
}: GlassPanelProps) {
  return (
    <section
      aria-labelledby={labelledBy}
      className={`mx-auto w-full max-w-[1040px] rounded-panel border border-white bg-white/72 px-5 py-7 shadow-[0_0_0_1px_rgba(36,116,119,0.10),0_24px_64px_rgba(36,116,119,0.12)] backdrop-blur-[24px] md:p-12 ${className}`}
    >
      {children}
    </section>
  );
}