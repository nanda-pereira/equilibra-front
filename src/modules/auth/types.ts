export type ProfileType =
  | "paciente"
  | "medico"
  | "cuidador-clinico"
  | "cuidador-domiciliar";

export const PROFILE_LABELS: Record<ProfileType, string> = {
  paciente: "Paciente",
  medico: "Médico",
  "cuidador-clinico": "Cuidador clínico",
  "cuidador-domiciliar": "Cuidador domiciliar",
};

export type RegisterData = {
  fullName: string;
  birthDate: string;
  cpf: string;
  email: string;
  password: string;
  confirmPassword: string;
  crm: string;
  specialty: string;
  consent: boolean;
};

export const EMPTY_REGISTER_DATA: RegisterData = {
  fullName: "",
  birthDate: "",
  cpf: "",
  email: "",
  password: "",
  confirmPassword: "",
  crm: "",
  specialty: "",
  consent: false,
};