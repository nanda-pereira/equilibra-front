type StepperProps = {
  steps: string[];
  /** índice da etapa atual, começando em 0 */
  current: number;
  className?: string;
};

const DOT = 7;
const GAP = 7;

export default function Stepper({ steps, current, className = "" }: StepperProps) {
  const reached = current + 1;
  const remaining = steps.length - reached;

  return (
    <div className={className}>
      <ol className="sr-only" aria-label="Etapas do cadastro">
        {steps.map((name, index) => (
          <li key={name} aria-current={index === current ? "step" : undefined}>
            {name}
          </li>
        ))}
      </ol>

      <div aria-hidden="true" className="flex items-center" style={{ gap: GAP }}>
        <span
          className="h-[7px] rounded-full bg-brand transition-all"
          style={{ width: reached * DOT + (reached - 1) * GAP }}
        />
        {Array.from({ length: remaining }, (_, i) => (
          <span key={i} className="size-[7px] rounded-full bg-mint-200" />
        ))}
      </div>
    </div>
  );
}