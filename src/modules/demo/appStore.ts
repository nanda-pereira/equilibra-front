import { useSyncExternalStore } from "react";
import type { ProfileType } from "../auth/types";
import {
  PATIENTS_BASE,
  SEED_CONSULTATIONS,
  SEED_MEDICATIONS,
  SEED_MISSES,
  SEED_RECORDS,
  addDays,
  exercises,
  fromISO,
  isSameDay,
  patientName,
  relativeWhen,
  shortDay,
  toISO,
  weekdayShort,
  type AgendaItem,
} from "./demoData";
import { PATIENT_SEEDS, type PatientEditable, type PatientRecord } from "./patientStore";

export type Medication = {
  id: string;
  patientId: string;
  name: string;
  dose: string;
  times: string[];
  notes: string;
  startISO: string;
  addedBy: string;
  source: "prescricao" | "informado";
};

type Consultation = { id: string; patientId: string; dateISO: string; time: string; detail: string };
type EvolutionRecord = { id: string; patientId: string; author: string; text: string; dateISO: string; time: string };

export type ProfileInfo = {
  email: string;
  phone: string;
  registry: string;
  role: string;
  emergencyName: string;
  emergencyPhone: string;
};

type StoreState = {
  medications: Medication[];
  consultations: Consultation[];
  records: EvolutionRecord[];
  doses: Record<string, true>;
  patientEdits: Record<string, Partial<PatientEditable>>;
  profiles: Partial<Record<ProfileType, ProfileInfo>>;
};

const KEY = "equilibra:demo-data"; // só dados fictícios de demonstração
const doseKey = (medId: string, dateISO: string, time: string) => `${medId}|${dateISO}|${time}`;
const newId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const pad = (value: number) => String(value).padStart(2, "0");

function initialState(): StoreState {
  return {
    medications: [],
    consultations: [],
    records: [],
    doses: { [doseKey("med-maria-levodopa", toISO(new Date()), "08:00")]: true },
    patientEdits: {},
    profiles: {},
  };
}

function load(): StoreState {
  const base = initialState();
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<StoreState>;
    return {
      medications: Array.isArray(parsed.medications) ? parsed.medications : [],
      consultations: Array.isArray(parsed.consultations) ? parsed.consultations : [],
      records: Array.isArray(parsed.records) ? parsed.records : [],
      doses: parsed.doses ?? base.doses,
      patientEdits: parsed.patientEdits ?? {},
      profiles: parsed.profiles ?? {},
    };
  } catch {
    return base;
  }
}

let state = load();
const listeners = new Set<() => void>();

