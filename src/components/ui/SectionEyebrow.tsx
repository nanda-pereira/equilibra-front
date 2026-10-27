type SectionEyebrowProps = {
  children: string;
  lineWidth: number;
  large?: boolean;
  center?: boolean;
  headingId?: string; 
  className?: string;
};

export default function SectionEyebrow({
  children,
  lineWidth,
  large = false,
  center = false,
  headingId,
  className = "",
}: SectionEyebrowProps) {
  const Tag = headingId ? "h2" : "p";

  const text = large
    ? "h-[30px] text-[18px] tracking-[0.18em] text-black"
    : "h-[43px] text-base tracking-[0.14em] text-ink";
  const line = large ? "h-[3px]" : "mt-1 h-0.5";

  return (
    <div className={`${center ? "flex flex-col items-center" : ""} ${className}`}>
      <Tag id={headingId} className={`flex items-center font-medium uppercase ${text}`}>
        {children}
      </Tag>
      <span
        className={`block bg-linear-to-r from-[#62B2AD] to-[#C0D9D3] ${line}`}
        style={{ width: lineWidth }}
        aria-hidden="true"
      />
    </div>
  );
}