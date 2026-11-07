import { useState, type FormEvent } from "react";
import Avatar from "../../components/app/Avatar";
import EmptyState from "../../components/app/EmptyState";
import GlassCard from "../../components/app/GlassCard";
import ListRow from "../../components/app/ListRow";
import MetricCard from "../../components/app/MetricCard";
import Modal from "../../components/app/Modal";
import MonthCalendar from "../../components/app/MonthCalendar";
import PageHeader from "../../components/app/PageHeader";
import PatientFilter from "../../components/app/PatientFilter";
import SmallButton from "../../components/app/SmallButton";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import { CalendarIcon, ClockIcon, PatientsIcon } from "../../components/ui/icons";
import { addConsultation, getAgendaFor, useAppState } from "../../modules/demo/appStore";
import {
  PATIENTS_BASE,
  addDays,
  fromISO,
  isSameDay,
  longDayLabel,
  shortDay,
  toISO,
  type AgendaItem,
} from "../../modules/demo/demoData";

const TYPES = ["Consulta de acompanhamento", "Consulta de retorno", "Primeira consulta"];

const LONG_FORMAT = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

const hourOf = (time: string) => Number.parseInt(time.slice(0, 2), 10);

const byDateAndTime = (a: AgendaItem, b: AgendaItem) =>
  a.date.getTime() - b.date.getTime() || a.time.localeCompare(b.time);

export default function DoctorAgendaPage() {
  useAppState();
  const [patientFilter, setPatientFilter] = useState("all");
  const [selected, setSelected] = useState(() => new Date());
  const [open, setOpen] = useState(false);
  const [patient, setPatient] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState(TYPES[0]);
  const [submitted, setSubmitted] = useState(false);
  const [flash, setFlash] = useState("");

  const allItems = getAgendaFor("medico");
  const items =
    patientFilter === "all" ? allItems : allItems.filter((item) => item.patientId === patientFilter);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfWeek = addDays(6);
  endOfWeek.setHours(23, 59, 59, 999);

  const todayCount = items.filter((item) => isSameDay(item.date, new Date())).length;
  const weekCount = items.filter((item) => item.date >= startOfToday && item.date <= endOfWeek).length;
  const upcoming = items.filter((item) => item.date >= startOfToday).sort(byDateAndTime);
  const next = upcoming[0];

  const dayItems = items.filter((item) => isSameDay(item.date, selected)).sort(byDateAndTime);
  const dayHours = dayItems.map((item) => hourOf(item.time));
  const firstHour = Math.min(8, ...dayHours);
  const lastHour = Math.max(18, ...dayHours);
  const hours = Array.from({ length: lastHour - firstHour + 1 }, (_, i) => firstHour + i);
  const selectedText = LONG_FORMAT.format(selected);
  const selectedTitle = selectedText.charAt(0).toUpperCase() + selectedText.slice(1);

  const todayISO = toISO(new Date());
  const timeKey = time.replace(":", "h");
  const errors = {
    patient: patient ? undefined : "Selecione uma opção",
    date: !date ? "Campo obrigatório" : date < todayISO ? "A data não pode ser anterior a hoje" : undefined,
    time: !time
      ? "Campo obrigatório"
      : date && allItems.some((item) => isSameDay(item.date, fromISO(date)) && item.time === timeKey)
        ? "Já existe uma consulta neste horário"
        : undefined,
  };

  const startNew = () => {
    setPatient("");
    setDate(toISO(selected) < todayISO ? todayISO : toISO(selected));
    setTime("");
    setType(TYPES[0]);
    setSubmitted(false);
    setFlash("");
    setOpen(true);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    const target = PATIENTS_BASE.find((item) => item.name === patient);
    if (errors.patient || errors.date || errors.time || !target) return;

    addConsultation({ patientId: target.id, dateISO: date, time, detail: type });
    setSelected(fromISO(date));
    setOpen(false);
    setFlash(`Consulta de ${target.name} agendada para ${longDayLabel(fromISO(date), timeKey)}.`);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Agenda" subtitle="Suas consultas" demo>
        <SmallButton variant="solid" onClick={startNew}>
          Nova consulta
        </SmallButton>
      </PageHeader>

      {flash && (
        <p role="status" className="rounded-[20px] bg-success-bg px-4 py-3 text-sm text-success-text">
          {flash} Como é uma demonstração, os dados não são enviados a um servidor.
        </p>
      )}

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
        <PatientFilter value={patientFilter} onChange={setPatientFilter} includeAll />
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
                    className="grid grid-cols-[40px_1fr] gap-3 border-t border-line py-2 first:border-t-0"
                  >
                    <span className="pt-2 text-sm text-ink-soft">{String(hour).padStart(2, "0")}h</span>
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
                              <SmallButton to={`/app/pacientes/${item.patientId}`} label={`Ver dados de ${item.title}`}>
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
                    <SmallButton to={`/app/pacientes/${item.patientId}`} label={`Ver dados de ${item.title}`}>
                      Ver paciente
                    </SmallButton>
                  ) : undefined
                }
              />
            ))}
          </ul>
        )}
      </GlassCard>

      <Modal open={open} title="Nova consulta" onClose={() => setOpen(false)}>
        <form noValidate onSubmit={handleSubmit}>
          <Select
            label="Paciente"
            options={PATIENTS_BASE.map((item) => item.name)}
            value={patient}
            onChange={(e) => setPatient(e.target.value)}
            error={submitted ? errors.patient : undefined}
          />
          <div className="grid gap-x-6 sm:grid-cols-2">
            <Input
              label="Data"
              type="date"
              min={todayISO}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              error={submitted ? errors.date : undefined}
            />
            <Input
              label="Horário"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              error={submitted ? errors.time : undefined}
            />
          </div>
          <Select label="Tipo" options={TYPES} value={type} onChange={(e) => setType(e.target.value)} />
          <div className="mt-2 flex flex-wrap gap-3">
            <SmallButton type="submit" variant="solid">
              Agendar consulta
            </SmallButton>
            <SmallButton onClick={() => setOpen(false)}>Cancelar</SmallButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}