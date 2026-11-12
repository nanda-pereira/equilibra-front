
const API_URL: string | undefined = import.meta.env.VITE_API_URL;

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string | string[];
  error?: {
    message?: string | string[];
  };
};

export type ChatMessageRole = "USER" | "ASSISTANT";

export type ChatMessage = {
  _id: string;
  data: {
    role: ChatMessageRole;
    text: string;
    conversationId: string;
  };
  createdAt?: string;
};

export type ChatConversation = {
  _id: string;
  data?: {
    title?: string;
  };
  createdAt?: string;
  updatedAt?: string;
  status?: string;
};

export type SendChatMessageResponse = {
  conversationId: string;
  message: string;
  disclaimer: string;
};

async function apiRequest<T>(
  path: string,
  accessToken: string,
  method: "GET" | "POST" = "GET",
  body?: unknown,
): Promise<T> {
  if (!API_URL) {
    throw new Error("A URL da API não está configurada.");
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      ...(body === undefined
        ? {}
        : { body: JSON.stringify(body) }),
    });
  } catch {
    throw new Error(
      "Não foi possível conectar ao servidor. Verifique se a API está ativa.",
    );
  }

  const result = (await response.json().catch(() => null)) as
    | ApiResponse<T>
    | null;

  if (!response.ok || !result?.success) {
    const message = result?.error?.message ?? result?.message;

    throw new Error(
      Array.isArray(message)
        ? message.join(" ")
        : message || "Não foi possível concluir a operação.",
    );
  }

  return result.data;
}

export function sendChatMessage(
  accessToken: string,
  input: {
    patientId: string;
    message: string;
    conversationId?: string;
  },
): Promise<SendChatMessageResponse> {
  return apiRequest<SendChatMessageResponse>(
    "/chatbot/message",
    accessToken,
    "POST",
    input,
  );
}

export function getChatConversations(
  accessToken: string,
  patientId: string,
): Promise<ChatConversation[]> {
  return apiRequest<ChatConversation[]>(
    `/chatbot/conversations?patientId=${encodeURIComponent(patientId)}`,
    accessToken,
  );
}

export function getChatHistory(
  accessToken: string,
  conversationId: string,
): Promise<ChatMessage[]> {
  return apiRequest<ChatMessage[]>(
    `/chatbot/conversations/${encodeURIComponent(conversationId)}/messages`,
    accessToken,
  );
}