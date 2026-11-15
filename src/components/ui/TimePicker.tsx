import { useEffect, useRef, useState } from "react";

type TimePickerProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
  disabled?: boolean;
  name?: string;
  required?: boolean;
  minTime?: string;
  maxTime?: string;
  interval?: number;
};

function generateTimes(interval: number) {
  const safeInterval = interval > 0 ? interval : 30;
  const times: string[] = [];

  for (let minutes = 0; minutes < 24 * 60; minutes += safeInterval) {
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;

    times.push(
      `${String(hours).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`,
    );
  }

  return times;
}

export default function TimePicker({
  label,
  value,
  onChange,
  error,
  className = "",
  disabled = false,
  name,
  required = false,
  minTime,
  maxTime,
  interval = 30,
}: TimePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const id = useRef(
    `time-picker-${Math.random().toString(36).slice(2, 10)}`,
  ).current;
  const errorId = `${id}-error`;

  const times = generateTimes(interval).filter(
    (time) =>
      (!minTime || time >= minTime) &&
      (!maxTime || time <= maxTime),
  );

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!open || !value || !listRef.current) return;

    const selectedOption = listRef.current.querySelector<HTMLElement>(
      `[data-time="${value}"]`,
    );

    selectedOption?.scrollIntoView({ block: "nearest" });
  }, [open, value]);

  return (
    <div
      ref={containerRef}
      className={`flex min-w-0 flex-col ${className}`}
    >
      <label
        htmlFor={id}
        className="mb-2.5 text-base text-ink"
      >
        {label}
      </label>

      <div className="relative">
        <input
          type="hidden"
          name={name}
          value={value}
        />

        <button
          id={id}
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={`${id}-options`}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          aria-required={required}
          onClick={() => setOpen((current) => !current)}
          className={`flex h-11 w-full items-center justify-between rounded-full border bg-transparent px-6 text-left text-sm transition-colors focus:outline-none focus:ring-4 focus:ring-action/15 disabled:cursor-not-allowed disabled:opacity-50 ${
            error
              ? "border-[1.5px] border-alert-text"
              : "border-brand hover:bg-mint-100/60 focus:border-action focus:bg-white/60"
          }`}
        >
          <span className={value ? "text-ink" : "text-placeholder"}>
            {value || "Selecione o horário"}
          </span>

          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            className={`h-[18px] w-[18px] shrink-0 text-ink-soft transition-transform ${
              open ? "rotate-180" : ""
            }`}
          >
            <path
              d="m6 9 6 6 6-6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {open && !disabled && (
          <div
            className="absolute inset-x-0 z-50 mt-2 overflow-hidden rounded-[20px] border border-brand/40 bg-white shadow-[0_12px_36px_rgba(18,63,66,0.16)]"
          >
            <div
              ref={listRef}
              id={`${id}-options`}
              role="listbox"
              aria-label={label}
              className="max-h-56 overflow-y-auto p-2"
            >
              {times.map((time) => {
                const selected = time === value;

                return (
                  <button
                    key={time}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    data-time={time}
                    onClick={() => {
                      onChange(time);
                      setOpen(false);
                    }}
                    className={`flex min-h-10 w-full items-center justify-between rounded-full px-4 py-2 text-left text-sm transition-colors ${
                      selected
                        ? "bg-mint-100 font-medium text-action"
                        : "text-ink hover:bg-mint-100/70"
                    }`}
                  >
                    <span>{time}</span>
                    {selected && (
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 20 20"
                        fill="none"
                        className="h-4 w-4 text-action"
                      >
                        <path
                          d="m4 10 4 4 8-8"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                );
              })}

              {times.length === 0 && (
                <p className="px-4 py-3 text-sm text-ink-soft">
                  Nenhum horário disponível.
                </p>
              )}
            </div>
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