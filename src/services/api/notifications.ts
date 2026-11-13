
const API_URL = import.meta.env.VITE_API_URL;

export type NotificationItem = {
  _id: string;
  patientId?: string;
  title: string;
  message: string;
  type: "EVENT" | "REMINDER" | "SYSTEM";
  status: "UNREAD" | "READ" | "ARCHIVED";
  createdAt: string;
};

type NotificationResponse = {
  success: boolean;
  data: NotificationItem[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  message?: string | string[];
  error?: {
    message?: string | string[];
  };
};

type NotificationList = {
  items: NotificationItem[];
  total: number;
};

async function request<T>(
  path: string,
  accessToken: string,
  options: RequestInit = {},
): Promise<T> {
  if (!API_URL) {
    throw new Error("A URL da API não está configurada.");
  }

  let response: Response;

  try {
    response = await fetch(
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
  } catch {
    throw new Error(
      "Não foi possível conectar ao servidor.",
    );
  }

  const result = (await response.json().catch(() => null)) as
    | NotificationResponse
    | {
        success: boolean;
        data: T;
        message?: string | string[];
        error?: { message?: string | string[] };
      }
    | null;

  if (!response.ok || !result?.success) {
    const errorResult = result as
      | {
          message?: string | string[];
          error?: { message?: string | string[] };
        }
      | null;

    const message =
      errorResult?.error?.message ??
      errorResult?.message;

    throw new Error(
      Array.isArray(message)
        ? message.join(" ")
        : message ?? "Não foi possível carregar as notificações.",
    );
  }

  return result.data as T;
}

export async function getNotifications(
  accessToken: string,
  options: {
    status?: "UNREAD" | "READ" | "ARCHIVED";
    limit?: number;
  } = {},
): Promise<NotificationList> {
  const params = new URLSearchParams({
    page: "1",
    limit: String(options.limit ?? 8),
  });

  if (options.status) {
    params.set("status", options.status);
  }

  const result = await request<NotificationItem[]>(
    `/notifications?${params.toString()}`,
    accessToken,
  );

  // A requisição retorna o array, mas precisamos também
  // do total informado pela API para o contador.
  // A listagem completa é obtida abaixo para preservar o meta.
  return {
    items: result,
    total: result.length,
  };
}

export async function getNotificationsWithCount(
  accessToken: string,
): Promise<NotificationList> {
  const [recentResponse, unreadResponse] = await Promise.all([
    fetchNotificationPage(accessToken, undefined, 8),
    fetchNotificationPage(accessToken, "UNREAD", 1),
  ]);

  return {
    items: recentResponse.data,
    total: unreadResponse.total,
  };
}

async function fetchNotificationPage(
  accessToken: string,
  status: "UNREAD" | "READ" | "ARCHIVED" | undefined,
  limit: number,
): Promise<{
  data: NotificationItem[];
  total: number;
}> {
  const params = new URLSearchParams({
    page: "1",
    limit: String(limit),
  });

  if (status) {
    params.set("status", status);
  }

  if (!API_URL) {
    throw new Error("A URL da API não está configurada.");
  }

  const response = await fetch(
    `${API_URL.replace(/\/$/, "")}/notifications?${params}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    },
  );

  const result = (await response.json().catch(() => null)) as
    | NotificationResponse
    | null;

  if (!response.ok || !result?.success) {
    throw new Error(
      result?.message instanceof Array
        ? result.message.join(" ")
        : result?.message ?? "Não foi possível carregar as notificações.",
    );
  }

  return {
    data: result.data,
    total: result.meta?.total ?? result.data.length,
  };
}

export async function markNotificationAsRead(
  accessToken: string,
  notificationId: string,
): Promise<void> {
  await request<NotificationItem>(
    `/notifications/${encodeURIComponent(notificationId)}/read`,
    accessToken,
    { method: "PATCH" },
  );
}