
import type { ProfileType, RegisterData } from "./types";

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const API_URL: string | undefined = import.meta.env.VITE_API_URL;
const REGISTER_PATH = "/auth/register";

type BackendRole =
  | "PATIENT"
  | "PROFESSIONAL"
  | "NEUROLOGIST"
  | "CLINICAL_CAREGIVER"
  | "HOME_CAREGIVER";

export type RegisterResponseData = {
  user?: {
    id: string;
    fullName: string;
    email: string;
    role: BackendRole;
    emailVerified?: boolean;
  };
  accessToken?: string;
  refreshToken?: string;
  emailVerificationDevToken?: string;
};

type RegisterResponse = {
  success?: boolean;
  data?: RegisterResponseData;
  message?: string | string[];
  error?: {
    message?: string | string[];
  };
};

const ROLE_MAP: Record<ProfileType, BackendRole> = {
  paciente: "PATIENT",
  medico: "PROFESSIONAL",
  "cuidador-clinico": "CLINICAL_CAREGIVER",
  "cuidador-domiciliar": "HOME_CAREGIVER",
};

export function buildRegisterPayload(
  profile: ProfileType,
  data: RegisterData,
) {
  return {
    fullName: data.fullName.trim(),
    email: data.email.trim().toLowerCase(),
    password: data.password,
    role: ROLE_MAP[profile],
    ...(profile === "medico"
      ? {
          crm: data.crm.trim(),
          specialty: data.specialty.trim(),
        }
      : profile === "cuidador-clinico"
        ? {
            specialty: data.specialty.trim(),
          }
        : {}),
  };
}

function getErrorMessage(
  message: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(message)) return message.join(" ");
  return message;
}

export async function registerUser(
  profile: ProfileType,
  data: RegisterData,
): Promise<RegisterResponseData> {
  if (!API_URL) {
    throw new ApiError(
      "A API não está configurada. Verifique a variável VITE_API_URL.",
    );
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
      "Não foi possível conectar ao servidor. Verifique se a API está ativa.",
    );
  }

  const result = (await response.json().catch(() => null)) as
    | RegisterResponse
    | null;

  if (!response.ok || !result?.success || !result.data) {
    const message =
      getErrorMessage(result?.error?.message) ??
      getErrorMessage(result?.message);

    throw new ApiError(
      message ??
        (response.status === 409
          ? "Já existe uma conta cadastrada com este e-mail."
          : "Não foi possível criar a conta. Confira os dados e tente novamente."),
      response.status,
    );
  }

  return result.data;
}

export async function verifyEmail(token: string): Promise<void> {
  if (!API_URL) {
    throw new ApiError(
      "A verificação de e-mail exige conexão com o servidor.",
    );
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}/auth/verify-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });
  } catch {
    throw new ApiError(
      "Não foi possível conectar ao servidor. Tente novamente.",
    );
  }

  if (response.ok) {
    // O backend responde HTTP 204, sem conteúdo.
    return;
  }

  const result = (await response.json().catch(() => null)) as {
    error?: { message?: string | string[] };
    message?: string | string[];
  } | null;

  const message =
    getErrorMessage(result?.error?.message) ??
    getErrorMessage(result?.message);

  throw new ApiError(
    message ?? "Não foi possível verificar o e-mail. Confira o token.",
    response.status,
  );
}