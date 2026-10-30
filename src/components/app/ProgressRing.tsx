type ProgressRingProps = { value: number; max: number; label: string; size?: number };

export default function ProgressRing({ value, max, label, size = 140 }: ProgressRingProps) {
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = max > 0 ? Math.min(value / max, 1) : 0;

  return (
    <div
      role="img"
      aria-label={`${label}: ${value} de ${max}`}
      className="relative"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#C5E3E0" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#247477"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          className="transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-semibold leading-none text-deep">{value}</span>
        <span className="mt-1 text-sm text-ink-soft">de {max}</span>
      </div>
    </div>
  );
}