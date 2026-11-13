
import { useSession } from "../../../modules/session/session";
import { useCallback, useEffect, useMemo, useState } from "react";
import Avatar from "../../../components/app/Avatar";
import EmptyState from "../../../components/app/EmptyState";
import GlassCard from "../../../components/app/GlassCard";
import ListRow from "../../../components/app/ListRow";
import PageHeader from "../../../components/app/PageHeader";
import SmallButton from "../../../components/app/SmallButton";
import { BarTrendChart } from "../../../components/app/charts";
import {
  ExerciseIcon,
  MedicineIcon,
  MessageIcon,
} from "../../../components/ui/icons";
import {
  getMyPatientCareNetwork,
  getPatientAppointments,
  getPatientMedications,
  getPatientObservations,
  respondToCareInvite,
} from "../../../services/api/patients";
import type {
  PatientCareLink,
  PatientAppointment,
  PatientRecord,
  MedicationData,
  PrescriptionData,
  ObservationData,
} from "../../../services/api/patients";
import type {
  PatientExercisesData,
  PatientExerciseData,
} from "../../../services/api/exercises";
import { getPatientExercises } from "../../../services/api/exercises";

type LinkedPatient = {
  id: string;
  name: string;
  status: string;
  relationship: string;
};

type DashboardData = {
  patientId: string;
  patientName: string;
  medications: PatientRecord<MedicationData>[];
  prescriptions: PatientRecord<PrescriptionData>[];
  appointments: PatientAppointment[];
  observations: PatientRecord<ObservationData>[];
  exercises: PatientExercisesData["exercises"];
  plans: PatientExercisesData["plans"];
};

const relationshipLabels: Record<string, string> = {
  CLINICAL_CAREGIVER: "Cuidador clínico",
  HOME_CAREGIVER: "Cuidador domiciliar",
};

function getLinkedPatient(link: PatientCareLink): LinkedPatient | null {
  const patient =
    typeof link.patientId === "object" && link.patientId !== null
      ? link.patientId
      : null;

  const patientUser =
    patient &&
    typeof patient.userId === "object" &&
    patient.userId !== null
      ? patient.userId
      : null;

  const id = patient?._id ?? patient?.id;

  if (!id) return null;

  return {
    id,
    name: patientUser?.fullName?.trim() || "Paciente vinculado",
    status: link.status,
    relationship: link.relationship,
  };
}

function getRecordDate(record: {
  scheduledAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}) {
  return record.scheduledAt ?? record.createdAt ?? record.updatedAt ?? null;
}

