
import { useEffect, useState, type FormEvent } from "react";
import Avatar from "../../components/app/Avatar";
import EmptyState from "../../components/app/EmptyState";
import GlassCard from "../../components/app/GlassCard";
import ListRow from "../../components/app/ListRow";
import MetricCard from "../../components/app/MetricCard";
import Modal, {
  useModalDialog,
} from "../../components/app/Modal";
import MonthCalendar from "../../components/app/MonthCalendar";
import PageHeader from "../../components/app/PageHeader";
import SmallButton from "../../components/app/SmallButton";
import Select from "../../components/ui/Select";
import {
  CalendarIcon,
  ClockIcon,
  PatientsIcon,
} from "../../components/ui/icons";
import {
  createPatientAppointment,
  getAccessiblePatients,
  getPatientAppointments,
  type PatientAppointment,
  type PatientProfile,
} from "../../services/api/patients";
import { useSession } from "../../modules/session/session";
import TimePicker from "../../components/ui/TimePicker";
import DatePicker from "../../components/ui/DatePicker";

type PatientOption = {
  id: string;
  name: string;
};

type AgendaItem = {
  id: string;
  patientId: string;
  date: Date;
  time: string;
  kind: "consulta" | "exercicio";
  title: string;
  detail: string;
};

type AgendaData = {
  patients: PatientOption[];
  items: AgendaItem[];
};

const TYPES = [
  {
    label: "Primeira consulta",
    value: "Primeira consulta",
  },
  {
    label: "Consulta de acompanhamento",
    value: "Consulta de acompanhamento",
  },
  {
    label: "Consulta de retorno",
    value: "Consulta de retorno",
  },
];

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

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function toDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function byDateAndTime(a: AgendaItem, b: AgendaItem) {
  return (
    a.date.getTime() - b.date.getTime() ||
    a.time.localeCompare(b.time)
  );
}

function toPatientOption(
  patient: PatientProfile,
): PatientOption | null {
  const id = patient.id ?? patient._id;

  if (!id) return null;

  const user = patient.userId;

  const name =
    typeof user === "object" && user !== null
      ? user.fullName || user.email
      : undefined;

  return {
    id,
    name: name || "Paciente",
  };
}

function toAgendaItem(
  appointment: PatientAppointment,
  patients: PatientOption[],
): AgendaItem | null {
  const scheduledAt =
    appointment.data?.scheduledAt ?? appointment.scheduledAt;

  if (!scheduledAt) return null;

  const date = new Date(scheduledAt);

  if (Number.isNaN(date.getTime())) return null;

  const patient = patients.find(
    (item) => item.id === appointment.patientId,
  );

  const appointmentTitle =
    appointment.data?.title || "Consulta";

  const location = appointment.data?.location;
  const notes = appointment.data?.notes;

  return {
    id: appointment._id,
    patientId: appointment.patientId,
    date,
    time: TIME_FORMAT.format(date),
    kind: /exerc[ií]cio|atividade/i.test(appointmentTitle)
      ? "exercicio"
      : "consulta",
    title: patient?.name || "Paciente",
    detail: [appointmentTitle, location, notes]
      .filter(Boolean)
      .join(" · "),
  };
}

async function fetchAgenda(
  token: string,
): Promise<AgendaData> {
  const patientProfiles = await getAccessiblePatients(token);

  const patients = patientProfiles
    .map(toPatientOption)
    .filter(
      (item): item is PatientOption => item !== null,
    );

  const appointmentResults = await Promise.all(
    patients.map((item) =>
      getPatientAppointments(token, item.id),
    ),
  );

  const items = appointmentResults
    .flat()
    .filter(
      (appointment) => appointment.status !== "CANCELLED",
    )
    .map((appointment) =>
      toAgendaItem(appointment, patients),
    )
    .filter(
      (item): item is AgendaItem => item !== null,
    )
    .sort(byDateAndTime);

  return { patients, items };
}

