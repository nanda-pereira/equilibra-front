type SectionEyebrowProps = {
  children: string;
  lineWidth: number; // Figma: 140 (O problema), 124 (A solução), 200 (Como funciona)
};

export default function SectionEyebrow({ children, lineWidth }: SectionEyebrowProps) {
  return (
    <div>
      <p className="flex h-[43px] items-center text-base font-medium uppercase tracking-[0.14em] text-ink">
        {children}
      </p>
      <span
        className="mt-1 block h-0.5 bg-brand"
        style={{ width: lineWidth }}
        aria-hidden="true"
      />
    </div>
  );
}