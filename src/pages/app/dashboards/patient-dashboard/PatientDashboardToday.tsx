
import EmptyState from "../../../../components/app/EmptyState";
import GlassCard from "../../../../components/app/GlassCard";
import ListRow from "../../../../components/app/ListRow";
import SmallButton from "../../../../components/app/SmallButton";
import {
  CalendarIcon,
  ExerciseIcon,
  MedicineIcon,
} from "../../../../components/ui/icons";
import type { PatientMedicationsData } from "../../../../services/api/patients";
import type { PatientExercisesData } from "../../../../services/api/exercises";

type PatientDashboardTodayProps = {
  medicationsLoading: boolean;
  medicationsError: string | null;
  exercisesLoading: boolean;
  exercisesError: string | null;
  appointmentsLoading: boolean;
  appointmentsError: string | null;
  medications: PatientMedicationsData["medications"];
  prescriptions: PatientMedicationsData["prescriptions"];
  todayMedicationLogs: PatientMedicationsData["medicationLogs"];
  todayExerciseLogs: PatientExercisesData["logs"];
  exercises: PatientExercisesData["exercises"];
  showTodayAppointment: boolean;
  appointmentId?: string;
  appointmentTitle: string;
  appointmentDate: Date | null;
  appointmentTime: string;
  completedToday: number;
};

function formatTime(value?: string | null) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(minutes?: number | null) {
  if (minutes == null || !Number.isFinite(minutes)) {
    return "Duração não informada";
  }

  return `${minutes} min`;
}

export default function PatientDashboardToday({
  medicationsLoading,
  medicationsError,
  exercisesLoading,
  exercisesError,
  appointmentsLoading,
  appointmentsError,
  medications,
  prescriptions,
  todayMedicationLogs,
  todayExerciseLogs,
  exercises,
  showTodayAppointment,
  appointmentId,
  appointmentTitle,
  appointmentDate,
  appointmentTime,
  completedToday,
}: PatientDashboardTodayProps) {
  const hasTodayContent =
    todayMedicationLogs.length > 0 ||
    todayExerciseLogs.length > 0 ||
    showTodayAppointment;

  const hasTodayLoading =
    medicationsLoading ||
    exercisesLoading ||
    appointmentsLoading;

  const hasTodayError =
    Boolean(medicationsError) ||
    Boolean(exercisesError) ||
    Boolean(appointmentsError);

  return (
    <>
      <GlassCard title="Hoje">
        <ul className="flex flex-col gap-3">
          {medicationsLoading ? (
            <li className="text-sm text-ink-soft">
              Carregando registros de medicamentos...
            </li>
          ) : medicationsError ? (
            <li role="alert" className="text-sm text-ink-soft">
              Não foi possível carregar os registros de medicamentos.
            </li>
          ) : (
            todayMedicationLogs.map((log) => {
              const prescription = prescriptions.find(
                (item) => item._id === log.data.prescriptionId,
              );

              const medication = medications.find(
                (item) =>
                  item._id === prescription?.data.medicationId,
              );

              const scheduledAt =
                log.data.scheduledAt ?? log.scheduledAt;

              const time = formatTime(scheduledAt);
              const dose = log.data.dose ?? prescription?.data.dose;
              const unit = prescription?.data.unit ?? "";

              const status = String(
                log.data.status ?? log.status ?? "",
              ).toUpperCase();

              const statusLabel =
                ["COMPLETED", "ADMINISTERED", "TAKEN"].includes(status)
                  ? "Registrado"
                  : status === "MISSED"
                    ? "Não realizado"
                    : status === "SKIPPED"
                      ? "Ignorado"
                      : "Agendado";

              return (
                <ListRow
                  key={log._id}
                  icon={MedicineIcon}
                  title={[
                    medication?.data.name ?? "Medicamento",
                    time,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                  subtitle={[
                    dose != null
                      ? `Dose: ${dose}${unit ? ` ${unit}` : ""}`
                      : null,
                    statusLabel,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                />
              );
            })
          )}

          {exercisesLoading ? (
            <li className="text-sm text-ink-soft">
              Carregando exercícios realizados...
            </li>
          ) : exercisesError ? (
            <li role="alert" className="text-sm text-ink-soft">
              Não foi possível carregar os exercícios realizados.
            </li>
          ) : (
            todayExerciseLogs.map((log) => {
              const exerciseDetails = exercises.find(
                (item) => item._id === log.data.exerciseId,
              );

              const time = formatTime(log.data.performedAt);
              const completed = log.data.completed === true;

              const duration = formatDuration(
                log.data.durationMinutes ??
                  exerciseDetails?.data.durationMinutes,
              );

              return (
                <ListRow
                  key={log._id}
                  icon={ExerciseIcon}
                  title={[
                    exerciseDetails?.data.name ?? "Exercício",
                    time,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                  subtitle={[
                    duration,
                    completed ? "Concluído" : "Não concluído",
                  ].join(" · ")}
                  trailing={
                    <SmallButton to="/app/exercicios">
                      Ver exercícios
                    </SmallButton>
                  }
                />
              );
            })
          )}

          {appointmentsLoading && (
            <li className="text-sm text-ink-soft">
              Carregando consultas...
            </li>
          )}

          {!appointmentsLoading && appointmentsError && (
            <li role="alert" className="text-sm text-ink-soft">
              Não foi possível carregar a agenda de consultas.
            </li>
          )}

          {!appointmentsLoading &&
            !appointmentsError &&
            showTodayAppointment &&
            appointmentDate && (
              <ListRow
                key={appointmentId ?? "today-appointment"}
                icon={CalendarIcon}
                title={appointmentTitle}
                subtitle={[
                  appointmentDate.toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  }),
                  appointmentTime,
                ]
                  .filter(Boolean)
                  .join(" · ")}
                trailing={
                  <SmallButton to="/app/agenda">
                    Ver detalhes
                  </SmallButton>
                }
              />
            )}

          {!hasTodayContent &&
            !hasTodayLoading &&
            !hasTodayError && (
              <li>
                <EmptyState
                  title="Nada previsto para hoje"
                  description="Seus medicamentos, exercícios e consultas do dia aparecerão aqui quando houver registros."
                />
              </li>
            )}
        </ul>
      </GlassCard>

      {!medicationsLoading &&
        !medicationsError &&
        todayMedicationLogs.length > 0 && (
          <p className="text-sm text-ink-soft">
            {completedToday} de {todayMedicationLogs.length} registros
            de medicamentos de hoje estão marcados como concluídos.
          </p>
        )}
    </>
  );
}
