import type { ProfileType } from "../auth/types";

const WEEKDAY_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const pad = (value: number) => String(value).padStart(2, "0");
const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

export function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(12, 0, 0, 0);
  return date;
}

export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function weekdayShort(date: Date) {
  return WEEKDAY_SHORT[date.getDay()];
}

export function shortDay(date: Date) {
  return `${weekdayShort(date)}, ${pad(date.getDate())}/${pad(date.getMonth() + 1)}`;
}

function appointmentLabel(daysAhead: number, time: string) {
  const date = addDays(daysAhead);
  const weekday = capitalize(
    new Intl.DateTimeFormat("pt-BR", { weekday: "long" }).format(date),
  );
  return `${weekday}, ${pad(date.getDate())}/${pad(date.getMonth() + 1)} às ${time}`;
}

export const DEMO_PATIENT = { name: "Maria Aparecida", firstName: "Maria" };

/* ---------- Medicamentos ---------- */

export const medicationsToday = [
  { id: "m1", time: "08:00", name: "Levodopa", detail: "1 comprimido, antes do café", taken: true },
  { id: "m2", time: "12:00", name: "Levodopa", detail: "1 comprimido, após o almoço", taken: false },
  { id: "m3", time: "20:00", name: "Levodopa", detail: "1 comprimido, após o jantar", taken: false },
];

const medicationsPerDay = [3, 3, 2, 3, 3, 2, 1]; // últimos 7 dias, terminando hoje
export const medicationsWeek = medicationsPerDay.map((medications, i) => ({
  day: weekdayShort(addDays(i - 6)),
  medications,
}));

export const upcomingMeds = [
  { id: "u1", patient: "Maria Aparecida", name: "Levodopa", time: "12:00" },
  { id: "u2", patient: "João Ferreira", name: "Levodopa", time: "12:30" },
  { id: "u3", patient: "Ana Souza", name: "Levodopa", time: "13:00" },
];

/* ---------- Exercícios ---------- */

const todayWeekday = new Date().getDay();
const weekdayIn = (offset: number) => (todayWeekday + offset) % 7;

export type Exercise = {
  id: string;
  title: string;
  duration: string;
  prescriber: string;
  weekdays: number[];
};

// Plano de demonstração: hoje sempre tem um exercício previsto
export const exercises: Exercise[] = [
  {
    id: "ex1",
    title: "Alongamento e equilíbrio",
    duration: "15 min",
    prescriber: "Dra. Marina Andrade",
    weekdays: [weekdayIn(0), weekdayIn(2), weekdayIn(4)],
  },
  {
    id: "ex2",
    title: "Caminhada leve",
    duration: "20 min",
    prescriber: "Dra. Marina Andrade",
    weekdays: [weekdayIn(1), weekdayIn(3)],
  },
];

export const exerciseToday = exercises[0];

export function frequencyLabel(exercise: Exercise) {
  return [...exercise.weekdays]
    .sort((a, b) => a - b)
    .map((weekday) => WEEKDAY_SHORT[weekday])
    .join(", ");
}

export type ExerciseDay = {
  offset: number;
  date: Date;
  label: string;
  day: number;
  exercise?: Exercise;
};

// Janela de 7 dias: 3 anteriores, hoje e 3 seguintes
export function exerciseWeek() {
  const days: ExerciseDay[] = Array.from({ length: 7 }, (_, i) => {
    const offset = i - 3;
    const date = addDays(offset);
    return {
      offset,
      date,
      label: weekdayShort(date),
      day: date.getDate(),
      exercise: exercises.find((item) => item.weekdays.includes(date.getDay())),
    };
  });

  return {
    days,
    total: days.filter((day) => day.exercise).length,
    doneBase: days.filter((day) => day.exercise && day.offset < 0).length,
  };
}

export const pendingExercises = [
  { id: "x1", patient: "João Ferreira", title: "Alongamento e equilíbrio", detail: "15 min" },
  { id: "x2", patient: "Ana Souza", title: "Alongamento e equilíbrio", detail: "15 min" },
];

/* ---------- Consultas e agenda ---------- */

export const appointment = {
  title: "Consulta com Dra. Marina",
  when: appointmentLabel(2, "14h30"),
  dayLabel: shortDay(addDays(2)),
  time: "14h30",
};

export type AgendaKind = "consulta" | "exercicio";

export type AgendaItem = {
  id: string;
  date: Date;
  time: string;
  title: string;
  detail: string;
  kind: AgendaKind;
};