export default function DoctorAgendaPage() {
  const { session } = useSession();

  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [allItems, setAllItems] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [patientFilter, setPatientFilter] = useState("all");
  const [selected, setSelected] = useState(() => new Date());

  const [open, setOpen] = useState(false);
  const [patient, setPatient] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState(TYPES[0].value);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState("");

  const accessToken = session?.accessToken;

  useEffect(() => {
    let cancelled = false;

    if (!accessToken) {
      setLoading(false);
      setAllItems([]);
      setPatients([]);
      setPatient("");
      return;
    }

    async function load() {
      setLoading(true);

      try {
        const result = await fetchAgenda(accessToken!);

        if (cancelled) return;

        setPatients(result.patients);
        setAllItems(result.items);

        setPatient((current) =>
          result.patients.some((item) => item.id === current)
            ? current
            : result.patients[0]?.id ?? "",
        );

        setError("");
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Não foi possível carregar a agenda.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  const items =
    patientFilter === "all"
      ? allItems
      : allItems.filter(
          (item) => item.patientId === patientFilter,
        );

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfToday);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const todayCount = items.filter((item) =>
    isSameDay(item.date, new Date()),
  ).length;

  const weekCount = items.filter(
    (item) =>
      item.date >= startOfToday &&
      item.date <= endOfWeek,
  ).length;

  const upcoming = items
    .filter((item) => item.date >= startOfToday)
    .sort(byDateAndTime);

  const next = upcoming[0];

  const dayItems = items
    .filter((item) => isSameDay(item.date, selected))
    .sort(byDateAndTime);

  const dayHours = dayItems.map((item) =>
    Number.parseInt(item.time.slice(0, 2), 10),
  );

  const firstHour = Math.min(8, ...dayHours);
  const lastHour = Math.max(18, ...dayHours);

  const hours = Array.from(
    { length: lastHour - firstHour + 1 },
    (_, index) => firstHour + index,
  );

  const selectedText = LONG_FORMAT.format(selected);
  const selectedTitle =
    selectedText.charAt(0).toUpperCase() +
    selectedText.slice(1);

  const todayISO = toDateInput(new Date());

  const errors = {
    patient: patient
      ? undefined
      : "Selecione um paciente",
    date: !date
      ? "Campo obrigatório"
      : date < todayISO
        ? "A data não pode ser anterior a hoje"
        : undefined,
    time: !time
      ? "Campo obrigatório"
      : undefined,
  };

  function startNew() {
    setPatient(patients[0]?.id ?? "");

    setDate(
      toDateInput(selected) < todayISO
        ? todayISO
        : toDateInput(selected),
    );

    setTime("");
    setType(TYPES[0].value);
    setSubmitted(false);
    setError("");
    setFlash("");
    setOpen(true);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setSubmitted(true);

    if (errors.patient || errors.date || errors.time) {
      return;
    }

    if (!accessToken) {
      setError("Sua sessão expirou. Entre novamente.");
      return;
    }

    const selectedPatient = patients.find(
      (item) => item.id === patient,
    );

    if (!selectedPatient) {
      setError(
        "Não foi possível identificar o paciente selecionado.",
      );
      return;
    }

    const scheduledDate = new Date(`${date}T${time}:00`);

    if (Number.isNaN(scheduledDate.getTime())) {
      setError("Informe uma data e um horário válidos.");
      return;
    }

    const hasConflict = allItems.some(
      (item) =>
        item.patientId === patient &&
        item.date.getTime() === scheduledDate.getTime(),
    );

    if (hasConflict) {
      setError(
        "Esse paciente já possui um compromisso nesse horário.",
      );
      return;
    }

    setSaving(true);
    setError("");
    setFlash("");

    try {
      await createPatientAppointment(
        accessToken,
        patient,
        {
          title: type,
          scheduledAt: scheduledDate.toISOString(),
          durationMinutes: 30,
        },
      );

      setSelected(scheduledDate);
      setOpen(false);

      setFlash(
        `Consulta de ${selectedPatient.name} agendada para ${LONG_FORMAT.format(scheduledDate)} às ${TIME_FORMAT.format(scheduledDate)}.`,
      );

      const result = await fetchAgenda(accessToken);

      setPatients(result.patients);
      setAllItems(result.items);

      setPatient((current) =>
        result.patients.some((item) => item.id === current)
          ? current
          : result.patients[0]?.id ?? "",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível agendar a consulta.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (!session) return null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Agenda"
        subtitle="Suas consultas"
      >
        <SmallButton variant="solid" onClick={startNew}>
          Nova consulta
        </SmallButton>
      </PageHeader>

      {error && (
        <p
          role="alert"
          className="rounded-[20px] bg-alert-bg px-4 py-3 text-sm text-alert-text"
        >
          {error}
        </p>
      )}

      {flash && (
        <p
          role="status"
          className="rounded-[20px] bg-success-bg px-4 py-3 text-sm text-success-text"
        >
          {flash}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
        <MetricCard
          icon={ClockIcon}
          label="Consultas hoje"
          value={loading ? "—" : String(todayCount)}
        />

        <MetricCard
          icon={CalendarIcon}
          label="Próximos 7 dias"
          value={loading ? "—" : String(weekCount)}
          note={weekCount === 1 ? "consulta" : "consultas"}
        />

        <MetricCard
          icon={PatientsIcon}
          label="Próxima consulta"
          value={
            loading
              ? "—"
              : next
                ? DAY_FORMAT.format(next.date)
                : "—"
          }
          note={
            next
              ? `${next.time} · ${next.title}`
              : "Nenhuma consulta prevista"
          }
        />
      </div>

      <GlassCard title="Filtrar por paciente">
        <div className="max-w-md">
          <Select
            label="Paciente"
            options={[
              { label: "Todos os pacientes", value: "all" },
              ...patients.map((item) => ({
                label: item.name,
                value: item.id,
              })),
            ]}
            value={patientFilter}
            onChange={(event) =>
              setPatientFilter(event.target.value)
            }
            placeholder="Selecione um paciente"
          />
        </div>
      </GlassCard>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <GlassCard className="sm:p-8">
          <MonthCalendar
            key={`${selected.getFullYear()}-${selected.getMonth()}`}
            items={items}
            selected={selected}
            onSelect={setSelected}
          />
        </GlassCard>

        <GlassCard
          title={selectedTitle}
          description="Agenda do dia"
        >
          {loading ? (
            <p className="text-sm text-ink-soft">
              Carregando agenda...
            </p>
          ) : dayItems.length === 0 ? (
            <EmptyState title="Nenhuma consulta neste dia" />
          ) : (
            <ol
              aria-label="Consultas do dia por horário"
              className="flex flex-col"
            >
              {hours.map((hour) => {
                const rowItems = dayItems.filter(
                  (item) =>
                    Number.parseInt(item.time.slice(0, 2), 10) ===
                    hour,
                );

                return (
                  <li
                    key={hour}
                    className="grid grid-cols-[40px_1fr] gap-3 border-t border-line py-2 first:border-t-0"
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
                          <Avatar
                            name={item.title}
                            tone="soft"
                            className="bg-white!"
                          />

                          <div className="min-w-0 flex-1">
                            <p className="text-base font-medium text-ink">
                              {item.title}
                            </p>
                            <p className="text-sm text-ink-soft">
                              {item.time} · {item.detail}
                            </p>
                          </div>

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
        {loading ? (
          <p className="text-sm text-ink-soft">
            Carregando agenda...
          </p>
        ) : upcoming.length === 0 ? (
          <EmptyState title="Nenhuma consulta prevista" />
        ) : (
          <ul className="grid gap-3 lg:grid-cols-2">
            {upcoming.slice(0, 6).map((item) => (
              <ListRow
                key={item.id}
                icon={CalendarIcon}
                title={item.title}
                subtitle={`${DAY_FORMAT.format(item.date)} · ${item.time} · ${item.detail}`}
                trailing={
                  <SmallButton
                    to={`/app/pacientes/${item.patientId}`}
                    label={`Ver dados de ${item.title}`}
                  >
                    Ver paciente
                  </SmallButton>
                }
              />
            ))}
          </ul>
        )}
      </GlassCard>

      <Modal
        open={open}
        title="Nova consulta"
        onClose={() => {
          if (!saving) setOpen(false);
        }}
      >
        <NewAppointmentForm
          patients={patients}
          patient={patient}
          setPatient={setPatient}
          date={date}
          setDate={setDate}
          time={time}
          setTime={setTime}
          type={type}
          setType={setType}
          types={TYPES}
          todayISO={todayISO}
          submitted={submitted}
          errors={errors}
          saving={saving}
          onSubmit={handleSubmit}
          onCancel={() => {
            if (!saving) setOpen(false);
          }}
        />
      </Modal>
    </div>
  );
}

type NewAppointmentFormProps = {
  patients: PatientOption[];
  patient: string;
  setPatient: (value: string) => void;
  date: string;
  setDate: (value: string) => void;
  time: string;
  setTime: (value: string) => void;
  type: string;
  setType: (value: string) => void;
  types: { label: string; value: string }[];
  todayISO: string;
  submitted: boolean;
  errors: {
    patient?: string;
    date?: string;
    time?: string;
  };
  saving: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
};

function NewAppointmentForm({
  patients,
  patient,
  setPatient,
  date,
  setDate,
  time,
  setTime,
  type,
  setType,
  types,
  todayISO,
  submitted,
  errors,
  saving,
  onSubmit,
  onCancel,
}: NewAppointmentFormProps) {
  const dialog = useModalDialog();

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="flex flex-col gap-3 sm:gap-4"
    >
      <Select
        label="Paciente"
        options={patients.map((item) => ({
          label: item.name,
          value: item.id,
        }))}
        value={patient}
        onChange={(event) => setPatient(event.target.value)}
        placeholder="Selecione um paciente"
        error={submitted ? errors.patient : undefined}
        portalContainer={dialog}
      />

      <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
        <DatePicker
          label="Data"
          min={todayISO}
          value={date}
          onChange={setDate}
          error={submitted ? errors.date : undefined}
        />

        <TimePicker
          label="Horário"
          value={time}
          onChange={setTime}
          error={submitted ? errors.time : undefined}
          interval={30}
        />
      </div>

      <Select
        label="Tipo de consulta"
        options={types}
        value={type}
        onChange={(event) => setType(event.target.value)}
        portalContainer={dialog}
      />

      <div className="mt-2 flex flex-wrap gap-3">
        <SmallButton type="submit" variant="solid">
          {saving ? "Agendando..." : "Agendar consulta"}
        </SmallButton>

        <SmallButton onClick={onCancel}>
          Cancelar
        </SmallButton>
      </div>
    </form>
  );
}
