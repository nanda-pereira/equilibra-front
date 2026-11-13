
import { ApiError } from "./authApi";
import type { Session } from "../session/session";
import type { ProfileType } from "./types";

const API_URL: string | undefined = import.meta.env.VITE_API_URL;

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
    throw new ApiError(
      "A API não está configurada. Verifique a variável VITE_API_URL.",
    );
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
    const message = result?.error?.message ?? result?.message;

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