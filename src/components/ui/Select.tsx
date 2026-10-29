import { useId, type ComponentProps } from "react";
import Icon from "./Icon";
import { ChevronDownIcon } from "./icons";

type SelectProps = Omit<ComponentProps<"select">, "id" | "children"> & {
  label: string;
  options: string[];
  placeholder?: string;
  error?: string;
};

export default function Select({
  label,
  options,
  placeholder = "Selecione",
  error,
  className = "",
  value,
  ...props
}: SelectProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const isEmpty = value === "";

  return (
    <div className={`flex flex-col ${className}`}>
      <label htmlFor={id} className="mb-2.5 text-base text-ink">
        {label}
      </label>

      <div className="relative">
        <select
          {...props}
          id={id}
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`h-11 w-full cursor-pointer appearance-none rounded-full bg-transparent pl-6 pr-12 text-sm transition-colors hover:bg-mint-100/60 focus:border-action focus:bg-white/60 focus:outline-none focus:ring-4 focus:ring-action/15 ${
            isEmpty ? "text-placeholder" : "text-ink"
          } ${
            error ? "border-[1.5px] border-alert-text" : "border border-brand"
          }`}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option} value={option} className="text-ink">
              {option}
            </option>
          ))}
        </select>

        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-ink-soft"
        >
          <Icon icon={ChevronDownIcon} size={18} />
        </span>
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