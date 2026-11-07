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

export const weekdayShort = (date: Date) => WEEKDAY_SHORT[date.getDay()];
export const shortDay = (date: Date) =>
  `${weekdayShort(date)}, ${pad(date.getDate())}/${pad(date.getMonth() + 1)}`;

export const toISO = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export function fromISO(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export function longDayLabel(date: Date, time: string) {
  const weekday = capitalize(new Intl.DateTimeFormat("pt-BR", { weekday: "long" }).format(date));
  return `${weekday}, ${pad(date.getDate())}/${pad(date.getMonth() + 1)} às ${time}`;
}

export function relativeWhen(date: Date, time: string) {
  if (isSameDay(date, new Date())) return `hoje, ${time}`;
  if (isSameDay(date, addDays(-1))) return `ontem, ${time}`;
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}, ${time}`;
}

export type AgendaKind = "consulta" | "exercicio";

export type AgendaItem = {
  id: string;
  date: Date;
  time: string;
  title: string;
  detail: string;
  kind: AgendaKind;
  patientId?: string;
};

export const DEMO_PATIENT = { name: "Maria Aparecida", firstName: "Maria" };

export const PATIENTS_BASE = [
  { id: "maria", name: "Maria Aparecida", age: 68 },
  { id: "joao", name: "João Ferreira", age: 72 },
  { id: "ana", name: "Ana Souza", age: 65 },
  { id: "carlos", name: "Carlos Ferreira", age: 74 },
];

export const patientName = (id: string) =>
  PATIENTS_BASE.find((patient) => patient.id === id)?.name ?? "Paciente";

/* ---------- Dados iniciais (fictícios) ---------- */

export const SEED_CONSULTATIONS = [
  { id: "c1", patientId: "maria", offset: -12, time: "10h00", detail: "Consulta de acompanhamento" },
  { id: "c2", patientId: "maria", offset: -3, time: "10h00", detail: "Consulta de acompanhamento" },
  { id: "c3", patientId: "maria", offset: 2, time: "14h30", detail: "Consulta de acompanhamento" },
  { id: "c4", patientId: "maria", offset: 16, time: "10h00", detail: "Consulta de retorno" },
  { id: "c5", patientId: "joao", offset: 0, time: "09h00", detail: "Consulta de acompanhamento" },
  { id: "c6", patientId: "joao", offset: 1, time: "10h30", detail: "Consulta de acompanhamento" },
  { id: "c7", patientId: "joao", offset: 5, time: "10h00", detail: "Consulta de acompanhamento" },
  { id: "c8", patientId: "joao", offset: -8, time: "16h00", detail: "Consulta de acompanhamento" },
  { id: "c9", patientId: "ana", offset: 0, time: "14h30", detail: "Consulta de acompanhamento" },
  { id: "c10", patientId: "ana", offset: 4, time: "16h00", detail: "Consulta de acompanhamento" },
  { id: "c11", patientId: "ana", offset: 7, time: "15h00", detail: "Consulta de retorno" },
  { id: "c12", patientId: "carlos", offset: 3, time: "11h00", detail: "Consulta de acompanhamento" },
  { id: "c13", patientId: "carlos", offset: 9, time: "09h30", detail: "Consulta de acompanhamento" },
];

export type SeedMedication = {
  id: string;
  patientId: string;
  name: string;
  dose: string;
  times: string[];
  notes: string;
  addedBy: string;
};

export const SEED_MEDICATIONS: SeedMedication[] = [
  { id: "med-maria-levodopa", patientId: "maria", name: "Levodopa", dose: "1 comprimido", times: ["08:00", "12:00", "20:00"], notes: "", addedBy: "Marina Andrade" },
  { id: "med-joao-levodopa", patientId: "joao", name: "Levodopa", dose: "1 comprimido", times: ["08:30", "12:30", "20:30"], notes: "", addedBy: "Marina Andrade" },
  { id: "med-ana-levodopa", patientId: "ana", name: "Levodopa", dose: "1 comprimido", times: ["09:00", "13:00", "21:00"], notes: "", addedBy: "Marina Andrade" },
  { id: "med-carlos-levodopa", patientId: "carlos", name: "Levodopa", dose: "1 comprimido", times: ["09:30", "21:30"], notes: "", addedBy: "Marina Andrade" },
];

/** dias passados (offset) em que uma dose não foi registrada */
export const SEED_MISSES: Record<string, number[]> = {
  maria: [-4, -1],
  joao: [-5, -2],
  ana: [],
  carlos: [-6, -3, -1],
};

export const SEED_RECORDS = [
  { id: "r1", patientId: "maria", author: "Amanda Silva (cuidadora)", text: "Registro de rotina da manhã", offset: 0, time: "09:40" },
  { id: "r2", patientId: "joao", author: "Renata Lima (cuidadora clínica)", text: "Observação sobre a sessão de exercícios", offset: -1, time: "16:10" },
  { id: "r3", patientId: "ana", author: "Marina Andrade (médica)", text: "Registro de consulta", offset: -1, time: "11:00" },
  { id: "r4", patientId: "maria", author: "Dra. Marina Andrade", text: "Orientações sobre a rotina de exercícios", offset: -1, time: "11:00" },
  { id: "r5", patientId: "carlos", author: "Marina Andrade (médica)", text: "Orientação sobre apoio para o equilíbrio", offset: -3, time: "15:20" },
  { id: "r6", patientId: "joao", author: "Marina Andrade (médica)", text: "Registro de consulta de acompanhamento", offset: -8, time: "16:40" },
];

export const careNetwork = [
  { id: "p1", name: "Dra. Marina Andrade", role: "Neurologista" },
  { id: "p2", name: "Amanda Silva", role: "Cuidadora (filha)" },
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