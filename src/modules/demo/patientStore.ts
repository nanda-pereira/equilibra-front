export type PatientRecord = {
  id: string;
  name: string;
  birthDate: string;
  email: string;
  phone: string;
  diagnosis: string;
  stage: string;
  caregiver: string;
  notes: string;
};

export type PatientEditable = Pick<
  PatientRecord,
  "email" | "phone" | "diagnosis" | "stage" | "notes"
>;

export const STAGES = ["Inicial", "Intermediário", "Avançado"];

// Dados fictícios de demonstração
const records: Record<string, PatientRecord> = {
  maria: {
    id: "maria",
    name: "Maria Aparecida",
    birthDate: "14/03/1958",
    email: "maria.aparecida@exemplo.com",
    phone: "(11) 90000-0001",
    diagnosis: "Doença de Parkinson",
    stage: "Inicial",
    caregiver: "Amanda Silva (filha)",
    notes: "Em acompanhamento ambulatorial. Mantém rotina de exercícios orientada.",
  },
  joao: {
    id: "joao",
    name: "João Ferreira",
    birthDate: "02/06/1954",
    email: "joao.ferreira@exemplo.com",
    phone: "(11) 90000-0002",
    diagnosis: "Doença de Parkinson",
    stage: "Intermediário",
    caregiver: "Renata Lima (cuidadora clínica)",
    notes: "",
  },
  ana: {
    id: "ana",
    name: "Ana Souza",
    birthDate: "21/08/1961",
    email: "ana.souza@exemplo.com",
    phone: "(11) 90000-0003",
    diagnosis: "Doença de Parkinson",
    stage: "Inicial",
    caregiver: "Renata Lima (cuidadora clínica)",
    notes: "Retorno agendado para revisão da rotina.",
  },
  carlos: {
    id: "carlos",
    name: "Carlos Ferreira",
    birthDate: "09/01/1952",
    email: "carlos.ferreira@exemplo.com",
    phone: "(11) 90000-0004",
    diagnosis: "Doença de Parkinson",
    stage: "Intermediário",
    caregiver: "Sem cuidador vinculado",
    notes: "",
  },
};

export function getPatientRecord(id: string) {
  return records[id] as PatientRecord | undefined;
}

export function updatePatientRecord(id: string, patch: PatientEditable) {
  const current = records[id];
  if (!current) return;
  records[id] = { ...current, ...patch };
}