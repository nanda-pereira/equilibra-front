
import { useEffect, useState } from "react";
import EmptyState from "../../../components/app/EmptyState";
import GlassCard from "../../../components/app/GlassCard";
import SmallButton from "../../../components/app/SmallButton";
import { useSession } from "../../../modules/session/session";
import {
  getMyPatientProfileId,
  getPatientObservations,
  type ObservationData,
  type PatientRecord,
} from "../../../services/api/patients";
import usePatientDashboardData from "../../../hooks/usePatientDashboardData";
import usePatientDashboardExercises from "../../../hooks/usePatientDashboardExercises";
import usePatientDashboardAppointments from "../../../hooks/usePatientDashboardAppointments";
import usePatientDashboardMedicationSummary from "../../../hooks/usePatientDashboardMedicationSummary";
import PatientDashboardCareNetwork from "./patient-dashboard/PatientDashboardCareNetwork";
import PatientDashboardChart from "./patient-dashboard/PatientDashboardChart";
import PatientDashboardMetrics from "./patient-dashboard/PatientDashboardMetrics";
import PatientDashboardMedications from "./patient-dashboard/PatientDashboardMedications";
import PatientDashboardToday from "./patient-dashboard/PatientDashboardToday";

function formatDuration(minutes?: number | null): string {
  if (minutes == null || !Number.isFinite(minutes)) {
    return "Duração não informada";
  }

  return `${minutes} min`;
}

