
const API_URL: string | undefined = import.meta.env.VITE_API_URL;

export type PatientExerciseData = {
  name: string;
  description?: string;
  durationMinutes?: number;
  instructions?: string;
  category?: string;
};

export type PatientExercisePlanData = {
  title: string;
  exerciseIds?: string[];
  startsAt?: string;
  endsAt?: string;
  schedule?: string[];
};

export type PatientExerciseLogData = {
  exerciseId: string;
  performedAt?: string;
  durationMinutes?: number;
  completed?: boolean;
  notes?: string;
};

export type ExerciseRecord<T> = {
  _id: string;
  patientId: string;
  data: T;
  status: string;
  scheduledAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type PatientExercisesData = {
  patientId: string;
  exercises: ExerciseRecord<PatientExerciseData>[];
  plans: ExerciseRecord<PatientExercisePlanData>[];
  logs: ExerciseRecord<PatientExerciseLogData>[];
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string | string[];
  error?: { message?: string | string[] };
};

type PatientIdentity = {
  _id?: string;
  id?: string;
  userId?: string | {
    _id?: string;
    id?: string;
  } | null;
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
  } catch (error) {
    console.error("Falha de conexão:", {
      endpoint: path,
      error,
    });

    throw new Error(
      `Não foi possível conectar ao servidor ao consultar ${path}.`,
      { cause: error },
    );
  }

  const result = (await response.json().catch(() => null)) as
    | ApiResponse<T>
    | null;

  if (!response.ok || !result?.success) {
    const message = result?.error?.message ?? result?.message;
    const details = Array.isArray(message)
      ? message.join(" ")
      : message ?? "Resposta inválida da API.";

    console.error("Requisição falhou:", {
      endpoint: path,
      status: response.status,
      message: details,
    });

    throw new Error(
      `${path} — HTTP ${response.status}: ${details}`,
    );
  }

  return result.data;
}

function getUserId(patient: PatientIdentity): string | undefined {
  if (typeof patient.userId === "string") {
    return patient.userId;
  }

  return patient.userId?._id ?? patient.userId?.id;
}

async function loadPatientExercises(
  accessToken: string,
  patientId: string,
): Promise<PatientExercisesData> {
  const query = `?patientId=${encodeURIComponent(patientId)}&limit=100`;

  const [exercises, plans, logs] = await Promise.all([
    request<ExerciseRecord<PatientExerciseData>[]>(
      `/records/exercises${query}`,
      accessToken,
    ),
    request<ExerciseRecord<PatientExercisePlanData>[]>(
      `/records/exercise-plans${query}`,
      accessToken,
    ),
    request<ExerciseRecord<PatientExerciseLogData>[]>(
      `/records/exercise-logs${query}`,
      accessToken,
    ),
  ]);

  return { patientId, exercises, plans, logs };
}

export async function getMyPatientExercises(
  accessToken: string,
  userId: string,
): Promise<PatientExercisesData> {
  if (!userId) {
    throw new Error(
      "Não foi possível identificar a conta autenticada.",
    );
  }

  const patients = await request<PatientIdentity[]>(
    "/patients",
    accessToken,
  );

  const patient = patients.find(
    (item) => getUserId(item) === userId,
  );

  const patientId = patient?.id ?? patient?._id;

  if (!patientId) {
    throw new Error(
      "Não foi encontrado um perfil de paciente vinculado à conta autenticada.",
    );
  }

  const result = await loadPatientExercises(accessToken, patientId);

  console.info("Exercícios carregados:", {
    patientId,
    exercises: result.exercises.length,
    plans: result.plans.length,
    logs: result.logs.length,
  });

  return result;
}

export async function getPatientExercises(
  accessToken: string,
  patientId: string,
): Promise<PatientExercisesData> {
  return loadPatientExercises(accessToken, patientId);
}