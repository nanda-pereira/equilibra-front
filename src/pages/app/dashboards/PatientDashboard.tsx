import { useEffect, useMemo, useState } from "react";
import Avatar from "../../../components/app/Avatar";
import EmptyState from "../../../components/app/EmptyState";
import GlassCard from "../../../components/app/GlassCard";
import ListRow from "../../../components/app/ListRow";
import MetricCard from "../../../components/app/MetricCard";
import SmallButton from "../../../components/app/SmallButton";
import { BarTrendChart } from "../../../components/app/charts";
import {
  CalendarIcon,
  CheckCircleIcon,
  ExerciseIcon,
  MedicineIcon,
  MessageIcon,
} from "../../../components/ui/icons";
import {
  adherenceWeek,
  recordsAll,
  useAppState,
} from "../../../modules/demo/appStore";
import {
  careNetwork,
  shortDay,
} from "../../../modules/demo/demoData";
import { useSession } from "../../../modules/session/session";
import {
  getMyPatientAppointments,
  getMyPatientMedications,
  getMyPatientOverview,
  type PatientAppointment,
  type PatientMedicationsData,
} from "../../../services/api/patients";
import {
  getMyPatientExercises,
  type PatientExercisesData,
} from "../../../services/api/exercises";

function isToday(value?: string | null): boolean {
  if (!value) return false;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function formatTime(value?: string | null): string | null {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  return error instanceof Error ? error.message : fallback;
}

function formatDuration(minutes?: number | null): string {
  if (minutes == null || !Number.isFinite(minutes)) {
    return "Duração não informada";
  }

  return `${minutes} min`;
}

export default function PatientDashboard() {
  const { session } = useSession();

  const [patientMedications, setPatientMedications] =
    useState<PatientMedicationsData | null>(null);

  const [medicationsLoading, setMedicationsLoading] = useState(true);

  const [medicationsError, setMedicationsError] =
    useState<string | null>(null);

  const [patientAppointments, setPatientAppointments] =
    useState<PatientAppointment[] | null>(null);

  const [appointmentsLoading, setAppointmentsLoading] = useState(true);

  const [appointmentsError, setAppointmentsError] =
    useState<string | null>(null);

  const [patientExercises, setPatientExercises] =
    useState<PatientExercisesData | null>(null);

  const [exercisesLoading, setExercisesLoading] = useState(true);

  const [exercisesError, setExercisesError] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPatientData() {
      if (!session?.accessToken || session.profile !== "paciente") {
        setPatientMedications(null);
        setPatientAppointments(null);
        setMedicationsError(null);
        setAppointmentsError(null);
        setMedicationsLoading(false);
        setAppointmentsLoading(false);
        return;
      }

      setMedicationsLoading(true);
      setMedicationsError(null);
      setAppointmentsLoading(true);
      setAppointmentsError(null);

      const [
        overviewResult,
        medicationsResult,
        appointmentsResult,
      ] = await Promise.allSettled([
        getMyPatientOverview(session.accessToken),
        getMyPatientMedications(session.accessToken),
        getMyPatientAppointments(session.accessToken),
      ]);

      if (cancelled) return;

      if (overviewResult.status === "fulfilled") {
        console.info(
          "[Equilibra API] Perfil carregado:",
          overviewResult.value,
        );
      } else {
        console.error(
          "[Equilibra API] Erro ao carregar perfil:",
          overviewResult.reason,
        );
      }

      if (medicationsResult.status === "fulfilled") {
        setPatientMedications(medicationsResult.value);
        setMedicationsError(null);

        console.info(
          "[Equilibra API] Medicamentos carregados:",
          medicationsResult.value,
        );
      } else {
        setPatientMedications(null);
        setMedicationsError(
          getErrorMessage(
            medicationsResult.reason,
            "Não foi possível carregar os medicamentos.",
          ),
        );

        console.error(
          "[Equilibra API] Erro ao carregar medicamentos:",
          medicationsResult.reason,
        );
      }

      if (appointmentsResult.status === "fulfilled") {
        setPatientAppointments(appointmentsResult.value);
        setAppointmentsError(null);

        console.info(
          "[Equilibra API] Agenda carregada:",
          appointmentsResult.value,
        );
      } else {
        setPatientAppointments(null);
        setAppointmentsError(
          getErrorMessage(
            appointmentsResult.reason,
            "Não foi possível carregar a agenda.",
          ),
        );

        console.error(
          "[Equilibra API] Erro ao carregar agenda:",
          appointmentsResult.reason,
        );
      }

      setMedicationsLoading(false);
      setAppointmentsLoading(false);
    }

    void loadPatientData();

    return () => {
      cancelled = true;
    };
  }, [session?.accessToken, session?.profile]);

  useEffect(() => {
    let cancelled = false;

    async function loadExercises() {
      if (!session?.accessToken || session.profile !== "paciente") {
        setPatientExercises(null);
        setExercisesError(null);
        setExercisesLoading(false);
        return;
      }

      setExercisesLoading(true);
      setExercisesError(null);

      try {
        const result = await getMyPatientExercises(
          session.accessToken,
        );

        if (cancelled) return;

        setPatientExercises(result);

        console.info("[Equilibra API] Exercícios carregados:", {
          patientId: result.patientId,
          exercises: result.exercises.length,
          plans: result.plans.length,
          logs: result.logs.length,
        });
      } catch (error) {
        if (cancelled) return;

        setPatientExercises(null);
        setExercisesError(
          getErrorMessage(
            error,
            "Não foi possível carregar os exercícios.",
          ),
        );

        console.error(
          "[Equilibra API] Erro ao carregar exercícios:",
          error,
        );
      } finally {
        if (!cancelled) {
          setExercisesLoading(false);
        }
      }
    }

    void loadExercises();

    return () => {
      cancelled = true;
    };
  }, [session?.accessToken, session?.profile]);

  // Mantém os demais componentes demonstrativos desta etapa.
  useAppState();

  const upcomingAppointments = useMemo(() => {
    const now = new Date();

    return (patientAppointments ?? [])
      .map((appointment) => ({
        ...appointment,
        dateTime:
          appointment.data.scheduledAt ??
          appointment.scheduledAt ??
          "",
      }))
      .filter((appointment) => {
        const date = new Date(appointment.dateTime);
        const status = appointment.status.toUpperCase();

        return (
          !["CANCELLED", "CANCELED"].includes(status) &&
          appointment.dateTime !== "" &&
          !Number.isNaN(date.getTime()) &&
          date >= now
        );
      })
      .sort(
        (a, b) =>
          new Date(a.dateTime).getTime() -
          new Date(b.dateTime).getTime(),
      );
  }, [patientAppointments]);

  const next = upcomingAppointments[0];

  const nextAppointmentDate = next
    ? new Date(next.dateTime)
    : null;

  const nextAppointmentTime = nextAppointmentDate
    ? nextAppointmentDate.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const nextAppointmentTitle =
    next?.data.title || "Consulta agendada";

  // Dados reais de exercícios vindos da API.
  const exercises = patientExercises?.exercises ?? [];
  const exercisePlans = patientExercises?.plans ?? [];
  const exerciseLogs = patientExercises?.logs ?? [];

  const todayExerciseLogs = useMemo(
    () =>
      exerciseLogs
        .filter((log) =>
          isToday(log.data.performedAt ?? log.performedAt),
        )
        .sort((a, b) => {
          const dateA = new Date(
            a.data.performedAt ?? a.performedAt ?? "",
          ).getTime();

          const dateB = new Date(
            b.data.performedAt ?? b.performedAt ?? "",
          ).getTime();

          return dateB - dateA;
        }),
    [exerciseLogs],
  );

  const weekExerciseLogs = useMemo(() => {
    const now = new Date();
    const start = new Date(now);

    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    return exerciseLogs.filter((log) => {
      const value = log.data.performedAt ?? log.performedAt;
      if (!value) return false;

      const date = new Date(value);

      return (
        !Number.isNaN(date.getTime()) &&
        date >= start &&
        date <= now
      );
    });
  }, [exerciseLogs]);

  const completedWeekExercises = weekExerciseLogs.filter(
    (log) => log.data.completed === true,
  ).length;

  const todayExercise = todayExerciseLogs[0] ?? null;

  const todayExerciseDetails = todayExercise
    ? exercises.find(
        (item) =>
          item._id === todayExercise.data.exerciseId,
      )
    : undefined;

  const activePlans = exercisePlans.filter((plan) => {
    const status = plan.status.toUpperCase();

    if (["CANCELLED", "CANCELED", "ARCHIVED", "INACTIVE"].includes(status)) {
      return false;
    }

    const startsAt = plan.data.startsAt;
    const endsAt = plan.data.endsAt;
    const now = new Date();

    if (startsAt && new Date(startsAt) > now) return false;
    if (endsAt && new Date(endsAt) < now) return false;

    return true;
  });

  const notes = recordsAll()
    .filter((item) => item.patientId === "maria")
    .slice(0, 3);

  // Este gráfico ainda usa dados demonstrativos.
  const chart = adherenceWeek("maria");

  const medications = patientMedications?.medications ?? [];
  const prescriptions = patientMedications?.prescriptions ?? [];
  const medicationLogs = patientMedications?.medicationLogs ?? [];

  const activePrescriptions = useMemo(
    () =>
      prescriptions.filter(
        (prescription) =>
          prescription.status.toUpperCase() === "ACTIVE",
      ),
    [prescriptions],
  );

  const todayMedicationLogs = useMemo(
    () =>
      medicationLogs.filter((log) =>
        isToday(log.data.scheduledAt ?? log.scheduledAt),
      ),
    [medicationLogs],
  );

  const completedToday = todayMedicationLogs.filter((log) =>
    ["COMPLETED", "ADMINISTERED", "TAKEN"].includes(
      (log.data.status ?? "").toUpperCase(),
    ),
  ).length;

  const hasTodayContent =
    todayMedicationLogs.length > 0 ||
    todayExerciseLogs.length > 0 ||
    Boolean(
      next &&
        nextAppointmentDate &&
        isToday(nextAppointmentDate.toISOString()),
    );

  const hasTodayLoading =
    medicationsLoading || exercisesLoading || appointmentsLoading;

  const hasTodayError =
    Boolean(medicationsError) ||
    Boolean(exercisesError) ||
    Boolean(appointmentsError);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
        <GlassCard title="Medicamentos prescritos">
          {medicationsLoading ? (
            <p className="text-sm text-ink-soft">
              Carregando seus medicamentos...
            </p>
          ) : medicationsError ? (
            <EmptyState
              title="Não foi possível carregar os medicamentos"
              description="Tente atualizar a página. Se o problema continuar, verifique a conexão com o servidor."
            />
          ) : activePrescriptions.length === 0 ? (
            <EmptyState
              title="Nenhuma prescrição cadastrada"
              description="Quando sua equipe registrar uma prescrição no sistema, ela aparecerá aqui."
            />
          ) : (
            <ul className="flex flex-col gap-3">
              {activePrescriptions.map((prescription) => {
                const medication = medications.find(
                  (item) =>
                    item._id === prescription.data.medicationId,
                );

                const dose = prescription.data.dose;
                const unit = prescription.data.unit;
                const schedule = prescription.data.schedule;

                return (
                  <ListRow
                    key={prescription._id}
                    icon={MedicineIcon}
                    title={medication?.data.name ?? "Medicamento"}
                    subtitle={
                      [
                        dose != null
                          ? `Dose: ${dose}${unit ? ` ${unit}` : ""}`
                          : null,
                        schedule?.length
                          ? `Programação: ${schedule.join(", ")}`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(" · ") ||
                      "Detalhes da prescrição não informados"
                    }
                  />
                );
              })}
            </ul>
          )}
        </GlassCard>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
          <MetricCard
            icon={CalendarIcon}
            label="Próxima consulta"
            value={
              appointmentsLoading
                ? "..."
                : nextAppointmentDate
                  ? shortDay(nextAppointmentDate)
                  : "—"
            }
            note={
              appointmentsLoading
                ? "Carregando agenda..."
                : appointmentsError
                  ? "Não foi possível carregar a agenda"
                  : next
                    ? `${nextAppointmentTime} · ${nextAppointmentTitle}`
                    : "Nenhuma consulta futura"
            }
          />

          <MetricCard
            icon={ExerciseIcon}
            label="Exercício de hoje"
            value={
              exercisesLoading
                ? "..."
                : todayExercise
                  ? formatDuration(
                      todayExercise.data.durationMinutes ??
                        todayExerciseDetails?.data.durationMinutes,
                    )
                  : "—"
            }
            note={
              exercisesLoading
                ? "Carregando exercícios..."
                : exercisesError
                  ? "Não foi possível carregar os exercícios"
                  : todayExercise
                    ? todayExerciseDetails?.data.name ??
                      "Exercício registrado"
                    : "Nenhum registro de exercício hoje"
            }
          />

          <MetricCard
            icon={CheckCircleIcon}
            label="Exercícios da semana"
            value={
              exercisesLoading
                ? "..."
                : `${completedWeekExercises} de ${weekExerciseLogs.length}`
            }
            note={
              exercisesLoading
                ? "Carregando registros..."
                : `${activePlans.length} ${
                    activePlans.length === 1
                      ? "plano ativo"
                      : "planos ativos"
                  } · últimos 7 dias`
            }
          />

          <MetricCard
            icon={MessageIcon}
            label="Registros recentes"
            value={String(notes.length)}
            note="da sua equipe"
          />
        </div>
      </div>

      <GlassCard title="Hoje">
        <ul className="flex flex-col gap-3">
          {medicationsLoading ? (
            <li className="text-sm text-ink-soft">
              Carregando registros de medicamentos...
            </li>
          ) : medicationsError ? (
            <li className="text-sm text-ink-soft">
              Não foi possível carregar os registros de medicamentos.
            </li>
          ) : (
            todayMedicationLogs.map((log) => {
              const prescription = prescriptions.find(
                (item) =>
                  item._id === log.data.prescriptionId,
              );

              const medication = medications.find(
                (item) =>
                  item._id === prescription?.data.medicationId,
              );

              const scheduledAt =
                log.data.scheduledAt ?? log.scheduledAt;

              const time = formatTime(scheduledAt);

              const dose =
                log.data.dose ?? prescription?.data.dose;

              const unit = prescription?.data.unit ?? "";

              const status = (log.data.status ?? "").toUpperCase();

              const statusLabel = [
                "COMPLETED",
                "ADMINISTERED",
                "TAKEN",
              ].includes(status)
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
                  title={`${medication?.data.name ?? "Medicamento"}${time ? ` — ${time}` : ""}`}
                  subtitle={[
                    dose != null
                      ? `${dose}${unit ? ` ${unit}` : ""}`
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
              Carregando registros de exercícios...
            </li>
          ) : exercisesError ? (
            <li className="text-sm text-ink-soft">
              Não foi possível carregar os registros de exercícios.
            </li>
          ) : (
            todayExerciseLogs.map((log) => {
              const exerciseDetails = exercises.find(
                (item) => item._id === log.data.exerciseId,
              );

              const performedAt =
                log.data.performedAt ?? log.performedAt;

              const time = formatTime(performedAt);

              const completed = log.data.completed === true;

              return (
                <ListRow
                  key={log._id}
                  icon={ExerciseIcon}
                  title={`${exerciseDetails?.data.name ?? "Exercício"}${time ? ` — ${time}` : ""}`}
                  subtitle={[
                    formatDuration(
                      log.data.durationMinutes ??
                        exerciseDetails?.data.durationMinutes,
                    ),
                    completed ? "Concluído" : "Registrado como pendente",
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

          {!appointmentsLoading &&
            !appointmentsError &&
            next &&
            nextAppointmentDate &&
            isToday(nextAppointmentDate.toISOString()) && (
              <ListRow
                key={next._id}
                icon={CalendarIcon}
                title={nextAppointmentTitle}
                subtitle={`${nextAppointmentDate.toLocaleDateString(
                  "pt-BR",
                  {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                  },
                )} · ${nextAppointmentTime}`}
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
              <EmptyState
                title="Nada previsto para hoje"
                description="Quando houver exercícios, medicamentos ou consultas registrados para hoje, eles aparecerão aqui."
              />
            )}

          {!hasTodayContent &&
            !hasTodayLoading &&
            hasTodayError && (
              <p className="text-sm text-ink-soft">
                Alguns dados de hoje não puderam ser carregados. Verifique
                as mensagens acima.
              </p>
            )}
        </ul>
      </GlassCard>

      {!medicationsLoading &&
        !medicationsError &&
        todayMedicationLogs.length > 0 && (
          <p className="text-sm text-ink-soft">
            {completedToday} de {todayMedicationLogs.length} registros de
            medicamentos de hoje estão marcados como concluídos.
          </p>
        )}

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassCard
          title="Medicamentos na semana"
          description="Exemplo visual demonstrativo — ainda não conectado aos registros reais"
        >
          <BarTrendChart
            data={chart}
            xKey="day"
            yKey="medications"
            seriesName="Registrados"
            summary={`Dados demonstrativos de medicamentos nos últimos 7 dias: ${chart
              .map((item) => `${item.day}, ${item.medications}`)
              .join("; ")}.`}
          />
        </GlassCard>

        <GlassCard title="Sua rede de cuidado">
          <ul className="flex flex-col gap-3">
            {careNetwork.map((person) => (
              <li
                key={person.id}
                className="flex items-center gap-4 rounded-[20px] bg-mint-100/70 px-4 py-3"
              >
                <Avatar
                  name={person.name}
                  tone="soft"
                  className="bg-white!"
                />

                <div>
                  <p className="text-base font-medium text-ink">
                    {person.name}
                  </p>
                  <p className="text-sm text-ink-soft">
                    {person.role}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassCard title="Registros recentes">
          {notes.length === 0 ? (
            <EmptyState title="Nenhum registro ainda" />
          ) : (
            <ul className="flex flex-col gap-3">
              {notes.map((note) => (
                <ListRow
                  key={note.id}
                  icon={MessageIcon}
                  title={note.text}
                  subtitle={`${note.author} · ${note.when}`}
                />
              ))}
            </ul>
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