import { statusFromLevel, type Status } from "../app/status";

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

function weekdayShort(date: Date) {
  const text = new Intl.DateTimeFormat("pt-BR", { weekday: "short" })
    .format(date)
    .replace(".", "");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function appointmentLabel(daysAhead: number, time: string) {
  const date = addDays(daysAhead);
  const weekday = new Intl.DateTimeFormat("pt-BR", { weekday: "long" }).format(date);
  const dayMonth = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(date);
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${dayMonth} às ${time}`;
}

export const DEMO_PATIENT = { name: "Maria Aparecida", firstName: "Maria" };

export const device = { connected: true, lastSyncLabel: "há 4 min" };

// TODO: métricas do smartwatch a confirmar com o backend (measurements ainda não definido)
export const metricsToday = {
  heartRate: 76,
  tremor: "Leve",
  steps: 3240,
  stepsGoal: 5000,
  sleep: "7h 20min",
};

export const heartRateToday = [
  { time: "06h", bpm: 68 },
  { time: "09h", bpm: 74 },
  { time: "12h", bpm: 79 },
  { time: "15h", bpm: 72 },
  { time: "Agora", bpm: 76 },
];

const stepValues = [4120, 5230, 3890, 6010, 4570, 3320, 3240];
export const stepsWeek = stepValues.map((steps, i) => ({
  day: weekdayShort(addDays(i - 6)),
  steps,
}));

const eventCounts: [number, number, number][] = [
  [9, 2, 0], [10, 1, 0], [8, 3, 1], [11, 1, 0], [9, 2, 0], [10, 2, 1], [8, 3, 1],
];
export const eventsWeek = eventCounts.map(([stable, attention, alert], i) => ({
  day: weekdayShort(addDays(i - 6)),
  stable,
  attention,
  alert,
}));

export type DemoEvent = { id: string; text: string; when: string; status: Status };

export const recentEvents: DemoEvent[] = [
  { id: "e1", text: "Alteração no padrão de tremor", when: "há 1 hora", status: statusFromLevel("MEDIUM") },
  { id: "e2", text: "Nova conexão do smartwatch", when: "há 2 horas", status: "info" },
];

export const medicationsToday = [
  { id: "m1", time: "08:00", name: "Levodopa", detail: "1 comprimido, antes do café", taken: true },
  { id: "m2", time: "12:00", name: "Levodopa", detail: "1 comprimido, após o almoço", taken: false },
  { id: "m3", time: "20:00", name: "Levodopa", detail: "1 comprimido, após o jantar", taken: false },
];

export const exerciseToday = {
  title: "Alongamento e equilíbrio",
  detail: "15 min · recomendado pela Dra. Marina",
};

export const appointment = {
  title: "Consulta com Dra. Marina",
  when: appointmentLabel(2, "14h30"),
};

export type DemoPatientRow = {
  id: string;
  name: string;
  age: number;
  lastSync: string;
  event: { text: string; when: string; status: Status };
};

export const patients: DemoPatientRow[] = [
  { id: "maria", name: "Maria Aparecida", age: 68, lastSync: "há 4 min", event: { text: "Alteração no padrão de tremor", when: "há 1 hora", status: statusFromLevel("MEDIUM") } },
  { id: "joao", name: "João Ferreira", age: 72, lastSync: "há 9 min", event: { text: "Sem eventos novos", when: "hoje", status: statusFromLevel("NORMAL") } },
  { id: "ana", name: "Ana Souza", age: 65, lastSync: "há 22 min", event: { text: "Sem eventos novos", when: "hoje", status: statusFromLevel("LOW") } },
  { id: "carlos", name: "Carlos Ferreira", age: 74, lastSync: "há 3 min", event: { text: "Alerta de queda", when: "há 12 minutos", status: statusFromLevel("HIGH") } },
];

export const doctorAgenda = [
  { id: "a1", time: "09:00", patient: "João Ferreira" },
  { id: "a2", time: "14:30", patient: "Ana Souza" },
];

export const recentRecords = [
  { id: "r1", patient: "Maria Aparecida", text: "Registro de rotina da manhã", author: "Amanda Silva (cuidadora)", when: "hoje, 09:40" },
  { id: "r2", patient: "João Ferreira", text: "Observação sobre a sessão de exercícios", author: "Renata Lima (cuidadora clínica)", when: "ontem, 16:10" },
  { id: "r3", patient: "Ana Souza", text: "Registro de consulta", author: "Marina Andrade (médica)", when: "ontem, 11:00" },
];

export const upcomingMeds = [
  { id: "u1", patient: "Maria Aparecida", name: "Levodopa", time: "12:00" },
  { id: "u2", patient: "João Ferreira", name: "Levodopa", time: "12:30" },
  { id: "u3", patient: "Ana Souza", name: "Levodopa", time: "13:00" },
];

export const pendingExercises = [
  { id: "x1", patient: "João Ferreira", title: "Alongamento e equilíbrio", detail: "15 min" },
  { id: "x2", patient: "Ana Souza", title: "Alongamento e equilíbrio", detail: "15 min" },
];