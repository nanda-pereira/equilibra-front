
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
  {
    email: "paciente@demo.com",
    profile: "paciente",
    name: "Maria Aparecida",
    label: "Paciente",
  },
  {
    email: "medico@demo.com",
    profile: "medico",
    name: "Marina Andrade",
    label: "Médico",
  },
  {
    email: "cuidador.clinico@demo.com",
    profile: "cuidador-clinico",
    name: "Renata Lima",
    label: "Cuidador clínico",
  },
  {
    email: "cuidador.domiciliar@demo.com",
    profile: "cuidador-domiciliar",
    name: "Amanda Silva",
    label: "Cuidador domiciliar",
  },
];

type BackendRole =
  | "PATIENT"
  | "PROFESSIONAL"
  | "NEUROLOGIST"
  | "CLINICAL_CAREGIVER"
  | "HOME_CAREGIVER";

type LoginResponse = {
  success: boolean;
  data?: {
    user: {
      id: string;
      fullName: string;
      email: string;
      role: BackendRole;
    };
    accessToken: string;
    refreshToken: string;
  };
  message?: string | string[];
  error?: {
    message?: string | string[];
  };
};

function mapBackendRole(role: BackendRole): ProfileType {
  const profiles: Record<BackendRole, ProfileType> = {
    PATIENT: "paciente",
    PROFESSIONAL: "medico",
    NEUROLOGIST: "medico",
    CLINICAL_CAREGIVER: "cuidador-clinico",
    HOME_CAREGIVER: "cuidador-domiciliar",
  };

  return profiles[role];
}

export async function loginUser(
  identifier: string,
  password: string,
): Promise<Session> {
  if (!API_URL) {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const account = DEMO_ACCOUNTS.find(
      (item) => item.email === identifier.trim().toLowerCase(),
    );

    if (!account) {
      throw new ApiError("E-mail ou senha incorretos.");
    }

    return {
      profile: account.profile,
      name: account.name,
    };
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: identifier.trim().toLowerCase(),
        password,
      }),
    });
  } catch {
    throw new ApiError(
      "Não foi possível conectar ao servidor. Verifique se a API está ativa.",
    );
  }

  const result = (await response.json().catch(() => null)) as
    | LoginResponse
    | null;

  if (!response.ok || !result?.success || !result.data) {
    const message =
      result?.error?.message ?? result?.message;

    throw new ApiError(
      Array.isArray(message)
        ? message.join(" ")
        : typeof message === "string"
          ? message
          : response.status === 401
            ? "E-mail ou senha incorretos, ou conta ainda não verificada."
            : "Não foi possível entrar. Tente novamente.",
    );
  }

  const { user, accessToken, refreshToken } = result.data;

  return {
    userId: user.id,
    email: user.email,
    name: user.fullName,
    profile: mapBackendRole(user.role),
    accessToken,
    refreshToken,
  };
}