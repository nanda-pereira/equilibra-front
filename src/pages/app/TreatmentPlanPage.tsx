
import { useEffect, useState } from "react";
import { Navigate } from "react-router";

import EmptyState from "../../components/app/EmptyState";
import GlassCard from "../../components/app/GlassCard";
import ListRow from "../../components/app/ListRow";
import PageHeader from "../../components/app/PageHeader";

import {
  CalendarIcon,
  ExerciseIcon,
  MedicineIcon,
  MessageIcon,
} from "../../components/ui/icons";

import { useSession } from "../../modules/session/session";

import {
  getMyPatientAppointments,
  getMyPatientMedications,
  getMyPatientProfileId,
  type PatientAppointment,
  type PatientMedicationsData,
  type PatientRecord,
} from "../../services/api/patients";

import {
  getMyPatientExercises,
  type PatientExercisesData,
} from "../../services/api/exercises";

const API_URL: string | undefined = import.meta.env.VITE_API_URL;

type ClinicalRecordData = {
  title?: string;
  name?: string;
  text?: string;
  notes?: string;
  category?: string;
  recordedAt?: string;
  observedAt?: string;
};

type ClinicalRecord = PatientRecord<ClinicalRecordData>;

type TreatmentPlanData = {
  title?: string;
  description?: string;
  instructions?: string;
  goals?: string[];
};

type TreatmentPlanRecord = PatientRecord<TreatmentPlanData>;

type TreatmentPlanState = {
  medications: PatientMedicationsData | null;
  appointments: PatientAppointment[];
  exercises: PatientExercisesData | null;
  treatmentPlans: TreatmentPlanRecord[];
  clinicalRecords: ClinicalRecord[];
};

const initialState: TreatmentPlanState = {
  medications: null,
  appointments: [],
  exercises: null,
  treatmentPlans: [],
  clinicalRecords: [],
};