function formatDate(value?: string | null) {
  if (!value) return "Data não informada";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Data não informada";

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatTime(value?: string | null) {
  if (!value) return "Horário não informado";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Horário não informado";

  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getAppointmentDate(appointment: PatientAppointment) {
  return appointment.data.scheduledAt ?? appointment.scheduledAt ?? null;
}

export default function ClinicalCaregiverDashboard() {
  const { session } = useSession();
  const accessToken = session?.accessToken;

  const [careLinks, setCareLinks] = useState<PatientCareLink[]>([]);
  const [linksLoading, setLinksLoading] = useState(true);
  const [linksError, setLinksError] = useState<string | null>(null);

  const [dashboardData, setDashboardData] = useState<DashboardData[]>([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  const [processingLinkId, setProcessingLinkId] = useState<string | null>(
    null,
  );
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadCareLinks = useCallback(async () => {
    await Promise.resolve();

    if (!accessToken) {
      setCareLinks([]);
      setLinksLoading(false);
      setLinksError("Entre novamente para consultar seus vínculos.");
      return;
    }

    setLinksLoading(true);
    setLinksError(null);

    try {
      const result = await getMyPatientCareNetwork(accessToken);
      setCareLinks(result);
    } catch (err) {
      setLinksError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar os vínculos de cuidado.",
      );
    } finally {
      setLinksLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialCareLinks() {
      if (!accessToken) {
        return;
      }

      try {
        const result = await getMyPatientCareNetwork(accessToken);

        if (cancelled) return;

        setCareLinks(result);
        setLinksError(null);
      } catch (err) {
        if (cancelled) return;

        setLinksError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar os vínculos de cuidado.",
        );
      } finally {
        if (!cancelled) {
          setLinksLoading(false);
        }
      }
    }

    void loadInitialCareLinks();

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  const activePatients = useMemo(
    () =>
      careLinks
        .filter((link) => link.status === "ACTIVE")
        .map(getLinkedPatient)
        .filter((patient): patient is LinkedPatient => patient !== null),
    [careLinks],
  );

  const pendingLinks = useMemo(
    () => careLinks.filter((link) => link.status === "PENDING"),
    [careLinks],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadDashboardData() {
      if (!accessToken || activePatients.length === 0) {
        setDashboardData([]);
        setDashboardLoading(false);
        setDashboardError(null);
        return;
      }

      setDashboardLoading(true);
      setDashboardError(null);

      const results = await Promise.allSettled(
        activePatients.map(async (patient): Promise<DashboardData> => {
          const [medications, appointments, observations, exercises] =
            await Promise.all([
              getPatientMedications(accessToken, patient.id),
              getPatientAppointments(accessToken, patient.id),
              getPatientObservations(accessToken, patient.id),
              getPatientExercises(accessToken, patient.id),
            ]);

          return {
            patientId: patient.id,
            patientName: patient.name,
            medications: medications.medications,
            prescriptions: medications.prescriptions,
            appointments,
            observations,
            exercises: exercises.exercises,
            plans: exercises.plans,
          };
        }),
      );

      if (cancelled) return;

      const successfulResults = results
        .filter(
          (
            result,
          ): result is PromiseFulfilledResult<DashboardData> =>
            result.status === "fulfilled",
        )
        .map((result) => result.value);

      setDashboardData(successfulResults);

      const failedCount = results.filter(
        (result) => result.status === "rejected",
      ).length;

      if (failedCount > 0) {
        setDashboardError(
          successfulResults.length === 0
            ? "Não foi possível carregar os dados dos pacientes. Verifique seu acesso e tente novamente."
            : `Não foi possível carregar os dados de ${failedCount} paciente(s). Os demais dados foram mantidos.`,
        );
      }

      setDashboardLoading(false);
    }

    void loadDashboardData();

    return () => {
      cancelled = true;
    };
  }, [accessToken, activePatients]);

  async function handleInviteResponse(
    linkId: string,
    decision: "ACTIVE" | "REJECTED",
  ) {
    if (!accessToken) return;

    setProcessingLinkId(linkId);
    setActionError(null);
    setActionSuccess(null);

    try {
      await respondToCareInvite(linkId, decision, accessToken);

      setActionSuccess(
        decision === "ACTIVE"
          ? "Convite aceito. O vínculo foi atualizado."
          : "Convite recusado.",
      );

      await loadCareLinks();
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Não foi possível responder ao convite.",
      );
    } finally {
      setProcessingLinkId(null);
    }
  }

  const medicationItems = dashboardData.flatMap((patient) =>
    patient.prescriptions
      .filter((prescription) => prescription.status === "ACTIVE")
      .map((prescription) => {
        const medication = patient.medications.find(
          (item) => item._id === prescription.data.medicationId,
        );

        return {
          id: prescription._id,
          patientName: patient.patientName,
          medicationName: medication?.data.name ?? "Medicamento prescrito",
          details: [
            prescription.data.dose,
            prescription.data.unit,
            prescription.data.route,
          ]
            .filter(Boolean)
            .join(" · "),
        };
      }),
  );
  const exerciseItems = dashboardData.flatMap((patient) => {
    const exercisesById = new Map(
      patient.exercises.map((exercise) => [
        exercise._id,
        exercise.data,
      ]),
    );

    const now = new Date();

    const activePlans = patient.plans.filter((plan) => {
      if (plan.status.toUpperCase() !== "ACTIVE") {
        return false;
      }

      const startsAt = plan.data.startsAt
        ? new Date(plan.data.startsAt)
        : null;

      const endsAt = plan.data.endsAt
        ? new Date(plan.data.endsAt)
        : null;

      if (
        (startsAt && Number.isNaN(startsAt.getTime())) ||
        (endsAt && Number.isNaN(endsAt.getTime()))
      ) {
        return false;
      }

      return (
        (!startsAt || startsAt <= now) &&
        (!endsAt || endsAt >= now)
      );
    });

    const plannedExerciseIds = new Set(
      activePlans.flatMap((plan) => plan.data.exerciseIds ?? []),
    );

    const plannedExercises = [...plannedExerciseIds]
      .map((id) => exercisesById.get(id))
      .filter(
        (exercise): exercise is PatientExerciseData =>
          exercise !== undefined,
      );

    return plannedExercises.map((exercise, index) => ({
      id: `${patient.patientId}-${exercise.name}-${index}`,
      patientName: patient.patientName,
      title: exercise.name,
      detail:
        exercise.durationMinutes != null
          ? `${exercise.durationMinutes} minutos`
          : exercise.description ||
            exercise.category ||
            "Exercício cadastrado",
    }));
  });

  const allAppointments = dashboardData
    .flatMap((patient) =>
      patient.appointments.map((appointment) => ({
        id: appointment._id,
        patientName: patient.patientName,
        title: appointment.data.title || "Consulta",
        scheduledAt: getAppointmentDate(appointment),
        status: appointment.status,
      })),
    )
    .filter(
      (appointment) =>
        appointment.scheduledAt &&
        !Number.isNaN(new Date(appointment.scheduledAt).getTime()),
    )
    .sort(
      (a, b) =>
        new Date(a.scheduledAt!).getTime() -
        new Date(b.scheduledAt!).getTime(),
    );

  const now = new Date();
  const nextWeek = new Date(now);
  nextWeek.setDate(now.getDate() + 7);

  const upcomingAppointments = allAppointments.filter((appointment) => {
    const date = new Date(appointment.scheduledAt!);

    return (
      date >= now &&
      date <= nextWeek &&
      !["CANCELLED", "CANCELED", "REJECTED", "COMPLETED"].includes(
        appointment.status.toUpperCase(),
      )
    );
  });

  const todayAppointments = allAppointments.filter((appointment) => {
    const date = new Date(appointment.scheduledAt!);

    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate() &&
      !["CANCELLED", "CANCELED", "REJECTED", "COMPLETED"].includes(
        appointment.status.toUpperCase(),
      )
    );
  });

  const weekChart = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);
    date.setDate(now.getDate() + index);

    const appointments = upcomingAppointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.scheduledAt!);

      return (
        appointmentDate.getFullYear() === date.getFullYear() &&
        appointmentDate.getMonth() === date.getMonth() &&
        appointmentDate.getDate() === date.getDate()
      );
    }).length;

    return {
      day: date.toLocaleDateString("pt-BR", { weekday: "short" }),
      appointments,
    };
  });

  const recentObservations = dashboardData
    .flatMap((patient) =>
      patient.observations.map((observation) => ({
        id: observation._id,
        patientName: patient.patientName,
        category: observation.data.category,
        notes: observation.data.notes,
        date:
          (
            observation.data as ObservationData & {
              observedAt?: string;
            }
          ).observedAt ?? getRecordDate(observation),
      })),
    )
    .sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader />

      <GlassCard title="Convites recebidos">
        {linksLoading ? (
          <p className="py-3 text-sm text-ink-soft">
            Carregando convites...
          </p>
        ) : linksError ? (
          <div className="flex flex-col items-start gap-3">
            <p role="alert" className="text-sm text-ink-soft">
              {linksError}
            </p>
            <SmallButton onClick={() => void loadCareLinks()}>
              Tentar novamente
            </SmallButton>
          </div>
        ) : pendingLinks.length === 0 ? (
          <EmptyState title="Você não tem convites pendentes" />
        ) : (
          <ul className="flex flex-col gap-3">
            {pendingLinks.map((link) => {
              const patient = getLinkedPatient(link);
              const isProcessing = processingLinkId === link._id;

              return (
                <li
                  key={link._id}
                  className="rounded-[20px] bg-mint-100/70 p-4"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={patient?.name ?? "Paciente"}
                      tone="soft"
                      className="bg-white!"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-ink">
                        {patient?.name ?? "Convite de paciente"}
                      </p>
                      <p className="text-sm text-ink-soft">
                        {relationshipLabels[link.relationship] ??
                          "Convite para vínculo de cuidado"}
                      </p>
                      <p className="mt-1 text-xs text-ink-soft">
                        Aguardando sua resposta
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() =>
                        void handleInviteResponse(link._id, "ACTIVE")
                      }
                      className="min-h-11 rounded-full bg-action px-5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
                    >
                      {isProcessing ? "Processando..." : "Aceitar"}
                    </button>

                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() =>
                        void handleInviteResponse(link._id, "REJECTED")
                      }
                      className="min-h-11 rounded-full border border-field-border bg-white px-5 text-sm font-medium text-ink transition hover:bg-mint-100 disabled:opacity-60"
                    >
                      Recusar
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {actionError && (
          <p role="alert" className="mt-3 text-sm text-ink-soft">
            {actionError}
          </p>
        )}

        {actionSuccess && (
          <p role="status" className="mt-3 text-sm text-emerald-700">
            {actionSuccess}
          </p>
        )}
      </GlassCard>

      <GlassCard
        title="Pacientes vinculados"
        action={<SmallButton to="/app/pacientes">Ver todos</SmallButton>}
      >
        {linksLoading ? (
          <p className="py-3 text-sm text-ink-soft">
            Carregando pacientes vinculados...
          </p>
        ) : activePatients.length > 0 ? (
          <ul className="grid gap-4 sm:grid-cols-2">
            {activePatients.map((patient) => (
              <li
                key={patient.id}
                className="flex flex-col gap-3 rounded-[20px] bg-mint-100/70 p-4"
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    name={patient.name}
                    tone="soft"
                    className="bg-white!"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-medium text-ink">
                      {patient.name}
                    </p>
                    <p className="text-sm text-ink-soft">Vínculo ativo</p>
                  </div>
                </div>

                <p className="text-sm text-ink-soft">
                  {relationshipLabels[patient.relationship] ??
                    "Membro da equipe de cuidado"}
                </p>

                <SmallButton
                  to={`/app/pacientes/${patient.id}`}
                  label={`Ver ${patient.name}`}
                >
                  Ver paciente
                </SmallButton>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="Nenhum paciente vinculado ainda" />
        )}
      </GlassCard>

      {dashboardError && (
        <div
          role="alert"
          className="rounded-2xl border border-field-border bg-white p-4"
        >
          <p className="text-sm text-ink-soft">{dashboardError}</p>
          <SmallButton
            onClick={() => {
              void loadCareLinks();
            }}
          >
            Atualizar dados
          </SmallButton>
        </div>
      )}

      {dashboardLoading && (
        <p className="text-sm text-ink-soft">
          Carregando informações dos pacientes...
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassCard
          title="Medicamentos prescritos"
          action={
            <SmallButton to="/app/medicamentos">
              Ver todos
            </SmallButton>
          }
        >
          {medicationItems.length === 0 ? (
            <EmptyState title="Nenhuma prescrição ativa encontrada" />
          ) : (
            <ul className="flex flex-col gap-3">
              {medicationItems.slice(0, 5).map((item) => (
                <ListRow
                  key={item.id}
                  icon={MedicineIcon}
                  title={`${item.patientName} · ${item.medicationName}`}
                  subtitle={item.details || "Detalhes não informados"}
                />
              ))}
            </ul>
          )}
        </GlassCard>

        <GlassCard title="Exercícios em planos ativos">
          {exerciseItems.length === 0 ? (
            <EmptyState title="Nenhum exercício em plano ativo no momento" />
          ) : (
            <ul className="flex flex-col gap-3">
              {exerciseItems.slice(0, 5).map((exercise) => (
                <ListRow
                  key={exercise.id}
                  icon={ExerciseIcon}
                  title={`${exercise.patientName} · ${exercise.title}`}
                  subtitle={exercise.detail}
                />
              ))}
            </ul>
          )}
        </GlassCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassCard title="Consultas nos próximos 7 dias">
          {upcomingAppointments.length === 0 ? (
            <EmptyState title="Nenhuma consulta agendada para os próximos 7 dias" />
          ) : (
            <BarTrendChart
              data={weekChart}
              xKey="day"
              yKey="appointments"
              seriesName="Consultas"
              summary={`Consultas nos próximos 7 dias: ${weekChart
                .map((item) => `${item.day}, ${item.appointments}`)
                .join("; ")}.`}
            />
          )}
        </GlassCard>

        <GlassCard title="Registros clínicos recentes">
          {recentObservations.length === 0 ? (
            <EmptyState title="Nenhuma observação clínica registrada" />
          ) : (
            <ul className="flex flex-col gap-3">
              {recentObservations.map((record) => (
                <ListRow
                  key={record.id}
                  icon={MessageIcon}
                  title={`${record.patientName} · ${record.category || "Observação clínica"}`}
                  subtitle={`${record.notes || "Sem detalhes"} · ${formatDate(record.date)}`}
                />
              ))}
            </ul>
          )}
        </GlassCard>
      </div>

      <GlassCard title="Agenda de hoje">
        {todayAppointments.length === 0 ? (
          <EmptyState title="Nenhuma consulta agendada para hoje" />
        ) : (
          <ul className="flex flex-col gap-3">
            {todayAppointments.map((appointment) => (
              <ListRow
                key={appointment.id}
                icon={MessageIcon}
                title={`${formatTime(appointment.scheduledAt)} · ${appointment.patientName}`}
                subtitle={appointment.title}
              />
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}