function commit(next: StoreState) {
  state = next;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* sem armazenamento: segue só em memória */
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Chame no componente para ele atualizar quando os dados mudarem. */
export function useAppState() {
  return useSyncExternalStore(subscribe, () => state);
}

/* ---------- Ações ---------- */

export function addMedication(input: Omit<Medication, "id" | "startISO">) {
  commit({
    ...state,
    medications: [...state.medications, { ...input, id: newId("med"), startISO: toISO(new Date()) }],
  });
}

export function confirmDose(medId: string, time: string) {
  commit({ ...state, doses: { ...state.doses, [doseKey(medId, toISO(new Date()), time)]: true } });
}

export function addConsultation(input: Omit<Consultation, "id">) {
  commit({
    ...state,
    consultations: [
      ...state.consultations,
      { ...input, id: newId("cons"), time: input.time.replace(":", "h") },
    ],
  });
}

export function addRecord(input: { patientId: string; author: string; text: string }) {
  const now = new Date();
  commit({
    ...state,
    records: [
      ...state.records,
      { ...input, id: newId("rec"), dateISO: toISO(now), time: `${pad(now.getHours())}:${pad(now.getMinutes())}` },
    ],
  });
}

export function resetDemoData() {
  commit(initialState());
}

/* ---------- Medicamentos ---------- */

function allMedications(): Medication[] {
  const seeds: Medication[] = SEED_MEDICATIONS.map((med) => ({
    ...med,
    startISO: "2000-01-01",
    source: "prescricao" as const,
  }));
  return [...seeds, ...state.medications];
}

export const medicationsFor = (patientId: string) =>
  allMedications().filter((med) => med.patientId === patientId);

export type Dose = {
  key: string;
  medId: string;
  name: string;
  dose: string;
  notes: string;
  time: string;
  taken: boolean;
};

export function dosesToday(patientId: string): Dose[] {
  const todayISO = toISO(new Date());
  return medicationsFor(patientId)
    .filter((med) => med.startISO <= todayISO)
    .flatMap((med) =>
      med.times.map((time) => {
        const key = doseKey(med.id, todayISO, time);
        return {
          key,
          medId: med.id,
          name: med.name,
          dose: med.dose,
          notes: med.notes,
          time,
          taken: Boolean(state.doses[key]),
        };
      }),
    )
    .sort((a, b) => a.time.localeCompare(b.time));
}

function scheduledOn(patientId: string, date: Date) {
  const iso = toISO(date);
  return medicationsFor(patientId)
    .filter((med) => med.startISO <= iso)
    .reduce((sum, med) => sum + med.times.length, 0);
}

function takenOn(patientId: string, offset: number) {
  if (offset === 0) return dosesToday(patientId).filter((dose) => dose.taken).length;
  const missed = (SEED_MISSES[patientId] ?? []).includes(offset) ? 1 : 0;
  return Math.max(scheduledOn(patientId, addDays(offset)) - missed, 0);
}

export function adherenceWeek(patientId: string) {
  return Array.from({ length: 7 }, (_, i) => {
    const offset = i - 6;
    return { day: weekdayShort(addDays(offset)), medications: takenOn(patientId, offset) };
  });
}

export function weekTotals(patientId: string) {
  let taken = 0;
  let total = 0;
  for (let offset = -6; offset <= 0; offset++) {
    taken += takenOn(patientId, offset);
    total += scheduledOn(patientId, addDays(offset));
  }
  return { taken, total };
}

/* ---------- Consultas e agenda ---------- */

export type ConsultationItem = {
  id: string;
  patientId: string;
  patientName: string;
  date: Date;
  time: string;
  detail: string;
};

const byDateTime = (a: { date: Date; time: string }, b: { date: Date; time: string }) =>
  a.date.getTime() - b.date.getTime() || a.time.localeCompare(b.time);

export function consultationsAll(): ConsultationItem[] {
  const seeds = SEED_CONSULTATIONS.map((item) => ({
    id: item.id,
    patientId: item.patientId,
    date: addDays(item.offset),
    time: item.time,
    detail: item.detail,
  }));
  const created = state.consultations.map((item) => ({
    id: item.id,
    patientId: item.patientId,
    date: fromISO(item.dateISO),
    time: item.time,
    detail: item.detail,
  }));
  return [...seeds, ...created].map((item) => ({ ...item, patientName: patientName(item.patientId) }));
}

export function getAgendaFor(profile: ProfileType): AgendaItem[] {
  const consultations = consultationsAll();

  if (profile === "medico" || profile === "cuidador-clinico") {
    return consultations.map((item) => ({
      id: item.id,
      date: item.date,
      time: item.time,
      title: item.patientName,
      detail: item.detail,
      kind: "consulta" as const,
      patientId: item.patientId,
    }));
  }

  const items: AgendaItem[] = consultations
    .filter((item) => item.patientId === "maria")
    .map((item) => ({
      id: item.id,
      date: item.date,
      time: item.time,
      title: "Consulta com Dra. Marina",
      detail: item.detail,
      kind: "consulta" as const,
      patientId: item.patientId,
    }));

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

export function agendaToday(profile: ProfileType) {
  const today = new Date();
  return getAgendaFor(profile)
    .filter((item) => isSameDay(item.date, today))
    .sort(byDateTime);
}

export function nextConsultation(patientId?: string) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return consultationsAll()
    .filter((item) => (!patientId || item.patientId === patientId) && item.date >= start)
    .sort(byDateTime)[0];
}

export function appointmentsNextDays() {
  const all = consultationsAll();
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(i);
    return {
      day: weekdayShort(date),
      appointments: all.filter((item) => isSameDay(item.date, date)).length,
    };
  });
}

