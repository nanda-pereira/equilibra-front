import type { ReactNode } from "react";

type SectionProps = {
  id: string;
  labelledBy: string;
  bg?: string;
  className?: string; 
  children: ReactNode;
};

export default function Section({
  id,
  labelledBy,
  bg = "bg-page",
  className = "",
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={`${bg} px-6 py-16 md:px-12 xl:section-screen xl:flex xl:items-center xl:py-16 ${className}`}
    >
      {children}
    </section>
  );
}