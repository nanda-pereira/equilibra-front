
import type { ProfileType, RegisterData } from "./types";

export type FieldKey = Exclude<keyof RegisterData, "consent">;
export type FieldKind =
  | "text"
  | "email"
  | "password"
  | "cpf"
  | "date"
  | "select";

export type FieldConfig = {
  key: FieldKey;
  label: string;
  kind: FieldKind;
  placeholder?: string;
  autoComplete?: string;
  options?: string[];
};

export type ProfileForm = {
  columns: 2 | 3;
  fields: FieldConfig[];
  sharesHealthData: boolean;
};

export const DOCTOR_SPECIALTIES = [
  "Neurologia",
  "Geriatria",
  "Clínica geral",
  "Fisiatria",
];

export const CAREGIVER_ROLES = [
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
  placeholder: "Digite sua senha",
};

const confirmPassword: FieldConfig = {
  key: "confirmPassword",
  label: "Confirmação da senha",
  kind: "password",
  placeholder: "Digite sua senha novamente",
};

export const PROFILE_FORM: Record<ProfileType, ProfileForm> = {
  paciente: {
    columns: 3,
    sharesHealthData: true,
    fields: [
      {
        key: "fullName",
        label: "Nome completo",
        kind: "text",
        placeholder: "Digite seu nome completo",
        autoComplete: "name",
      },
      {
        key: "birthDate",
        label: "Data de nascimento",
        kind: "date",
        placeholder: "DD/MM/AAAA",
        autoComplete: "bday",
      },
      {
        key: "cpf",
        label: "CPF",
        kind: "cpf",
        placeholder: "000.000.000-00",
      },
      {
        key: "email",
        label: "E-mail",
        kind: "email",
        placeholder: "nome@exemplo.com",
        autoComplete: "email",
      },
      password,
      confirmPassword,
    ],
  },

  medico: {
    columns: 3,
    sharesHealthData: false,
    fields: [
      {
        key: "fullName",
        label: "Nome completo",
        kind: "text",
        placeholder: "Digite seu nome completo",
        autoComplete: "name",
      },
      {
        key: "crm",
        label: "CRM",
        kind: "text",
        placeholder: "Número do CRM/UF",
        autoComplete: "off",
      },
      {
        key: "specialty",
        label: "Especialidade",
        kind: "select",
        placeholder: "Selecione sua especialidade",
        options: DOCTOR_SPECIALTIES,
      },
      {
        key: "email",
        label: "E-mail profissional",
        kind: "email",
        placeholder: "nome@exemplo.com",
        autoComplete: "email",
      },
      password,
      confirmPassword,
    ],
  },

  "cuidador-clinico": {
    columns: 3,
    sharesHealthData: false,
    fields: [
      {
        key: "fullName",
        label: "Nome completo",
        kind: "text",
        placeholder: "Digite seu nome completo",
        autoComplete: "name",
      },
      {
        key: "specialty",
        label: "Área de atuação",
        kind: "select",
        placeholder: "Selecione sua área de atuação",
        options: CAREGIVER_ROLES,
      },
      {
        key: "email",
        label: "E-mail profissional",
        kind: "email",
        placeholder: "nome@exemplo.com",
        autoComplete: "email",
      },
      password,
      confirmPassword,
    ],
  },

  "cuidador-domiciliar": {
    columns: 2,
    sharesHealthData: false,
    fields: [
      {
        key: "fullName",
        label: "Nome completo",
        kind: "text",
        placeholder: "Digite seu nome completo",
        autoComplete: "name",
      },
      {
        key: "email",
        label: "E-mail",
        kind: "email",
        placeholder: "nome@exemplo.com",
        autoComplete: "email",
      },
      password,
      confirmPassword,
    ],
  },
};