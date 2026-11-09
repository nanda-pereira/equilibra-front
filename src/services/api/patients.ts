
const API_URL: string | undefined = import.meta.env.VITE_API_URL;

export type PatientProfile = {
  _id?: string;
  id?: string;
  userId?: string | { fullName?: string; email?: string };
  clinicalProfile?: {
    diagnosisDate?: string;
    followUpNotes?: string;
  };
  monitoringSettings?: Record<string, unknown>;
  emergencyContacts?: Record<string, unknown>;
};

export type PatientOverview = {
  patient: PatientProfile;
  latestAnalysis: Record<string, unknown> | null;
  latestWellbeing: Record<string, unknown> | null;
  recentEvents: Record<string, unknown>[];
  pendingNotifications: number;
};

export type PatientRecord<T> = {
  _id: string;
  patientId: string;
  data: T;
  status: string;
  scheduledAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type MedicationData = {
  name: string;
  strength?: string;
  unit?: string;
  instructions?: string;
  activeIngredient?: string;
};

export type PrescriptionData = {
  medicationId: string;
  dose: number | string;
  unit: string;
  route: string;
  schedule?: string[];
  startsAt?: string;
  endsAt?: string;
  instructions?: string;
};

export type MedicationLogData = {
  prescriptionId: string;
  scheduledAt?: string;
  administeredAt?: string;
  dose?: number | string;
  status?: string;
  notes?: string;
};

export type PatientMedicationsData = {
  patientId: string;
  medications: PatientRecord<MedicationData>[];
  prescriptions: PatientRecord<PrescriptionData>[];
  medicationLogs: PatientRecord<MedicationLogData>[];
};

export type AppointmentData = {
  title: string;
  professionalId?: string;
  scheduledAt?: string;
  durationMinutes?: number;
  location?: string;
  notes?: string;
};

export type PatientAppointment = PatientRecord<AppointmentData>;

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string | string[];
  error?: {
    message?: string | string[];
  };
};

async function request<T>(
  path: string,
  accessToken: string,
): Promise<T> {
  if (!API_URL) {
    throw new Error("A URL da API não está configurada.");
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
  } catch {
    throw new Error(
      "Não foi possível conectar ao servidor. Verifique se a API está ativa.",
    );
  }

  const result = (await response
    .json()
    .catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || !result?.success) {
    const message = result?.error?.message ?? result?.message;

    throw new Error(
      Array.isArray(message)
        ? message.join(" ")
        : message ?? "Não foi possível carregar os dados do paciente.",
    );
  }

  return result.data;
}

async function getMyPatientId(accessToken: string): Promise<string> {
  const patients = await request<PatientProfile[]>(
    "/patients",
    accessToken,
  );

  const patient = patients[0];
  const patientId = patient?.id ?? patient?._id;

  if (!patientId) {
    throw new Error(
      "Não foi possível identificar o perfil do paciente.",
    );
  }

  return patientId;
}

export async function getMyPatientOverview(
  accessToken: string,
): Promise<PatientOverview> {
  const patients = await request<PatientProfile[]>(
    "/patients",
    accessToken,
  );

  const patient = patients[0];

  if (!patient) {
    throw new Error(
      "Nenhum perfil de paciente foi encontrado para esta conta.",
    );
  }

  const patientId = patient.id ?? patient._id;

  if (!patientId) {
    throw new Error(
      "Não foi possível identificar o perfil do paciente.",
    );
  }

  return request<PatientOverview>(
    `/patients/${encodeURIComponent(patientId)}/overview`,
    accessToken,
  );
}

export async function getMyPatientMedications(
  accessToken: string,
): Promise<PatientMedicationsData> {
  const patientId = await getMyPatientId(accessToken);
  const query = `?patientId=${encodeURIComponent(patientId)}`;

  const [medications, prescriptions, medicationLogs] =
    await Promise.all([
      request<PatientRecord<MedicationData>[]>(
        `/records/medications${query}`,
        accessToken,
      ),
      request<PatientRecord<PrescriptionData>[]>(
        `/records/prescriptions${query}`,
        accessToken,
      ),
      request<PatientRecord<MedicationLogData>[]>(
        `/records/medication-logs${query}`,
        accessToken,
      ),
    ]);

  return {
    patientId,
    medications,
    prescriptions,
    medicationLogs,
  };
}

export async function getMyPatientAppointments(
  accessToken: string,
): Promise<PatientAppointment[]> {
  const patientId = await getMyPatientId(accessToken);

  return request<PatientAppointment[]>(
    `/records/appointments?patientId=${encodeURIComponent(patientId)}`,
    accessToken,
  );
}