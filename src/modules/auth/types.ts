export type RegisterData = {
  fullName: string;
  birthDate: string;
  cpf: string;
  email: string;
  password: string;
  confirmPassword: string;
  consent: boolean;
};

export const EMPTY_REGISTER_DATA: RegisterData = {
  fullName: "",
  birthDate: "",
  cpf: "",
  email: "",
  password: "",
  confirmPassword: "",
  consent: false,
};