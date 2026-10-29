import type { ProfileType, RegisterData } from "./types";

export type FieldKey = Exclude<keyof RegisterData, "consent">;
export type FieldKind = "text" | "email" | "password" | "cpf" | "date" | "select";

export type FieldConfig = {
  key: FieldKey;
  label: string;
  kind: FieldKind;
  placeholder?: string;
  autoComplete?: string;
  /** opções do dropdown (kind: "select") */
  options?: string[];
};

export type ProfileForm = {
  columns: 2 | 3;
  fields: FieldConfig[];
  /** texto de consentimento com compartilhamento de dados de saúde (só paciente) */
  sharesHealthData: boolean;
};

// TODO: listas PROVISÓRIAS; confirmar com o backend se é lista fechada
const DOCTOR_SPECIALTIES = ["Neurologia", "Geriatria", "Clínica geral", "Fisiatria"];

// Áreas citadas no relatório (seção 2.3)
const CAREGIVER_ROLES = [
  "Enfermagem",
  "Fisioterapia",
  "Terapia ocupacional",
  "Fonoaudiologia",
  "Psicologia",
  "Assistência social",
];

const password: FieldConfig = {
  key: "password",
  label: "Senha",
  kind: "password",
  placeholder: "••••••••",
};

const confirmPassword: FieldConfig = {
  key: "confirmPassword",
  label: "Confirmação da Senha",
  kind: "password",
  placeholder: "••••••••",
};

// TODO: campos de médico e cuidadores são PROVISÓRIOS (RF02/RF03 do grupo, que
// têm inconsistências). Confirmar com o backend e com o Figma.
export const PROFILE_FORM: Record<ProfileType, ProfileForm> = {
  paciente: {
    columns: 3,
    sharesHealthData: true,
    fields: [
      { key: "fullName", label: "Nome completo", kind: "text", placeholder: "Luiz da Silva", autoComplete: "name" },
      { key: "birthDate", label: "Data de nascimento", kind: "date", placeholder: "27/10/1945" },
      { key: "cpf", label: "CPF", kind: "cpf", placeholder: "000.000.000-00" },
      { key: "email", label: "E-mail", kind: "email", placeholder: "luiz13@gmail.com" },
      password,
      confirmPassword,
    ],
  },
  medico: {
    columns: 3,
    sharesHealthData: false,
    fields: [
      { key: "fullName", label: "Nome completo", kind: "text", placeholder: "Marina Andrade", autoComplete: "name" },
      // TODO: formato do CRM (número + UF?) e placeholder
      { key: "crm", label: "CRM", kind: "text", placeholder: "123456/SP", autoComplete: "off" },
      { key: "specialty", label: "Especialidade", kind: "select", placeholder: "Selecione", options: DOCTOR_SPECIALTIES },
      { key: "email", label: "E-mail", kind: "email", placeholder: "nome@email.com" },
      password,
      confirmPassword,
    ],
  },
  "cuidador-clinico": {
    columns: 3,
    sharesHealthData: false,
    fields: [
      { key: "fullName", label: "Nome completo", kind: "text", placeholder: "Amanda Silva", autoComplete: "name" },
      // TODO: "tipo/especialidade" do RF03; confirmar se é texto livre ou lista
      { key: "specialty", label: "Tipo de atuação", kind: "select", placeholder: "Selecione", options: CAREGIVER_ROLES },
      { key: "email", label: "E-mail", kind: "email", placeholder: "nome@email.com" },
      password,
      confirmPassword,
    ],
  },
  "cuidador-domiciliar": {
    columns: 2,
    sharesHealthData: false,
    fields: [
      { key: "fullName", label: "Nome completo", kind: "text", placeholder: "Amanda Silva", autoComplete: "name" },
      { key: "email", label: "E-mail", kind: "email", placeholder: "nome@email.com" },
      password,
      confirmPassword,
    ],
  },
};