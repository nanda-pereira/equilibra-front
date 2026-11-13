
const API_URL = import.meta.env.VITE_API_URL;

export type MonitoringRecord = {
  _id?: string;
  recordId?: string;
  patientId?: string;
  batchId?: string;
  recordedAt: string;
  sensorType: string;
  measurements: Record<string, number | string | boolean | null>;
  unit?: string;
  quality?: Record<string, unknown>;
};

export type MonitoringSummary = {
  latestBatch?: {
    batchId?: string;
    createdAt?: string;
    status?: string;
    [key: string]: unknown;
  } | null;
  latestAnalysis?: {
    [key: string]: unknown;
  } | null;
  latestWellbeing?: {
    [key: string]: unknown;
  } | null;
  recordsLast24Hours?: number;
};

export type MonitoringHistory = {
  items: MonitoringRecord[];
  total?: number;
  page?: number;
  pages?: number;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    pages?: number;
  };
  message?: string;
};

async function request<T>(
  path: string,
  accessToken: string,
): Promise<ApiResponse<T>> {
  if (!API_URL) {
    throw new Error("A URL da API não está configurada.");
  }

  const response = await fetch(
    `${API_URL.replace(/\/$/, "")}${path}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    },
  );

  const result = (await response.json().catch(() => null)) as
    | ApiResponse<T>
    | null;

  if (!response.ok || !result?.success) {
    throw new Error(
      result?.message ?? "Não foi possível consultar o monitoramento.",
    );
  }

  return result;
}

export async function getMonitoringSummary(
  accessToken: string,
  patientId: string,
): Promise<MonitoringSummary> {
  const result = await request<MonitoringSummary>(
    `/monitoring/patients/${encodeURIComponent(patientId)}/summary`,
    accessToken,
  );

  return result.data;
}

export async function getMonitoringHistory(
  accessToken: string,
  patientId: string,
  page = 1,
  limit = 50,
): Promise<MonitoringHistory> {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const result = await request<MonitoringRecord[]>(
    `/monitoring/patients/${encodeURIComponent(patientId)}?${query}`,
    accessToken,
  );

  return {
    items: Array.isArray(result.data) ? result.data : [],
    total: result.meta?.total,
    page: result.meta?.page ?? page,
    pages: result.meta?.pages,
  };
}