async function getRecords<T>(
  resource: string,
  patientId: string,
  accessToken: string,
): Promise<T[]> {
  if (!API_URL) {
    throw new Error("A URL da API não está configurada.");
  }

  const query = `?patientId=${encodeURIComponent(patientId)}`;

  const response = await fetch(
    `${API_URL}/records/${resource}${query}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    },
  );

  const result = await response.json().catch(() => null);

  if (!response.ok || !result?.success) {
    throw new Error(
      result?.error?.message ??
        result?.message ??
        `Não foi possível carregar ${resource}.`,
    );
  }

  return result.data as T[];
}

function formatDate(value?: string | null): string {
  if (!value) return "Data não informada";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data não informada";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value?: string | null): string {
  if (!value) return "Data não informada";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data não informada";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getAppointmentDate(
  appointment: PatientAppointment,
): string | undefined {
  return appointment.data.scheduledAt ?? appointment.scheduledAt ?? undefined;
}

function getClinicalRecordTitle(record: ClinicalRecord): string {
  return (
    record.data.title ??
    record.data.category ??
    record.data.name ??
    "Registro clínico"
  );
}

function getClinicalRecordDescription(record: ClinicalRecord): string {
  return (
    record.data.text ??
    record.data.notes ??
    "Sem descrição registrada."
  );
}

export default function TreatmentPlanPage() {
  const { session } = useSession();

  const [state, setState] = useState<TreatmentPlanState>(initialState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadTreatmentPlan() {
      if (!session?.accessToken || !session.userId) {
        setState(initialState);
        setError(
          session?.accessToken
            ? "Não foi possível identificar o usuário da sessão."
            : null,
        );
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const accessToken = session.accessToken;
        const patientId = await getMyPatientProfileId(accessToken, session.userId);

        const results = await Promise.allSettled([
          getMyPatientMedications(accessToken, session.userId ?? ""),
          getMyPatientAppointments(accessToken, session.userId ?? ""),
          getMyPatientExercises(accessToken, session.userId ?? ""),
          getRecords<TreatmentPlanRecord>(
            "treatment-plans",
            patientId,
            accessToken,
          ),
          getRecords<ClinicalRecord>(
            "observations",
            patientId,
            accessToken,
          ),
          getRecords<ClinicalRecord>(
            "diary",
            patientId,
            accessToken,
          ),
        ]);

        if (cancelled) return;

        setCurrentTime(Date.now());

        const [
          medicationsResult,
          appointmentsResult,
          exercisesResult,
          plansResult,
          observationsResult,
          diaryResult,
        ] = results;

        const failedRequests = results.filter(
          (result) => result.status === "rejected",
        );

        setState({
          medications:
            medicationsResult.status === "fulfilled"
              ? medicationsResult.value
              : null,

          appointments:
            appointmentsResult.status === "fulfilled"
              ? appointmentsResult.value
              : [],

          exercises:
            exercisesResult.status === "fulfilled"
              ? exercisesResult.value
              : null,

          treatmentPlans:
            plansResult.status === "fulfilled"
              ? plansResult.value
              : [],

          clinicalRecords: [
            ...(observationsResult.status === "fulfilled"
              ? observationsResult.value
              : []),
            ...(diaryResult.status === "fulfilled"
              ? diaryResult.value
              : []),
          ].sort((a, b) => {
            const dateA = new Date(
              a.data.recordedAt ??
                a.data.observedAt ??
                a.createdAt ??
                0,
            ).getTime();

            const dateB = new Date(
              b.data.recordedAt ??
                b.data.observedAt ??
                b.createdAt ??
                0,
            ).getTime();

            return dateB - dateA;
          }),
        });

        if (failedRequests.length > 0) {
          setError(
            "Algumas informações não puderam ser carregadas. Os dados disponíveis continuam visíveis.",
          );
        }
      } catch (loadError) {
        if (cancelled) return;

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Não foi possível carregar o plano de tratamento.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadTreatmentPlan();

    return () => {
      cancelled = true;
    };
  }, [session?.accessToken, session?.userId, session?.profile]);

  if (!session) return null;

  if (
    session.profile === "medico" ||
    session.profile === "cuidador-clinico"
  ) {
    return <Navigate to="/app/inicio" replace />;
  }

  const medicationData = state.medications;
  const exerciseData = state.exercises;

  const activePrescriptions =
    medicationData?.prescriptions.filter(
      (prescription) =>
        prescription.status.toUpperCase() === "ACTIVE",
    ) ?? [];

  const medicationsById = new Map(
    (medicationData?.medications ?? []).map((medication) => [
      medication._id,
      medication,
    ]),
  );

  const upcomingAppointments = state.appointments
    .filter((appointment) => {
      const value = getAppointmentDate(appointment);

      return (
        value !== undefined &&
        !Number.isNaN(new Date(value).getTime()) &&
        new Date(value).getTime() >= currentTime &&
        appointment.status.toUpperCase() !== "CANCELLED"
      );
    })
    .sort((a, b) => {
      return (
        new Date(getAppointmentDate(a) ?? 0).getTime() -
        new Date(getAppointmentDate(b) ?? 0).getTime()
      );
    })
    .slice(0, 3);

  const activePlans =
    exerciseData?.plans.filter(
      (plan) => plan.status.toUpperCase() === "ACTIVE",
    ) ?? [];

  const recentRecords = state.clinicalRecords.slice(0, 4);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Plano de tratamento"
        subtitle="Consulte os registros e as orientações da sua equipe de saúde."
      />

      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-amber-300/60 bg-amber-50 p-4 text-sm text-amber-900"
        >
          {error}
        </div>
      )}

      {loading && (
        <p className="text-sm text-ink-soft">
          Carregando informações do seu tratamento...
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassCard title="Medicamentos">
          {loading && !medicationData ? (
            <p className="text-sm text-ink-soft">
              Carregando medicamentos...
            </p>
          ) : activePrescriptions.length === 0 ? (
            <EmptyState title="Nenhuma prescrição ativa encontrada" />
          ) : (
            <ul className="flex flex-col gap-3">
              {activePrescriptions.map((prescription) => {
                const medication = medicationsById.get(
                  prescription.data.medicationId,
                );

                return (
                  <ListRow
                    key={prescription._id}
                    icon={MedicineIcon}
                    title={medication?.data.name ?? "Medicamento"}
                    subtitle={[
                      `${prescription.data.dose} ${prescription.data.unit}`,
                      prescription.data.route,
                      prescription.data.schedule?.join(", "),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  />
                );
              })}
            </ul>
          )}
        </GlassCard>

        <GlassCard title="Exercícios">
          {loading && !exerciseData ? (
            <p className="text-sm text-ink-soft">
              Carregando exercícios...
            </p>
          ) : activePlans.length === 0 ? (
            <EmptyState title="Nenhum plano de exercícios ativo" />
          ) : (
            <ul className="flex flex-col gap-3">
              {activePlans.map((plan) => (
                <ListRow
                  key={plan._id}
                  icon={ExerciseIcon}
                  title={plan.data.title}
                  subtitle={
                    plan.data.schedule?.join(", ") ||
                    "Frequência não informada"
                  }
                />
              ))}
            </ul>
          )}
        </GlassCard>

        <GlassCard title="Próximas consultas">
          {loading ? (
            <p className="text-sm text-ink-soft">
              Carregando consultas...
            </p>
          ) : upcomingAppointments.length === 0 ? (
            <EmptyState title="Nenhuma consulta futura encontrada" />
          ) : (
            <ul className="flex flex-col gap-3">
              {upcomingAppointments.map((appointment) => (
                <ListRow
                  key={appointment._id}
                  icon={CalendarIcon}
                  title={appointment.data.title}
                  subtitle={[
                    formatDateTime(getAppointmentDate(appointment)),
                    appointment.data.location,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                />
              ))}
            </ul>
          )}
        </GlassCard>

        <GlassCard title="Orientações e registros">
          {loading && state.clinicalRecords.length === 0 ? (
            <p className="text-sm text-ink-soft">
              Carregando registros...
            </p>
          ) : recentRecords.length === 0 ? (
            <EmptyState title="Nenhuma orientação ou registro encontrado" />
          ) : (
            <ul className="flex flex-col gap-3">
              {recentRecords.map((record) => (
                <ListRow
                  key={record._id}
                  icon={MessageIcon}
                  title={getClinicalRecordTitle(record)}
                  subtitle={`${formatDate(
                    record.data.recordedAt ??
                      record.data.observedAt ??
                      record.createdAt,
                  )} · ${getClinicalRecordDescription(record)}`}
                />
              ))}
            </ul>
          )}
        </GlassCard>

        <GlassCard title="Orientações do plano">
          {loading && state.treatmentPlans.length === 0 ? (
            <p className="text-sm text-ink-soft">
              Carregando orientações...
            </p>
          ) : state.treatmentPlans.length === 0 ? (
            <EmptyState title="Nenhum plano de tratamento cadastrado" />
          ) : (
            <ul className="flex flex-col gap-3">
              {state.treatmentPlans.map((plan) => (
                <ListRow
                  key={plan._id}
                  icon={MessageIcon}
                  title={plan.data.title ?? "Plano de tratamento"}
                  subtitle={
                    plan.data.description ??
                    plan.data.instructions ??
                    plan.data.goals?.join(" · ") ??
                    "Sem orientações adicionais."
                  }
                />
              ))}
            </ul>
          )}
        </GlassCard>
      </div>

      <p className="text-sm text-ink-soft">
        Em caso de dúvida sobre qualquer orientação, converse com a sua equipe de saúde.
      </p>
    </div>
  );
}