export type PatientSummary = {
  id: string;
  name: string;
  age: number;
  nextAppointment: string;
  medsWeek: { taken: number; total: number };
};

export function getPatientSummaries(): PatientSummary[] {
  return PATIENTS_BASE.map((patient) => {
    const next = nextConsultation(patient.id);
    return {
      ...patient,
      nextAppointment: next ? `${shortDay(next.date)} · ${next.time}` : "Sem consulta agendada",
      medsWeek: weekTotals(patient.id),
    };
  });
}

/* ---------- Registros de evolução ---------- */

export type RecordItem = {
  id: string;
  patientId: string;
  patientName: string;
  author: string;
  text: string;
  date: Date;
  time: string;
  when: string;
};

export function recordsAll(): RecordItem[] {
  const seeds = SEED_RECORDS.map((item) => ({
    id: item.id,
    patientId: item.patientId,
    author: item.author,
    text: item.text,
    date: addDays(item.offset),
    time: item.time,
  }));
  const created = state.records.map((item) => ({
    id: item.id,
    patientId: item.patientId,
    author: item.author,
    text: item.text,
    date: fromISO(item.dateISO),
    time: item.time,
  }));
  return [...seeds, ...created]
    .map((item) => ({
      ...item,
      patientName: patientName(item.patientId),
      when: relativeWhen(item.date, item.time),
    }))
    .sort((a, b) => b.date.getTime() - a.date.getTime() || b.time.localeCompare(a.time));
}

/* ---------- Pacientes e perfis ---------- */

export function getPatientRecord(id: string): PatientRecord | undefined {
  const seed: PatientRecord | undefined = PATIENT_SEEDS[id];
  return seed ? { ...seed, ...state.patientEdits[id] } : undefined;
}

export function updatePatientRecord(id: string, patch: Partial<PatientEditable>) {
  commit({
    ...state,
    patientEdits: { ...state.patientEdits, [id]: { ...state.patientEdits[id], ...patch } },
  });
}

const PROFILE_SEEDS: Record<ProfileType, ProfileInfo> = {
  paciente: { email: "", phone: "", registry: "", role: "", emergencyName: "Amanda Silva", emergencyPhone: "(11) 90000-0012" },
  medico: { email: "marina.andrade@exemplo.com", phone: "(11) 90000-0010", registry: "123456/SP", role: "Neurologia", emergencyName: "", emergencyPhone: "" },
  "cuidador-clinico": { email: "renata.lima@exemplo.com", phone: "(11) 90000-0011", registry: "", role: "Enfermagem", emergencyName: "", emergencyPhone: "" },
  "cuidador-domiciliar": { email: "amanda.silva@exemplo.com", phone: "(11) 90000-0012", registry: "", role: "", emergencyName: "", emergencyPhone: "" },
};

export function getProfileInfo(profile: ProfileType): ProfileInfo {
  const info = { ...PROFILE_SEEDS[profile], ...state.profiles[profile] };
  if (profile !== "paciente") return info;
  const record = getPatientRecord("maria");
  return { ...info, email: record?.email ?? info.email, phone: record?.phone ?? info.phone };
}

export function updateProfileInfo(profile: ProfileType, info: ProfileInfo) {
  const patientEdits =
    profile === "paciente"
      ? { ...state.patientEdits, maria: { ...state.patientEdits.maria, email: info.email, phone: info.phone } }
      : state.patientEdits;
  commit({ ...state, profiles: { ...state.profiles, [profile]: info }, patientEdits });
}