
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
  } catch (error) {
    console.error("[Equilibra API] Falha de conexão:", {
      endpoint: path,
      error,
    });

    throw new Error(
      `Não foi possível conectar ao servidor ao consultar ${path}.`,
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

    console.error("[Equilibra API] Requisição falhou:", {
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

type PatientIdentity = {
  _id?: string;
  id?: string;
};

export async function getMyPatientExercises(
  accessToken: string,
): Promise<PatientExercisesData> {
  const patients = await request<PatientIdentity[]>(
    "/patients",
    accessToken,
  );

  const patient = patients[0];
  const patientId = patient?.id ?? patient?._id;

  if (!patientId) {
    console.error(
      "[Equilibra API] Nenhum paciente encontrado na resposta de /patients.",
    );

    throw new Error(
      "Não foi possível identificar o perfil do paciente.",
    );
  }

  const query = `?patientId=${encodeURIComponent(patientId)}`;

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

  const result: PatientExercisesData = {
    patientId,
    exercises,
    plans,
    logs,
  };

  console.info("[Equilibra API] Exercícios carregados:", {
    patientId,
    exercises: exercises.length,
    plans: plans.length,
    logs: logs.length,
  });

  return result;
}