
const API_URL = import.meta.env.VITE_API_URL;

export type DomainRecord<T> = {
  _id: string;
  patientId: string;
  data: T;
  status?: string;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type ConversationData = {
  title?: string;
  participantIds: string[];
  status?: string;
};

export type MessageData = {
  conversationId: string;
  text: string;
  senderId?: string;
  sentAt?: string;
  attachments?: unknown[];
};

export type ConversationRecord = DomainRecord<ConversationData>;
export type MessageRecord = DomainRecord<MessageData>;

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

async function request<T>(
  path: string,
  accessToken: string,
  options: RequestInit = {},
): Promise<T> {
  if (!API_URL) {
    throw new Error("A URL da API não está configurada.");
  }

  const response = await fetch(
    `${API_URL.replace(/\/$/, "")}${path}`,
    {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    },
  );

  const result = (await response.json().catch(() => null)) as
    | ApiResponse<T>
    | null;

  if (!response.ok || !result?.success) {
    throw new Error(
      result?.message ?? "Não foi possível concluir a operação.",
    );
  }

  return result.data;
}

function queryString(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  });

  return query.toString();
}

export async function getConversations(
  accessToken: string,
  patientId: string,
): Promise<ConversationRecord[]> {
  const query = queryString({ patientId, page: 1, limit: 100 });

  return request<ConversationRecord[]>(
    `/records/conversations?${query}`,
    accessToken,
  );
}

export async function getMessages(
  accessToken: string,
  patientId: string,
  conversationId: string,
): Promise<MessageRecord[]> {
  const query = queryString({
    patientId,
    conversationId,
    page: 1,
    limit: 100,
  });

  const messages = await request<MessageRecord[]>(
    `/records/messages?${query}`,
    accessToken,
  );

  // A API pode devolver as mensagens mais recentes primeiro.
  // Na interface, exibimos a conversa em ordem cronológica.
  return [...messages].sort((a, b) => {
    const dateA = new Date(
      a.data.sentAt ?? a.createdAt,
    ).getTime();

    const dateB = new Date(
      b.data.sentAt ?? b.createdAt,
    ).getTime();

    return dateA - dateB;
  });
}

export async function createConversation(
  accessToken: string,
  patientId: string,
  title: string,
  participantIds: string[],
): Promise<ConversationRecord> {
  return request<ConversationRecord>(
    "/records/conversations",
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({
        patientId,
        data: {
          title: title.trim(),
          participantIds: [...new Set(participantIds)],
          status: "ACTIVE",
        },
      }),
    },
  );
}

export async function sendMessage(
  accessToken: string,
  patientId: string,
  conversationId: string,
  text: string,
): Promise<MessageRecord> {
  const content = text.trim();

  if (!content) {
    throw new Error("Digite uma mensagem antes de enviar.");
  }

  if (content.length > 5000) {
    throw new Error("A mensagem deve ter no máximo 5.000 caracteres.");
  }

  return request<MessageRecord>("/records/messages", accessToken, {
    method: "POST",
    body: JSON.stringify({
      patientId,
      data: {
        conversationId,
        text: content,
        sentAt: new Date().toISOString(),
      },
    }),
  });
}