import { PROFILE_FORM } from "./registerFields";
import type { ProfileType, RegisterData } from "./types";
import { brDateToIso, onlyDigits } from "./validation";

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// PROVISÓRIO: rota, nomes de campos e formatos ainda não confirmados com o backend.
const API_URL: string | undefined = import.meta.env.VITE_API_URL;
const REGISTER_PATH = "/auth/register";

export function buildRegisterPayload(profile: ProfileType, data: RegisterData) {
  const payload: Record<string, string | boolean> = {
    role: profile,
    consent: data.consent,
  };

  for (const field of PROFILE_FORM[profile].fields) {
    if (field.key === "confirmPassword") continue;

    const value = data[field.key];
    if (field.kind === "password") payload[field.key] = value; // senha nunca é alterada
    else if (field.kind === "cpf") payload[field.key] = onlyDigits(value);
    else if (field.kind === "date") payload[field.key] = brDateToIso(value);
    else payload[field.key] = value.trim();
  }

  return payload;
}

async function mockRegister(data: RegisterData) {
  await new Promise((resolve) => setTimeout(resolve, 900));
  // só para testar o estado de erro da interface
  if (data.email.trim().toLowerCase() === "erro@teste.com") {
    throw new ApiError("Não foi possível criar a conta agora. Tente novamente.");
  }
}

export async function registerUser(profile: ProfileType, data: RegisterData) {
  if (!API_URL) {
    await mockRegister(data);
    return;
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${REGISTER_PATH}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildRegisterPayload(profile, data)),
    });
  } catch {
    throw new ApiError(
      "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.",
    );
  }

  if (!response.ok) {
    // TODO: ler a mensagem de erro do backend quando o formato for confirmado
    throw new ApiError(
      "Não foi possível criar a conta. Confira os dados e tente novamente.",
      response.status,
    );
  }
}