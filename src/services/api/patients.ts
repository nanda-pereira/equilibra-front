
const API_URL: string | undefined = import.meta.env.VITE_API_URL;

export type PatientProfile = {
  _id?: string;
  id?: string;
  userId?:
    | string
    | {
        _id?: string;
        id?: string;
        fullName?: string;
        email?: string;
      };
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

export type ObservationData = {
  category: string;
  notes: string;
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

  const result = (await response.json().catch(() => null)) as
    | ApiResponse<T>
    | null;

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

async function mutate<T>(
  path: string,
  accessToken: string,
  method: "POST" | "PATCH" | "DELETE",
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
        : message ?? "Não foi possível concluir a operação.",
    );
  }

  return result.data;
}

/**
 * Obtém o ID do usuário associado ao perfil do paciente.
 * O backend pode retornar userId como string ou objeto populado.
 */
function getPatientUserId(
  patient: PatientProfile,
): string | undefined {
  if (typeof patient.userId === "string") {
    return patient.userId;
  }

  return patient.userId?._id ?? patient.userId?.id;
}

/**
 * Localiza o perfil do paciente vinculado à conta autenticada.
 * Não presume que o primeiro item retornado pela API é o correto.
 */
async function getMyPatientId(
  accessToken: string,
  userId: string,
): Promise<string> {
  if (!userId.trim()) {
    throw new Error(
      "Não foi possível identificar a conta autenticada.",
    );
  }

  const patients = await request<PatientProfile[]>(
    "/patients",
    accessToken,
  );

  const patient = patients.find(
    (item) => getPatientUserId(item) === userId,
  );

  const patientId = patient?._id ?? patient?.id;

  if (!patientId) {
    throw new Error(
      "Não foi encontrado um perfil de paciente vinculado à conta atual.",
    );
  }

  return patientId;
}

export async function getMyPatientProfileId(
  accessToken: string,
  userId: string,
): Promise<string> {
  return getMyPatientId(accessToken, userId);
}

export async function getMyPatientOverview(
  accessToken: string,
  userId: string,
): Promise<PatientOverview> {
  const patientId = await getMyPatientId(accessToken, userId);

  return request<PatientOverview>(
    `/patients/${encodeURIComponent(patientId)}/overview`,
    accessToken,
  );
}

export async function getMyPatientMedications(
  accessToken: string,
  userId: string,
): Promise<PatientMedicationsData> {
  const patientId = await getMyPatientId(accessToken, userId);
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
  userId: string,
): Promise<PatientAppointment[]> {
  const patientId = await getMyPatientId(accessToken, userId);

  return request<PatientAppointment[]>(
    `/records/appointments?patientId=${encodeURIComponent(patientId)}`,
    accessToken,
  );
}

/**
 * Consulta os agendamentos de um paciente explicitamente selecionado.
 * Mantida para fluxos de profissionais e cuidadores.
 */
export async function getPatientAppointments(
  accessToken: string,
  patientId: string,
): Promise<PatientAppointment[]> {
  return request<PatientAppointment[]>(
    `/records/appointments?patientId=${encodeURIComponent(patientId)}`,
    accessToken,
  );
}

export type CareNetworkUser = {
  _id?: string;
  id?: string;
  fullName?: string;
  email?: string;
  role?: string;
  specialty?: string | null;
  crm?: string | null;
  professionalVerified?: boolean;
};

export type PatientCareLink = {
  _id: string;
  status: string;
  relationship: string;
  permissions?: string[];
  userId: string | CareNetworkUser;
  patientId?:
    | string
    | {
        _id?: string;
        id?: string;
        userId?:
          | string
          | {
              _id?: string;
              id?: string;
              fullName?: string;
              email?: string;
            };
      };
};

export type CareUser = {
  id: string;
  _id?: string;
  fullName: string;
  email: string;
  role: string;
  specialty?: string | null;
  crm?: string | null;
  professionalVerified?: boolean;
};

export async function getMyPatientCareNetwork(
  accessToken: string,
): Promise<PatientCareLink[]> {
  return request<PatientCareLink[]>("/patient-links", accessToken);
}

export async function searchCareUser(
  accessToken: string,
  email: string,
): Promise<CareUser | null> {
  const normalizedEmail = email.trim().toLowerCase();

  return request<CareUser | null>(
    `/users/search?email=${encodeURIComponent(normalizedEmail)}`,
    accessToken,
  );
}

export type CaregiverRelationship =
  | "PROFESSIONAL"
  | "CLINICAL_CAREGIVER"
  | "HOME_CAREGIVER";

export async function inviteCaregiver(
  accessToken: string,
  patientId: string,
  userId: string,
  relationship: CaregiverRelationship,
): Promise<PatientCareLink> {
  const permissions =
    relationship === "HOME_CAREGIVER"
      ? [
          "patient.profile.read",
          "patient.events.read",
          "patient.medications.read",
          "patient.appointments.read",
          "patient.exercises.read",
        ]
      : [
          "patient.profile.read",
          "patient.monitoring.read",
          "patient.events.read",
          "patient.medications.read",
          "patient.appointments.read",
          "patient.exercises.read",
        ];

  return mutate<PatientCareLink>(
    "/patient-links",
    accessToken,
    "POST",
    {
      patientId,
      userId,
      relationship,
      permissions,
    },
  );
}

