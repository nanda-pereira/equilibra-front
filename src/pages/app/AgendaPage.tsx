import { useEffect, useState } from "react";
import EmptyState from "../../components/app/EmptyState";
import GlassCard from "../../components/app/GlassCard";
import ListRow from "../../components/app/ListRow";
import MonthCalendar from "../../components/app/MonthCalendar";
import PageHeader from "../../components/app/PageHeader";
import { CalendarIcon, ExerciseIcon } from "../../components/ui/icons";
import {
  getAccessiblePatients,
  getMyPatientAppointments,
  getPatientAppointments,
  type PatientAppointment,
} from "../../services/api/patients";
import { useSession } from "../../modules/session/session";

type AgendaItem = {
  id: string;
  date: Date;
  time: string;
  kind: "consulta" | "exercicio";
  title: string;
  detail: string;
};

const LONG_FORMAT = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

const TIME_FORMAT = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

const DAY_FORMAT = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
});

function byDateAndTime(a: AgendaItem, b: AgendaItem) {
  return a.date.getTime() - b.date.getTime() ||
    a.time.localeCompare(b.time);
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function toAgendaItem(
  appointment: PatientAppointment,
  patientName?: string,
): AgendaItem | null {
  const scheduledAt =
    appointment.data?.scheduledAt ??
    appointment.scheduledAt;

  if (!scheduledAt) return null;

  const date = new Date(scheduledAt);

  if (Number.isNaN(date.getTime())) return null;

  const title = appointment.data?.title || "Compromisso";
  const location = appointment.data?.location;
  const notes = appointment.data?.notes;

  return {
    id: appointment._id,
    date,
    time: TIME_FORMAT.format(date),
    kind: /exerc[ií]cio|atividade/i.test(title)
      ? "exercicio"
      : "consulta",
    title,
    detail: [patientName, location, notes]
      .filter(Boolean)
      .join(" · ") || "Compromisso agendado",
  };
}

function getPatientName(
  patient: { userId?: string | { fullName?: string; email?: string } },
) {
  return typeof patient.userId === "object" && patient.userId !== null
    ? patient.userId.fullName || patient.userId.email || "Paciente"
    : "Paciente";
}

export default function AgendaPage() {
  const { session } = useSession();
  const [selected, setSelected] = useState(() => new Date());
  const [items, setItems] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const accessToken = session?.accessToken;
  const profile = session?.profile;

  useEffect(() => {
    let cancelled = false;

    async function loadAgenda() {
      if (!accessToken || !profile) {
        setItems([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        let appointments: AgendaItem[] = [];

        if (profile === "paciente") {
          const result = await getMyPatientAppointments(accessToken, session?.userId ?? "");
          appointments = result
            .map((appointment) => toAgendaItem(appointment))
            .filter((item): item is AgendaItem => item !== null);
        } else {
          const patients = await getAccessiblePatients(accessToken);

          const results = await Promise.all(
            patients.map(async (patient) => {
              const patientId = patient.id ?? patient._id;
              if (!patientId) return [];

              const patientAppointments = await getPatientAppointments(
                accessToken,
                patientId,
              );

              const patientName = getPatientName(patient);

              return patientAppointments
                .map((appointment) =>
                  toAgendaItem(appointment, patientName),
                )
                .filter((item): item is AgendaItem => item !== null);
            }),
          );

          appointments = results.flat();
        }

        if (!cancelled) {
          setItems(appointments.sort(byDateAndTime));
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Não foi possível carregar a agenda.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadAgenda();

    return () => {
      cancelled = true;
    };
  }, [accessToken, profile, session?.userId]);

  if (!session) return null;

  const dayItems = items.filter((item) =>
    isSameDay(item.date, selected),
  );

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const upcoming = items
    .filter((item) => item.date >= startOfToday)
    .sort(byDateAndTime)
    .slice(0, 4);

  const selectedText = LONG_FORMAT.format(selected);
  const selectedTitle =
    selectedText.charAt(0).toUpperCase() + selectedText.slice(1);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Agenda"
        subtitle="Consultas e atividades"
      />

      {error && (
        <div
          role="alert"
          className="rounded-2xl bg-alert-bg p-4 text-sm text-alert-text"
        >
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <GlassCard className="sm:p-8">
          <MonthCalendar
            items={items}
            selected={selected}
            onSelect={setSelected}
          />
        </GlassCard>

        <div className="flex flex-col gap-6">
          <GlassCard title={selectedTitle}>
            {loading ? (
              <p className="text-sm text-ink-soft">
                Carregando compromissos...
              </p>
            ) : dayItems.length === 0 ? (
              <EmptyState title="Nenhum compromisso neste dia" />
            ) : (
              <ul className="flex flex-col gap-3">
                {dayItems.map((item) => (
                  <ListRow
                    key={item.id}
                    icon={
                      item.kind === "consulta"
                        ? CalendarIcon
                        : ExerciseIcon
                    }
                    title={item.title}
                    subtitle={`${item.time} · ${item.detail}`}
                  />
                ))}
              </ul>
            )}
          </GlassCard>

          <GlassCard title="Próximos compromissos">
            {loading ? (
              <p className="text-sm text-ink-soft">
                Carregando compromissos...
              </p>
            ) : upcoming.length === 0 ? (
              <EmptyState title="Nenhum compromisso previsto" />
            ) : (
              <ul className="flex flex-col gap-3">
                {upcoming.map((item) => (
                  <ListRow
                    key={item.id}
                    icon={
                      item.kind === "consulta"
                        ? CalendarIcon
                        : ExerciseIcon
                    }
                    title={item.title}
                    subtitle={`${DAY_FORMAT.format(item.date)} · ${item.time} · ${item.detail}`}
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