import { useId } from "react";

type SwitchProps = {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description?: string;
};

export default function Switch({ checked, onChange, label, description }: SwitchProps) {
  const id = useId();

  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="min-w-0">
        <p id={`${id}-label`} className="text-base font-medium text-ink">
          {label}
        </p>
        {description && (
          <p id={`${id}-desc`} className="text-sm text-ink-soft">
            {description}
          </p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        aria-describedby={description ? `${id}-desc` : undefined}
        onClick={() => onChange(!checked)}
        className={`relative h-8 w-14 shrink-0 rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action ${
          checked ? "border-action bg-action" : "border-field-border bg-white"
        }`}
      >
        <span
          className={`absolute left-1 top-1 size-5 rounded-full transition-transform ${
            checked ? "translate-x-6 bg-white" : "bg-field-border"
          }`}
        />
      </button>
    </div>
  );
}