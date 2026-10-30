import { useState } from "react";
import { isSameDay, type AgendaItem } from "../../modules/demo/demoData";
import Icon from "../ui/Icon";
import { ChevronLeftIcon, ChevronRightIcon } from "../ui/icons";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const FULL_FORMAT = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});
const MONTH_FORMAT = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });

type MonthCalendarProps = {
  items: AgendaItem[];
  selected: Date;
  onSelect: (date: Date) => void;
};

export default function MonthCalendar({ items, selected, onSelect }: MonthCalendarProps) {
  const today = new Date();
  const [view, setView] = useState(
    () => new Date(selected.getFullYear(), selected.getMonth(), 1),
  );

  const year = view.getFullYear();
  const month = view.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const blanks = new Date(year, month, 1).getDay();

  const cells: (Date | null)[] = [
    ...Array.from({ length: blanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];

  const monthText = MONTH_FORMAT.format(view);
  const title = monthText.charAt(0).toUpperCase() + monthText.slice(1);

  const countOn = (date: Date) => items.filter((item) => isSameDay(item.date, date)).length;

  function goTo(offset: number) {
    setView(new Date(year, month + offset, 1));
  }

  function goToday() {
    setView(new Date(today.getFullYear(), today.getMonth(), 1));
    onSelect(today);
  }

  const navButton =
    "flex size-11 items-center justify-center rounded-full border border-brand text-action transition-colors hover:bg-mint-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action";

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h3 aria-live="polite" className="text-2xl font-medium text-deep">
          {title}
        </h3>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => goTo(-1)} aria-label="Mês anterior" className={navButton}>
            <Icon icon={ChevronLeftIcon} size={20} />
          </button>
          <button
            type="button"
            onClick={goToday}
            className="inline-flex h-11 items-center rounded-full border border-brand px-5 text-sm font-medium text-action transition-colors hover:bg-mint-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
          >
            Hoje
          </button>
          <button type="button" onClick={() => goTo(1)} aria-label="Próximo mês" className={navButton}>
            <Icon icon={ChevronRightIcon} size={20} />
          </button>
        </div>
      </div>

      <div aria-hidden="true" className="mb-2 grid grid-cols-7 gap-1.5 text-center text-sm font-medium text-ink-soft sm:gap-2">
        {WEEKDAYS.map((weekday) => (
          <span key={weekday}>{weekday}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {cells.map((date, index) => {
          if (!date) return <span key={`blank-${index}`} aria-hidden="true" />;

          const isSelected = isSameDay(date, selected);
          const isToday = isSameDay(date, today);
          const count = countOn(date);
          const label = `${FULL_FORMAT.format(date)}${
            count > 0 ? `, ${count} compromisso${count > 1 ? "s" : ""}` : ""
          }`;

          return (
            <button
              key={date.getDate()}
              type="button"
              onClick={() => onSelect(date)}
              aria-label={label}
              aria-pressed={isSelected}
              aria-current={isToday ? "date" : undefined}
              className={`relative flex aspect-square min-h-11 items-center justify-center rounded-full text-base transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action ${
                isSelected
                  ? "bg-action font-semibold text-white shadow-[0_8px_20px_rgba(36,116,119,0.3)]"
                  : isToday
                    ? "border-2 border-brand font-semibold text-action hover:bg-mint-100"
                    : "text-ink hover:bg-mint-100"
              }`}
            >
              <span className={count > 0 ? "-mt-1" : ""}>{date.getDate()}</span>
              {count > 0 && (
                <span
                  aria-hidden="true"
                  className={`absolute bottom-1.5 size-1.5 rounded-full ${
                    isSelected ? "bg-white" : "bg-brand"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      <p className="mt-4 flex items-center gap-2 text-sm text-ink-soft">
        <span aria-hidden="true" className="size-1.5 rounded-full bg-brand" />
        Dia com compromissos
      </p>
    </div>
  );
}