export async function respondToCareInvite(
  linkId: string,
  status: "ACTIVE" | "REJECTED",
  accessToken: string,
): Promise<PatientCareLink> {
  const action = status === "ACTIVE" ? "accept" : "reject";

  return mutate<PatientCareLink>(
    `/patient-links/${encodeURIComponent(linkId)}/${action}`,
    accessToken,
    "PATCH",
  );
}

export async function enableCaregiverCommunication(
  accessToken: string,
  linkId: string,
): Promise<PatientCareLink> {
  return mutate<PatientCareLink>(
    `/patient-links/${encodeURIComponent(linkId)}/enable-communication`,
    accessToken,
    "PATCH",
  );
}

export async function revokeCaregiverAccess(
  accessToken: string,
  linkId: string,
): Promise<{ id: string; status: string }> {
  return mutate<{ id: string; status: string }>(
    `/patient-links/${encodeURIComponent(linkId)}`,
    accessToken,
    "DELETE",
  );
}

/**
 * Retorna todos os pacientes acessíveis à conta atual.
 * Não filtra somente pelo usuário autenticado.
 */
export async function getAccessiblePatients(
  accessToken: string,
): Promise<PatientProfile[]> {
  return request<PatientProfile[]>("/patients", accessToken);
}

export async function createPatientMedication(
  accessToken: string,
  patientId: string,
  data: MedicationData,
): Promise<PatientRecord<MedicationData>> {
  return mutate<PatientRecord<MedicationData>>(
    "/records/medications",
    accessToken,
    "POST",
    { patientId, data },
  );
}

export async function createPatientPrescription(
  accessToken: string,
  patientId: string,
  data: PrescriptionData,
): Promise<PatientRecord<PrescriptionData>> {
  return mutate<PatientRecord<PrescriptionData>>(
    "/records/prescriptions",
    accessToken,
    "POST",
    { patientId, data },
  );
}

export async function createPatientMedicationLog(
  accessToken: string,
  patientId: string,
  data: MedicationLogData,
): Promise<PatientRecord<MedicationLogData>> {
  return mutate<PatientRecord<MedicationLogData>>(
    "/records/medication-logs",
    accessToken,
    "POST",
    { patientId, data },
  );
}

export async function getPatientMedications(
  accessToken: string,
  patientId: string,
): Promise<PatientMedicationsData> {
  const [medications, prescriptions, medicationLogs] =
    await Promise.all([
      request<PatientRecord<MedicationData>[]>(
        `/records/medications?patientId=${encodeURIComponent(patientId)}`,
        accessToken,
      ),
      request<PatientRecord<PrescriptionData>[]>(
        `/records/prescriptions?patientId=${encodeURIComponent(patientId)}`,
        accessToken,
      ),
      request<PatientRecord<MedicationLogData>[]>(
        `/records/medication-logs?patientId=${encodeURIComponent(patientId)}`,
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

export async function createPatientAppointment(
  accessToken: string,
  patientId: string,
  data: AppointmentData,
): Promise<PatientAppointment> {
  return mutate<PatientAppointment>(
    "/records/appointments",
    accessToken,
    "POST",
    {
      patientId,
      data,
    },
  );
}

export async function getPatientObservations(
  accessToken: string,
  patientId: string,
): Promise<PatientRecord<ObservationData>[]> {
  return request<PatientRecord<ObservationData>[]>(
    `/records/observations?patientId=${encodeURIComponent(patientId)}`,
    accessToken,
  );
}

export async function createPatientObservation(
  accessToken: string,
  patientId: string,
  data: ObservationData,
): Promise<PatientRecord<ObservationData>> {
  return mutate<PatientRecord<ObservationData>>(
    "/records/observations",
    accessToken,
    "POST",
    { patientId, data },
  );
}

export type UserProfileData = {
  id?: string;
  _id?: string;
  fullName: string;
  email: string;
  phone?: string;
  role?: string;
};

export async function getMyUserProfile(
  accessToken: string,
): Promise<UserProfileData> {
  return request<UserProfileData>("/users/me", accessToken);
}

export async function updateMyUserProfile(
  accessToken: string,
  data: { fullName: string; phone: string },
): Promise<UserProfileData> {
  return mutate<UserProfileData>(
    "/users/me",
    accessToken,
    "PATCH",
    data,
  );
}

export async function getMyPatientProfile(
  accessToken: string,
  userId: string,
): Promise<PatientProfile> {
  const patientId = await getMyPatientId(accessToken, userId);

  return request<PatientProfile>(
    `/patients/${encodeURIComponent(patientId)}`,
    accessToken,
  );
}

export async function updateMyPatientProfile(
  accessToken: string,
  patientId: string,
  data: {
    emergencyContacts: {
      name: string;
      phone: string;
      relationship?: string;
    };
  },
): Promise<PatientProfile> {
  return mutate<PatientProfile>(
    `/patients/${encodeURIComponent(patientId)}`,
    accessToken,
    "PATCH",
    data,
  );
}