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
    <div className={`flex flex-col gap-[10px] ${className}`}>
      <label htmlFor={id} className="text-base font-medium text-ink">
        {label}
      </label>

      <div className="relative">
        <input
          {...props}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`h-14 w-full rounded-full bg-white px-6 text-base text-ink placeholder:text-placeholder focus:border-action focus:outline-none focus:ring-4 focus:ring-action/18 ${
            error
              ? "border-2 border-alert-text"
              : "border-[1.5px] border-field-border"
          } ${trailing ? "pr-24" : ""}`}
        />
        {trailing && (
          <div className="absolute inset-y-0 right-5 flex items-center">
            {trailing}
          </div>
        )}
      </div>

      {error && (
        <p id={errorId} className="text-sm text-alert-text">
          {error}
        </p>
      )}
    </div>
  );
}