function patientAgenda(): AgendaItem[] {
  const items: AgendaItem[] = [
    { id: "c1", date: addDays(-12), time: "10h00", title: "Consulta com Dra. Marina", detail: "Neurologia", kind: "consulta" },
    { id: "c2", date: addDays(2), time: "14h30", title: "Consulta com Dra. Marina", detail: "Neurologia", kind: "consulta" },
    { id: "c3", date: addDays(16), time: "10h00", title: "Consulta de retorno com Dra. Marina", detail: "Neurologia", kind: "consulta" },
  ];

  for (let offset = -21; offset <= 35; offset++) {
    const date = addDays(offset);
    const exercise = exercises.find((item) => item.weekdays.includes(date.getDay()));
    if (exercise) {
      items.push({
        id: `ex-${offset}`,
        date,
        time: "09h00",
        title: exercise.title,
        detail: exercise.duration,
        kind: "exercicio",
      });
    }
  }
  return items;
}

const consultations = [
  { id: "k1", offset: 0, time: "09h00", patient: "João Ferreira" },
  { id: "k2", offset: 0, time: "14h30", patient: "Ana Souza" },
  { id: "k3", offset: 2, time: "14h30", patient: "Maria Aparecida" },
  { id: "k4", offset: 3, time: "11h00", patient: "Carlos Ferreira" },
  { id: "k5", offset: 5, time: "10h00", patient: "João Ferreira" },
  { id: "k6", offset: 7, time: "15h00", patient: "Ana Souza" },
  { id: "k7", offset: 9, time: "09h30", patient: "Carlos Ferreira" },
  { id: "k8", offset: -3, time: "10h00", patient: "Maria Aparecida" },
  { id: "k9", offset: -8, time: "16h00", patient: "João Ferreira" },
];

function consultationsAgenda(): AgendaItem[] {
  return consultations.map((item) => ({
    id: item.id,
    date: addDays(item.offset),
    time: item.time,
    title: item.patient,
    detail: "Consulta de acompanhamento",
    kind: "consulta",
  }));
}

export function getAgendaFor(profile: ProfileType): AgendaItem[] {
  if (profile === "medico" || profile === "cuidador-clinico") return consultationsAgenda();
  return patientAgenda();
}

export function agendaToday(profile: ProfileType) {
  const today = new Date();
  return getAgendaFor(profile)
    .filter((item) => isSameDay(item.date, today))
    .sort((a, b) => a.time.localeCompare(b.time));
}

export const appointmentsNextDays = Array.from({ length: 7 }, (_, i) => {
  const date = addDays(i);
  return {
    day: weekdayShort(date),
    appointments: consultationsAgenda().filter((item) => isSameDay(item.date, date)).length,
  };
});

/* ---------- Pessoas e registros ---------- */

export const careNetwork = [
  { id: "p1", name: "Dra. Marina Andrade", role: "Neurologista" },
  { id: "p2", name: "Amanda Silva", role: "Cuidadora (filha)" },
];

export const patientNotes = [
  { id: "n1", text: "Orientações sobre a rotina de exercícios", author: "Dra. Marina Andrade", when: "ontem, 11:00" },
  { id: "n2", text: "Registro de rotina da manhã", author: "Amanda Silva (cuidadora)", when: "hoje, 09:40" },
];

export const recentRecords = [
  { id: "r1", patient: "Maria Aparecida", text: "Registro de rotina da manhã", author: "Amanda Silva (cuidadora)", when: "hoje, 09:40" },
  { id: "r2", patient: "João Ferreira", text: "Observação sobre a sessão de exercícios", author: "Renata Lima (cuidadora clínica)", when: "ontem, 16:10" },
  { id: "r3", patient: "Ana Souza", text: "Registro de consulta", author: "Marina Andrade (médica)", when: "ontem, 11:00" },
];

export type DemoPatientRow = {
  id: string;
  name: string;
  age: number;
  nextAppointment: string;
  medsWeek: { taken: number; total: number };
};

const mariaMedsTaken = medicationsPerDay.reduce((sum, value) => sum + value, 0);

export const patients: DemoPatientRow[] = [
  { id: "maria", name: "Maria Aparecida", age: 68, nextAppointment: `${shortDay(addDays(2))} · 14h30`, medsWeek: { taken: mariaMedsTaken, total: 21 } },
  { id: "joao", name: "João Ferreira", age: 72, nextAppointment: `${shortDay(addDays(0))} · 09h00`, medsWeek: { taken: 19, total: 21 } },
  { id: "ana", name: "Ana Souza", age: 65, nextAppointment: `${shortDay(addDays(0))} · 14h30`, medsWeek: { taken: 21, total: 21 } },
  { id: "carlos", name: "Carlos Ferreira", age: 74, nextAppointment: `${shortDay(addDays(3))} · 11h00`, medsWeek: { taken: 17, total: 21 } },
];