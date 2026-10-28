import { useId, type ComponentProps, type ReactNode } from "react";

type InputProps = Omit<ComponentProps<"input">, "id"> & {
  label: string;
  error?: string;
  trailing?: ReactNode;
};

export default function Input({
  label,
  error,
  trailing,
  className = "",
  ...props
}: InputProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className={`flex flex-col ${className}`}>
      <label htmlFor={id} className="mb-2.5 text-base text-ink">
        {label}
      </label>

      <div className="relative">
        <input
          {...props}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`h-11 w-full rounded-full bg-transparent text-sm text-ink transition-colors placeholder:text-placeholder hover:bg-mint-100/60 focus:border-action focus:bg-white/60 focus:outline-none focus:ring-4 focus:ring-action/15 ${
            trailing ? "pl-6 pr-12" : "px-6"
          } ${
            error ? "border-[1.5px] border-alert-text" : "border border-brand"
          }`}
        />
        {trailing && (
          <div className="absolute inset-y-0 right-2 flex items-center">
            {trailing}
          </div>
        )}
      </div>

      <p
        id={errorId}
        aria-live="polite"
        className="mt-1 min-h-5 text-sm text-alert-text"
      >
        {error}
      </p>
    </div>
  );
}