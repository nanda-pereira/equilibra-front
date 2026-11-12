
import type { Session } from "../session/session";

const API_URL: string | undefined = import.meta.env.VITE_API_URL;

type TokenResponse = {
  success: boolean;
  data?: {
    accessToken: string;
    refreshToken: string;
  };
  message?: string | string[];
  error?: {
    message?: string | string[];
  };
};

function getErrorMessage(
  result: TokenResponse | null,
  fallback: string,
): string {
  const message = result?.error?.message ?? result?.message;

  if (Array.isArray(message)) return message.join(" ");
  if (typeof message === "string") return message;

  return fallback;
}

export async function refreshSessionTokens(
  refreshToken: string,
): Promise<Pick<Session, "accessToken" | "refreshToken">> {
  if (!API_URL) {
    throw new Error("A URL da API não está configurada.");
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    throw new Error("Não foi possível conectar ao servidor.");
  }

  const result = (await response.json().catch(() => null)) as
    | TokenResponse
    | null;

  if (
    !response.ok ||
    !result?.success ||
    !result.data?.accessToken ||
    !result.data?.refreshToken
  ) {
    throw new Error(
      getErrorMessage(result, "Não foi possível renovar a sessão."),
    );
  }

  return {
    accessToken: result.data.accessToken,
    refreshToken: result.data.refreshToken,
  };
}

export async function logoutBackendSession(
  refreshToken: string,
): Promise<void> {
  if (!API_URL) return;

  let response: Response;

  try {
    response = await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
  } catch {
    throw new Error(
      "Não foi possível conectar ao servidor para encerrar a sessão.",
    );
  }

  if (!response.ok) {
    const result = (await response.json().catch(() => null)) as
      | TokenResponse
      | null;

    throw new Error(
      getErrorMessage(result, "O servidor não conseguiu encerrar a sessão."),
    );
  }
}