function formatObservationDate(value?: string | null): string {
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

function getObservationDate(
  observation: PatientRecord<ObservationData>,
): string | undefined {
  const data = observation.data as ObservationData & {
    observedAt?: string;
  };

  return data.observedAt ?? observation.createdAt ?? observation.updatedAt;
}

export default function PatientDashboard() {
  const { session } = useSession();

  const {
    patientMedications,
    medicationsLoading,
    medicationsError,
    patientAppointments,
    appointmentsLoading,
    appointmentsError,
  } = usePatientDashboardData({
    accessToken: session?.accessToken,
    profile: session?.profile,
    userId: session?.userId,
  });

  const {
    exercises,
    todayExerciseLogs,
    weekExerciseLogs,
    completedWeekExercises,
    todayExercise,
    todayExerciseDetails,
    activePlans,
    exercisesLoading,
    exercisesError,
  } = usePatientDashboardExercises(
    session?.accessToken,
    session?.profile,
    session?.userId,
  );

  const {
    next,
    nextAppointmentDate,
    nextAppointmentTime,
    nextAppointmentTitle,
    showTodayAppointment,
  } = usePatientDashboardAppointments({
    patientAppointments,
  });

  const {
    medications,
    prescriptions,
    medicationLogs,
    activePrescriptions,
    todayMedicationLogs,
    completedToday,
  } = usePatientDashboardMedicationSummary({
    patientMedications,
  });

  const [recentObservations, setRecentObservations] = useState<
    PatientRecord<ObservationData>[]
  >([]);
  const [observationsLoading, setObservationsLoading] = useState(true);
  const [observationsError, setObservationsError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;

    async function loadObservations() {
      const accessToken = session?.accessToken;

      if (
        !accessToken ||
        session?.profile !== "paciente" ||
        !session?.userId
      ) {
        setRecentObservations([]);
        setObservationsError(null);
        setObservationsLoading(false);
        return;
      }

      setObservationsLoading(true);
      setObservationsError(null);

      try {
        const patientId = await getMyPatientProfileId(
          accessToken,
          session.userId,
        );
        const observations = await getPatientObservations(
          accessToken,
          patientId,
        );

        if (cancelled) return;

        const sortedObservations = [...observations].sort((a, b) => {
          const dateA = new Date(getObservationDate(a) ?? "").getTime();
          const dateB = new Date(getObservationDate(b) ?? "").getTime();

          return (
            (Number.isNaN(dateB) ? 0 : dateB) -
            (Number.isNaN(dateA) ? 0 : dateA)
          );
        });

        setRecentObservations(sortedObservations);
      } catch (error) {
        if (cancelled) return;

        setRecentObservations([]);
        setObservationsError(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os registros recentes.",
        );
      } finally {
        if (!cancelled) {
          setObservationsLoading(false);
        }
      }
    }

    void loadObservations();

    return () => {
      cancelled = true;
    };
  }, [session?.accessToken, session?.profile, session?.userId]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
        <PatientDashboardMedications
          loading={medicationsLoading}
          error={medicationsError}
          activePrescriptions={activePrescriptions}
          medications={medications}
        />

        <PatientDashboardMetrics
          nextAppointment={{
            value: appointmentsLoading
              ? "..."
              : nextAppointmentDate
                ? new Intl.DateTimeFormat("pt-BR", {
                    day: "2-digit",
                    month: "short",
                  }).format(nextAppointmentDate)
                : "—",
            note: appointmentsLoading
              ? "Carregando agenda..."
              : appointmentsError
                ? "Não foi possível carregar a agenda"
                : next
                  ? `${nextAppointmentTime} · ${nextAppointmentTitle}`
                  : "Nenhuma consulta futura",
          }}
          todayExerciseMetric={{
            value: exercisesLoading
              ? "..."
              : todayExercise
                ? formatDuration(
                    todayExercise.data.durationMinutes ??
                      todayExerciseDetails?.data.durationMinutes,
                  )
                : "—",
            note: exercisesLoading
              ? "Carregando exercícios..."
              : exercisesError
                ? "Não foi possível carregar os exercícios"
                : todayExercise
                  ? todayExerciseDetails?.data.name ??
                    "Exercício registrado"
                  : "Nenhum registro de exercício hoje",
          }}
          weekExercises={{
            value: exercisesLoading
              ? "..."
              : `${completedWeekExercises} de ${weekExerciseLogs.length}`,
            note: exercisesLoading
              ? "Carregando registros..."
              : `${activePlans.length} ${
                  activePlans.length === 1
                    ? "plano ativo"
                    : "planos ativos"
                } · últimos 7 dias`,
          }}
          recentRecords={{
            value: observationsLoading
              ? "..."
              : String(recentObservations.length),
            note: observationsLoading
              ? "Carregando registros..."
              : observationsError
                ? "Não foi possível carregar os registros"
                : recentObservations.length === 1
                  ? "observação registrada"
                  : "observações registradas",
          }}
        />
      </div>

      <PatientDashboardToday
        medicationsLoading={medicationsLoading}
        medicationsError={medicationsError}
        exercisesLoading={exercisesLoading}
        exercisesError={exercisesError}
        appointmentsLoading={appointmentsLoading}
        appointmentsError={appointmentsError}
        medications={medications}
        prescriptions={prescriptions}
        todayMedicationLogs={todayMedicationLogs}
        todayExerciseLogs={todayExerciseLogs}
        exercises={exercises}
        showTodayAppointment={showTodayAppointment}
        appointmentId={next?._id}
        appointmentTitle={nextAppointmentTitle}
        appointmentDate={nextAppointmentDate}
        appointmentTime={nextAppointmentTime}
        completedToday={completedToday}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <PatientDashboardChart medicationLogs={medicationLogs} />

        <GlassCard title="Sua rede de cuidado">
          <PatientDashboardCareNetwork
            accessToken={session?.accessToken}
            userId={session?.userId}
          />
        </GlassCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassCard title="Registros recentes">
          {observationsLoading ? (
            <p className="text-sm text-ink-soft">
              Carregando registros...
            </p>
          ) : observationsError ? (
            <p className="text-sm text-ink-soft">
              {observationsError}
            </p>
          ) : recentObservations.length === 0 ? (
            <EmptyState title="Nenhum registro ainda" />
          ) : (
            <div className="flex flex-col gap-4">
              {recentObservations.slice(0, 3).map((observation) => (
                <article
                  key={observation._id}
                  className="rounded-2xl border border-line/60 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="font-medium text-ink">
                      {observation.data.category || "Observação clínica"}
                    </h3>
                    <span className="text-xs text-ink-soft">
                      {formatObservationDate(getObservationDate(observation))}
                    </span>
                  </div>

                  <p className="mt-2 whitespace-pre-wrap text-sm text-ink-soft">
                    {observation.data.notes || "Sem descrição adicional."}
                  </p>
                </article>
              ))}
            </div>
          )}
        </GlassCard>

        <GlassCard title="Plano de tratamento">
          <p className="text-base text-ink-soft">
            Consulte as orientações registradas pela sua equipe de saúde.
          </p>

          <div className="mt-4">
            <SmallButton to="/app/plano-de-tratamento">
              Ver plano
            </SmallButton>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}