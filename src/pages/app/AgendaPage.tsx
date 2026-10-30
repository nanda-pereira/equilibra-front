import { useMemo, useState } from "react";
import EmptyState from "../../components/app/EmptyState";
import GlassCard from "../../components/app/GlassCard";
import ListRow from "../../components/app/ListRow";
import MonthCalendar from "../../components/app/MonthCalendar";
import PageHeader from "../../components/app/PageHeader";
import { CalendarIcon, ExerciseIcon } from "../../components/ui/icons";
import { getAgendaFor, isSameDay, shortDay } from "../../modules/demo/demoData";
import { useSession } from "../../modules/session/session";

const LONG_FORMAT = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

function byDateAndTime(
  a: { date: Date; time: string },
  b: { date: Date; time: string },
) {
  const diff = a.date.getTime() - b.date.getTime();
  return diff !== 0 ? diff : a.time.localeCompare(b.time);
}

export default function AgendaPage() {
  const { session } = useSession();
  const [selected, setSelected] = useState(() => new Date());
  const items = useMemo(() => (session ? getAgendaFor(session.profile) : []), [session]);

  if (!session) return null;

  const dayItems = items
    .filter((item) => isSameDay(item.date, selected))
    .sort(byDateAndTime);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const upcoming = items
    .filter((item) => item.date >= startOfToday)
    .sort(byDateAndTime)
    .slice(0, 4);

  const selectedText = LONG_FORMAT.format(selected);
  const selectedTitle = selectedText.charAt(0).toUpperCase() + selectedText.slice(1);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Agenda" subtitle="Consultas e atividades" demo />

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <GlassCard className="sm:p-8">
          <MonthCalendar items={items} selected={selected} onSelect={setSelected} />
        </GlassCard>

        <div className="flex flex-col gap-6">
          <GlassCard title={selectedTitle}>
            {dayItems.length === 0 ? (
              <EmptyState title="Nenhum compromisso neste dia" />
            ) : (
              <ul className="flex flex-col gap-3">
                {dayItems.map((item) => (
                  <ListRow
                    key={item.id}
                    icon={item.kind === "consulta" ? CalendarIcon : ExerciseIcon}
                    title={item.title}
                    subtitle={`${item.time} · ${item.detail}`}
                  />
                ))}
              </ul>
            )}
          </GlassCard>

          <GlassCard title="Próximos compromissos">
            {upcoming.length === 0 ? (
              <EmptyState title="Nenhum compromisso previsto" />
            ) : (
              <ul className="flex flex-col gap-3">
                {upcoming.map((item) => (
                  <ListRow
                    key={item.id}
                    icon={item.kind === "consulta" ? CalendarIcon : ExerciseIcon}
                    title={item.title}
                    subtitle={`${shortDay(item.date)} · ${item.time} · ${item.detail}`}
                  />
                ))}
              </ul>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}