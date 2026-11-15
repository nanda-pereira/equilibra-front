
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

type DatePickerProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  error?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
};

type CalendarPosition = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
};

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

const MONTH_FORMAT = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
});

const VIEWPORT_MARGIN = 12;
const FIELD_GAP = 8;
const DESKTOP_CALENDAR_WIDTH = 360;

function parseDate(value: string) {
  if (!value) return null;

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
}

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function DatePicker({
  label,
  value,
  onChange,
  min,
  error,
  className = "",
  disabled = false,
  required = false,
  name,
}: DatePickerProps) {
  const id = useId();
  const errorId = `${id}-error`;

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  const selectedDate = parseDate(value);
  const minimumDate = parseDate(min ?? "");

  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<CalendarPosition | null>(null);

  const [visibleMonth, setVisibleMonth] = useState(() => {
    const initial = selectedDate ?? minimumDate ?? new Date();

    return new Date(
      initial.getFullYear(),
      initial.getMonth(),
      1,
    );
  });

  useEffect(() => {
    if (!selectedDate) return;

    setVisibleMonth(
      new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        1,
      ),
    );
  }, [value]);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;

    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const width = Math.min(
      DESKTOP_CALENDAR_WIDTH,
      viewportWidth - VIEWPORT_MARGIN * 2,
    );

    const left = Math.max(
      VIEWPORT_MARGIN,
      Math.min(
        rect.left,
        viewportWidth - width - VIEWPORT_MARGIN,
      ),
    );

    const availableBelow =
      viewportHeight - rect.bottom - FIELD_GAP - VIEWPORT_MARGIN;

    const availableAbove =
      rect.top - FIELD_GAP - VIEWPORT_MARGIN;

    // Prioriza abrir abaixo. Se o espaço for insuficiente,
    // abre acima quando houver mais espaço nessa direção.
    const openAbove =
      availableBelow < 360 && availableAbove > availableBelow;

    const maxHeight = Math.max(
      180,
      Math.min(
        480,
        openAbove ? availableAbove : availableBelow,
      ),
    );

    const top = openAbove
      ? Math.max(
          VIEWPORT_MARGIN,
          rect.top - FIELD_GAP - maxHeight,
        )
      : rect.bottom + FIELD_GAP;

    setPosition({
      top,
      left,
      width,
      maxHeight,
    });
  }, []);

  useEffect(() => {
    if (!open) return;

    updatePosition();

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;

      if (
        containerRef.current?.contains(target) ||
        calendarRef.current?.contains(target)
      ) {
        return;
      }

      setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    function handleViewportChange() {
      updatePosition();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    // Capture permite acompanhar a rolagem do modal e de outros
    // contêineres, não apenas a rolagem da janela.
    window.addEventListener("scroll", handleViewportChange, true);
    window.addEventListener("resize", handleViewportChange);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleViewportChange, true);
      window.removeEventListener("resize", handleViewportChange);
    };
  }, [open, updatePosition]);

  const firstDay = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth(),
    1,
  );

  // Ajusta o domingo para a última coluna, com a semana começando na segunda.
  const leadingDays = (firstDay.getDay() + 6) % 7;

  const daysInMonth = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth() + 1,
    0,
  ).getDate();

  const cells: Array<Date | null> = [
    ...Array.from({ length: leadingDays }, () => null),
    ...Array.from(
      { length: daysInMonth },
      (_, index) =>
        new Date(
          visibleMonth.getFullYear(),
          visibleMonth.getMonth(),
          index + 1,
        ),
    ),
  ];

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const previousMonth = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth() - 1,
    1,
  );

  const previousMonthDisabled =
    !!minimumDate &&
    previousMonth.getFullYear() === minimumDate.getFullYear() &&
    previousMonth.getMonth() < minimumDate.getMonth();

  const monthTitle = MONTH_FORMAT.format(visibleMonth);

  const formattedMonth =
    monthTitle.charAt(0).toUpperCase() + monthTitle.slice(1);

  function toggleCalendar() {
    if (disabled) return;

    if (open) {
      setOpen(false);
      return;
    }

    updatePosition();
    setOpen(true);
  }

  function changeMonth(offset: number) {
    setVisibleMonth(
      new Date(
        visibleMonth.getFullYear(),
        visibleMonth.getMonth() + offset,
        1,
      ),
    );
  }

  function selectDate(date: Date) {
    onChange(formatDate(date));
    setOpen(false);
    triggerRef.current?.focus();
  }

  function selectToday() {
    if (minimumDate && today < minimumDate) return;

    setVisibleMonth(
      new Date(today.getFullYear(), today.getMonth(), 1),
    );

    onChange(formatDate(today));
    setOpen(false);
    triggerRef.current?.focus();
  }

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

      <input
        type="hidden"
        name={name}
        value={value}
      />

      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={`${id}-calendar`}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        aria-required={required}
        onClick={toggleCalendar}
        className={`flex h-11 w-full items-center justify-between rounded-full border bg-transparent px-5 text-left text-sm transition-colors focus:outline-none focus:ring-4 focus:ring-action/15 disabled:cursor-not-allowed disabled:opacity-50 sm:px-6 ${
          error
            ? "border-[1.5px] border-alert-text"
            : "border-brand hover:bg-mint-100/60 focus:border-action focus:bg-white/60"
        }`}
      >
        <span className={value ? "text-ink" : "text-placeholder"}>
          {selectedDate
            ? selectedDate.toLocaleDateString("pt-BR")
            : "Selecione a data"}
        </span>

        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          className="h-[18px] w-[18px] shrink-0 text-ink-soft"
        >
          <rect
            x="3.5"
            y="5"
            width="17"
            height="15.5"
            rx="3"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M7.5 3.5v3M16.5 3.5v3M3.5 9.5h17"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open && position && (
        <div
          ref={calendarRef}
          id={`${id}-calendar`}
          role="dialog"
          aria-label="Selecionar data"
          style={{
            position: "fixed",
            top: position.top,
            left: position.left,
            width: position.width,
            maxHeight: position.maxHeight,
            overflowY: "auto",
            overscrollBehavior: "contain",
            zIndex: 9999,
          }}
          className="rounded-[22px] border border-brand/40 bg-white p-3 shadow-[0_16px_44px_rgba(18,63,66,0.20)] sm:rounded-[24px] sm:p-5"
        >
          {/* Navegação do calendário */}
          <div className="mb-3 flex items-center justify-between gap-2 sm:mb-4">
            <button
              type="button"
              aria-label="Mês anterior"
              disabled={previousMonthDisabled}
              onClick={() => changeMonth(-1)}
              className="flex size-9 shrink-0 items-center justify-center rounded-full text-action transition-colors hover:bg-mint-100 disabled:cursor-not-allowed disabled:opacity-30 sm:size-10"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="size-5"
                aria-hidden="true"
              >
                <path
                  d="m15 18-6-6 6-6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <p className="text-center text-sm font-medium text-deep sm:text-base">
              {formattedMonth}
            </p>

            <button
              type="button"
              aria-label="Próximo mês"
              onClick={() => changeMonth(1)}
              className="flex size-9 shrink-0 items-center justify-center rounded-full text-action transition-colors hover:bg-mint-100 sm:size-10"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="size-5"
                aria-hidden="true"
              >
                <path
                  d="m9 18 6-6-6-6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* Dias da semana */}
          <div className="mb-1 grid grid-cols-7">
            {WEEKDAYS.map((weekday) => (
              <span
                key={weekday}
                className="flex h-8 items-center justify-center text-xs font-medium text-ink-soft sm:h-9"
              >
                {weekday}
              </span>
            ))}
          </div>

          {/* Dias do mês */}
          <div className="grid grid-cols-7 gap-y-1 sm:gap-y-2">
            {cells.map((day, index) => {
              if (!day) {
                return (
                  <span
                    key={`empty-${index}`}
                    className="h-9 sm:h-10"
                  />
                );
              }

              const dayValue = formatDate(day);
              const selected = dayValue === value;

              const isToday =
                day.getFullYear() === today.getFullYear() &&
                day.getMonth() === today.getMonth() &&
                day.getDate() === today.getDate();

              const isDisabled =
                !!minimumDate && day < minimumDate;

              return (
                <button
                  key={dayValue}
                  type="button"
                  disabled={isDisabled}
                  aria-pressed={selected}
                  aria-label={day.toLocaleDateString("pt-BR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  onClick={() => selectDate(day)}
                  className={`mx-auto flex size-8 items-center justify-center rounded-full text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-25 sm:size-10 ${
                    selected
                      ? "bg-action font-medium text-white"
                      : isToday
                        ? "border border-brand font-medium text-action"
                        : "text-ink hover:bg-mint-100"
                  }`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          {/* Atalho para hoje */}
          <div className="mt-3 border-t border-line pt-2 sm:mt-4 sm:pt-3">
            <button
              type="button"
              onClick={selectToday}
              disabled={!!minimumDate && today < minimumDate}
              className="w-full rounded-full px-4 py-2 text-sm font-medium text-action transition-colors hover:bg-mint-100 disabled:opacity-40 sm:py-3"
            >
              Hoje
            </button>
          </div>
        </div>
      )}

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
