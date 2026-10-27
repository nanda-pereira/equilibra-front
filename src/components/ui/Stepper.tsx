type StepperProps = {
  steps: string[];
  /** índice da etapa atual, começa em 0 */
  current: number;
  className?: string;
};

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

      <div aria-hidden="true" className="flex items-center gap-2">
        <span
          className="h-2 rounded-full bg-action transition-all"
          style={{ width: reached * 8 + (reached - 1) * 8 }}
        />
        {Array.from({ length: remaining }, (_, i) => (
          <span key={i} className="size-2 rounded-full bg-mint-200" />
        ))}
      </div>
    </div>
  );
}