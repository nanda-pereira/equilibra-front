import { ApiError } from "./authApi";
import type { Session } from "../session/session";
import type { ProfileType } from "./types";

const API_URL: string | undefined = import.meta.env.VITE_API_URL;

export const isDemoMode = !API_URL;

export const DEMO_ACCOUNTS: {
  email: string;
  profile: ProfileType;
  name: string;
  label: string;
}[] = [
  { email: "paciente@demo.com", profile: "paciente", name: "Maria Aparecida", label: "Paciente" },
  { email: "medico@demo.com", profile: "medico", name: "Marina Andrade", label: "Médico" },
  { email: "cuidador.clinico@demo.com", profile: "cuidador-clinico", name: "Renata Lima", label: "Cuidador clínico" },
  { email: "cuidador.domiciliar@demo.com", profile: "cuidador-domiciliar", name: "Amanda Silva", label: "Cuidador domiciliar" },
];

export async function loginUser(identifier: string, _password: string): Promise<Session> {
  if (!API_URL) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const account = DEMO_ACCOUNTS.find(
      (item) => item.email === identifier.trim().toLowerCase(),
    );
    if (!account) throw new ApiError("E-mail ou senha incorretos.");
    return { profile: account.profile, name: account.name };
  }

  // TODO: POST /auth/login quando o contrato (campos, token, validade) for confirmado
  throw new ApiError("O login com o servidor ainda não está integrado.");
}