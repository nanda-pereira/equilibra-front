import { useId, type ComponentProps } from "react";

type TextareaProps = Omit<ComponentProps<"textarea">, "id"> & {
  label: string;
  error?: string;
};

export default function Textarea({
  label,
  error,
  className = "",
  ...props
}: TextareaProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className={`flex flex-col ${className}`}>
      <label htmlFor={id} className="mb-2.5 text-base text-ink">
        {label}
      </label>
      <textarea
        {...props}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`min-h-28 w-full resize-y rounded-3xl bg-transparent px-6 py-3 text-sm text-ink transition-colors placeholder:text-placeholder hover:bg-mint-100/60 focus:border-action focus:bg-white/60 focus:outline-none focus:ring-4 focus:ring-action/15 ${
          error ? "border-[1.5px] border-alert-text" : "border border-brand"
        }`}
      />
      <p id={errorId} aria-live="polite" className="mt-1 min-h-5 text-sm text-alert-text">
        {error}
      </p>
    </div>
  );
}