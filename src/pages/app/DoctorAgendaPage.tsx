import { useMemo, useState } from "react";
import Avatar from "../../components/app/Avatar";
import EmptyState from "../../components/app/EmptyState";
import GlassCard from "../../components/app/GlassCard";
import ListRow from "../../components/app/ListRow";
import MetricCard from "../../components/app/MetricCard";
import MonthCalendar from "../../components/app/MonthCalendar";
import PageHeader from "../../components/app/PageHeader";
import SmallButton from "../../components/app/SmallButton";
import { CalendarIcon, ClockIcon, PatientsIcon } from "../../components/ui/icons";
import {
  addDays,
  getAgendaFor,
  isSameDay,
  patients,
  shortDay,
  type AgendaItem,
} from "../../modules/demo/demoData";

const LONG_FORMAT = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

const hourOf = (time: string) => Number.parseInt(time.slice(0, 2), 10);

const byDateAndTime = (a: AgendaItem, b: AgendaItem) =>
  a.date.getTime() - b.date.getTime() || a.time.localeCompare(b.time);

export default function DoctorAgendaPage() {
  const allItems = useMemo(() => getAgendaFor("medico"), []);
  const [patientFilter, setPatientFilter] = useState("all");
  const [selected, setSelected] = useState(() => new Date());

  const items = useMemo(
    () =>
      patientFilter === "all"
        ? allItems
        : allItems.filter((item) => item.patientId === patientFilter),
    [allItems, patientFilter],
  );

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfWeek = addDays(6);
  endOfWeek.setHours(23, 59, 59, 999);

  const todayCount = items.filter((item) => isSameDay(item.date, new Date())).length;
  const weekCount = items.filter(
    (item) => item.date >= startOfToday && item.date <= endOfWeek,
  ).length;
  const upcoming = items.filter((item) => item.date >= startOfToday).sort(byDateAndTime);
  const next = upcoming[0];

  const dayItems = items
    .filter((item) => isSameDay(item.date, selected))
    .sort(byDateAndTime);
  const dayHours = dayItems.map((item) => hourOf(item.time));
  const firstHour = Math.min(8, ...dayHours);
  const lastHour = Math.max(18, ...dayHours);
  const hours = Array.from({ length: lastHour - firstHour + 1 }, (_, i) => firstHour + i);

  const selectedText = LONG_FORMAT.format(selected);
  const selectedTitle = selectedText.charAt(0).toUpperCase() + selectedText.slice(1);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Agenda" subtitle="Suas consultas" demo />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
        <MetricCard icon={ClockIcon} label="Consultas hoje" value={String(todayCount)} />
        <MetricCard
          icon={CalendarIcon}
          label="Próximos 7 dias"
          value={String(weekCount)}
          note={weekCount === 1 ? "consulta" : "consultas"}
        />
        <MetricCard
          icon={PatientsIcon}
          label="Próxima consulta"
          value={next ? shortDay(next.date) : "—"}
          note={next ? `${next.time} · ${next.title}` : "Nenhuma consulta prevista"}
        />
      </div>

      <GlassCard title="Filtrar por paciente">
        <div role="group" aria-label="Filtrar por paciente" className="flex flex-wrap gap-2.5">
          {[{ id: "all", name: "Todos" }, ...patients].map((option) => {
            const active = patientFilter === option.id;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={active}
                onClick={() => setPatientFilter(option.id)}
                className={`inline-flex h-10 items-center rounded-full px-5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action ${
                  active
                    ? "bg-action text-white shadow-[0_8px_20px_rgba(36,116,119,0.25)]"
                    : "border border-brand text-action hover:bg-mint-100"
                }`}
              >
                {option.name}
              </button>
            );
          })}
        </div>
      </GlassCard>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <GlassCard className="sm:p-8">
          <MonthCalendar items={items} selected={selected} onSelect={setSelected} />
        </GlassCard>

        <GlassCard title={selectedTitle} description="Agenda do dia">
          {dayItems.length === 0 ? (
            <EmptyState title="Nenhuma consulta neste dia" />
          ) : (
            <ol aria-label="Consultas do dia por horário" className="flex flex-col">
              {hours.map((hour) => {
                const rowItems = dayItems.filter((item) => hourOf(item.time) === hour);
                return (
                  <li
                    key={hour}
                    className="grid grid-cols-[44px_1fr] gap-3 border-t border-line py-2 first:border-t-0"
                  >
                    <span className="pt-2 text-sm text-ink-soft">
                      {String(hour).padStart(2, "0")}h
                    </span>
                    <div className="flex min-h-11 flex-col gap-2">
                      {rowItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-wrap items-center gap-3 rounded-[20px] bg-mint-100/80 px-4 py-3"
                        >
                          <Avatar name={item.title} tone="soft" className="bg-white!" />
                          <div className="min-w-0 flex-1">
                            <p className="text-base font-medium text-ink">{item.title}</p>
                            <p className="text-sm text-ink-soft">
                              {item.time} · {item.detail}
                            </p>
                          </div>
                          {item.patientId && (
                            <div className="flex flex-wrap gap-2">
                              <SmallButton
                                to={`/app/pacientes/${item.patientId}`}
                                label={`Ver dados de ${item.title}`}
                              >
                                Ver paciente
                              </SmallButton>
                              <SmallButton
                                variant="solid"
                                to={`/app/mensagens?paciente=${item.patientId}`}
                                label={`Contatar ${item.title}`}
                              >
                                Contatar
                              </SmallButton>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </GlassCard>
      </div>

      <GlassCard title="Próximas consultas">
        {upcoming.length === 0 ? (
          <EmptyState title="Nenhuma consulta prevista" />
        ) : (
          <ul className="grid gap-3 lg:grid-cols-2">
            {upcoming.slice(0, 6).map((item) => (
              <ListRow
                key={item.id}
                icon={CalendarIcon}
                title={item.title}
                subtitle={`${shortDay(item.date)} · ${item.time} · ${item.detail}`}
                trailing={
                  item.patientId ? (
                    <SmallButton
                      to={`/app/pacientes/${item.patientId}`}
                      label={`Ver dados de ${item.title}`}
                    >
                      Ver paciente
                    </SmallButton>
                  ) : undefined
                }
              />
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}