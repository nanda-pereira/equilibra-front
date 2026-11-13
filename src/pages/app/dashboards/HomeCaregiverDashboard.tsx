
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "../../../modules/session/session";
import EmptyState from "../../../components/app/EmptyState";
import GlassCard from "../../../components/app/GlassCard";
import ListRow from "../../../components/app/ListRow";
import PageHeader from "../../../components/app/PageHeader";
import SmallButton from "../../../components/app/SmallButton";
import StatusBadge from "../../../components/app/StatusBadge";
import { BarTrendChart } from "../../../components/app/charts";
import {
  CalendarIcon,
  ExerciseIcon,
  MedicineIcon,
  MessageIcon,
} from "../../../components/ui/icons";
import {
  getMyPatientCareNetwork,
  getPatientAppointments,
  getPatientMedications,
  getPatientObservations,
} from "../../../services/api/patients";
import type { PatientCareLink } from "../../../services/api/patients";
import { getPatientExercises } from "../../../services/api/exercises";

type LinkedPatient = {
  id: string;
  name: string;
  relationship: string;
};

type PatientDashboardData = {
  patient: LinkedPatient;
  medications: Awaited<ReturnType<typeof getPatientMedications>>;
  appointments: Awaited<ReturnType<typeof getPatientAppointments>>;
  observations: Awaited<ReturnType<typeof getPatientObservations>>;
  exercises: Awaited<ReturnType<typeof getPatientExercises>>;
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
    relationship: link.relationship,
  };
}

function isSameDay(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
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

export default function HomeCaregiverDashboard() {
  const { session } = useSession();
  const accessToken = session?.accessToken;

  const [refreshKey, setRefreshKey] = useState(0);

  const [careLinks, setCareLinks] = useState<PatientCareLink[]>([]);
  const [linksLoading, setLinksLoading] = useState(true);
  const [linksError, setLinksError] = useState<string | null>(null);

  const [dashboardData, setDashboardData] = useState<
    PatientDashboardData[]
  >([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  const loadCareLinks = useCallback(async () => {
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
    } catch (error) {
      setLinksError(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os pacientes vinculados.",
      );
    } finally {
      setLinksLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialCareLinks() {
      // Evita atualizações síncronas de estado no corpo do efeito.
      await Promise.resolve();

      if (cancelled) return;

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

        if (cancelled) return;

        setCareLinks(result);
      } catch (error) {
        if (cancelled) return;

        setLinksError(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os pacientes vinculados.",
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
  }, [accessToken, refreshKey]);

  const activePatients = useMemo(
    () =>
      careLinks
        .filter((link) => link.status === "ACTIVE")
        .map(getLinkedPatient)
        .filter((patient): patient is LinkedPatient => patient !== null),
    [careLinks],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadPatientData() {
      if (!accessToken || activePatients.length === 0) {
        setDashboardData([]);
        setDataLoading(false);
        setDataError(null);
        return;
      }

      setDataLoading(true);
      setDataError(null);

      const results = await Promise.allSettled(
        activePatients.map(async (patient): Promise<PatientDashboardData> => {
          const [medications, appointments, observations, exercises] =
            await Promise.all([
              getPatientMedications(accessToken, patient.id),
              getPatientAppointments(accessToken, patient.id),
              getPatientObservations(accessToken, patient.id),
              getPatientExercises(accessToken, patient.id),
            ]);

          return {
            patient,
            medications,
            appointments,
            observations,
            exercises,
          };
        }),
      );

      if (cancelled) return;

      const successful = results
        .filter(
          (
            result,
          ): result is PromiseFulfilledResult<PatientDashboardData> =>
            result.status === "fulfilled",
        )
        .map((result) => result.value);

      setDashboardData(successful);

      const failed = results.filter(
        (result) => result.status === "rejected",
      ).length;

      if (failed > 0) {
        setDataError(
          successful.length === 0
            ? "Não foi possível carregar os dados dos pacientes. Verifique o acesso à API e tente novamente."
            : `Não foi possível carregar os dados de ${failed} paciente(s). Parte das informações pode estar incompleta.`,
        );
      }

      setDataLoading(false);
    }

    void loadPatientData();

    return () => {
      cancelled = true;
    };
  }, [accessToken, activePatients, refreshKey]);

  const allMedicationLogs = dashboardData.flatMap((item) =>
    item.medications.medicationLogs.map((log) => ({
      id: log._id,
      patientName: item.patient.name,
      data: log.data,
      scheduledAt: log.scheduledAt,
      createdAt: log.createdAt,
      status: log.status,
    })),
  );

  const today = new Date();

  const todayMedicationLogs = allMedicationLogs.filter((log) => {
    const dateValue = log.data.administeredAt;

    if (!dateValue) return false;

    const date = new Date(dateValue);

    return !Number.isNaN(date.getTime()) && isSameDay(date, today);
  });

  const activePrescriptions = dashboardData.flatMap((item) =>
    item.medications.prescriptions
      .filter((prescription) => prescription.status === "ACTIVE")
      .map((prescription) => {
        const medication = item.medications.medications.find(
          (entry) => entry._id === prescription.data.medicationId,
        );

        return {
          id: prescription._id,
          patientName: item.patient.name,
          name: medication?.data.name ?? "Medicamento prescrito",
          dose: [
            prescription.data.dose,
            prescription.data.unit,
            prescription.data.route,
          ]
            .filter(Boolean)
            .join(" · "),
          instructions: prescription.data.instructions,
        };
      }),
  );

  const allAppointments = dashboardData
    .flatMap((item) =>
      item.appointments.map((appointment) => ({
        id: appointment._id,
        patientName: item.patient.name,
        title: appointment.data.title || "Consulta",
        scheduledAt:
          appointment.data.scheduledAt ?? appointment.scheduledAt ?? null,
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

  const excludedAppointmentStatuses = [
    "CANCELLED",
    "CANCELED",
    "REJECTED",
    "COMPLETED",
  ];

  const validAppointments = allAppointments.filter(
    (appointment) =>
      !excludedAppointmentStatuses.includes(
        appointment.status.toUpperCase(),
      ),
  );

  const nextAppointment = validAppointments.find(
    (appointment) => new Date(appointment.scheduledAt!) >= today,
  );

  const upcomingAppointments = validAppointments.filter((appointment) => {
    const date = new Date(appointment.scheduledAt!);
    const limit = new Date(today);
    limit.setDate(today.getDate() + 7);

    return date >= today && date <= limit;
  });

  const exerciseItems = dashboardData.flatMap((item) => {
    const exercisesById = new Map(
      item.exercises.exercises.map((exercise) => [
        exercise._id,
        exercise.data,
      ]),
    );

    const now = new Date();

    const activePlans = item.exercises.plans.filter((plan) => {
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

    const plannedIds = [
      ...new Set(
        activePlans.flatMap((plan) => plan.data.exerciseIds ?? []),
      ),
    ];

    const plannedExercises = plannedIds
      .map((id) => exercisesById.get(id))
      .filter((exercise) => exercise !== undefined);

    return plannedExercises.map((exercise, index) => ({
      id: `${item.patient.id}-${exercise.name}-${index}`,
      patientName: item.patient.name,
      title: exercise.name,
      detail:
        exercise.durationMinutes != null
          ? `${exercise.durationMinutes} minutos`
          : exercise.description ||
            exercise.category ||
            "Exercício cadastrado",
    }));
  });

  const recentObservations = dashboardData
    .flatMap((item) =>
      item.observations.map((observation) => ({
        id: observation._id,
        patientName: item.patient.name,
        category: observation.data.category,
        notes: observation.data.notes,
        date:
          observation.scheduledAt ??
          observation.createdAt ??
          observation.updatedAt,
      })),
    )
    .sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  const weeklyChart = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setHours(0, 0, 0, 0);
    date.setDate(today.getDate() - (6 - index));

    const medications = allMedicationLogs.filter((log) => {
      const dateValue = log.data.administeredAt;

      if (!dateValue) return false;

      const logDate = new Date(dateValue);

      return !Number.isNaN(logDate.getTime()) && isSameDay(logDate, date);
    }).length;

    return {
      day: date.toLocaleDateString("pt-BR", { weekday: "short" }),
      medications,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader />

      {linksError && (
        <GlassCard title="Pacientes vinculados">
          <div className="flex flex-col items-start gap-3">
            <p role="alert" className="text-sm text-ink-soft">
              {linksError}
            </p>
            <SmallButton onClick={() => void loadCareLinks()}>
              Tentar novamente
            </SmallButton>
          </div>
        </GlassCard>
      )}

      <GlassCard className="sm:p-8">
        <h2 className="text-xl font-medium text-deep sm:text-2xl">
          Rotina de hoje
        </h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[20px] bg-mint-100/70 p-4">
            <p className="text-sm text-ink-soft">
              Registros de medicamentos hoje
            </p>
            <p className="mt-1 text-2xl font-semibold text-deep">
              {todayMedicationLogs.length}
            </p>
            <p className="text-sm text-ink-soft">registros encontrados</p>
          </div>

          <div className="rounded-[20px] bg-mint-100/70 p-4">
            <p className="text-sm text-ink-soft">Exercícios cadastrados</p>
            <p className="mt-1 text-2xl font-semibold text-deep">
              {exerciseItems.length}
            </p>
            <div className="mt-1">
              <StatusBadge
                status="info"
                label={exerciseItems.length > 0 ? "Disponíveis" : "Sem exercícios"}
              />
            </div>
          </div>

          <div className="rounded-[20px] bg-mint-100/70 p-4">
            <p className="text-sm text-ink-soft">Próxima consulta</p>
            <p className="mt-1 text-2xl font-semibold text-deep">
              {nextAppointment
                ? formatDate(nextAppointment.scheduledAt)
                : "—"}
            </p>
            <p className="text-sm text-ink-soft">
              {nextAppointment
                ? formatTime(nextAppointment.scheduledAt)
                : "Nenhuma agendada"}
            </p>
          </div>
        </div>

        {dataLoading && (
          <p className="mt-4 text-sm text-ink-soft">
            Carregando a rotina dos pacientes...
          </p>
        )}

        {dataError && (
          <p role="alert" className="mt-4 text-sm text-ink-soft">
            {dataError}
          </p>
        )}
      </GlassCard>

      <GlassCard
        title="Pacientes vinculados"
        action={
          <SmallButton
            onClick={() => setRefreshKey((key) => key + 1)}
          >
            Atualizar
          </SmallButton>
        }
      >
        {linksLoading ? (
          <p className="py-3 text-sm text-ink-soft">
            Carregando pacientes...
          </p>
        ) : activePatients.length === 0 ? (
          <EmptyState title="Nenhum paciente vinculado ainda" />
        ) : (
          <ul className="flex flex-col gap-3">
            {activePatients.map((patient) => (
              <ListRow
                key={patient.id}
                icon={MessageIcon}
                title={patient.name}
                subtitle="Vínculo de cuidado ativo"
              />
            ))}
          </ul>
        )}
      </GlassCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassCard
          title="Medicamentos prescritos"
          action={
            <SmallButton to="/app/medicamentos">Ver todos</SmallButton>
          }
        >
          {activePrescriptions.length === 0 ? (
            <EmptyState title="Nenhuma prescrição ativa encontrada" />
          ) : (
            <ul className="flex flex-col gap-3">
              {activePrescriptions.slice(0, 5).map((prescription) => (
                <ListRow
                  key={prescription.id}
                  icon={MedicineIcon}
                  title={`${prescription.patientName} · ${prescription.name}`}
                  subtitle={
                    prescription.dose ||
                    prescription.instructions ||
                    "Detalhes não informados"
                  }
                />
              ))}
            </ul>
          )}
        </GlassCard>

        <GlassCard title="Exercícios cadastrados">
          {exerciseItems.length === 0 ? (
            <EmptyState title="Nenhum exercício cadastrado" />
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
        <GlassCard title="Próximas atividades">
          {upcomingAppointments.length === 0 ? (
            <EmptyState title="Nenhuma consulta nos próximos 7 dias" />
          ) : (
            <ul className="flex flex-col gap-3">
              {upcomingAppointments.slice(0, 5).map((appointment) => (
                <ListRow
                  key={appointment.id}
                  icon={CalendarIcon}
                  title={`${appointment.patientName} · ${appointment.title}`}
                  subtitle={`${formatDate(appointment.scheduledAt)} às ${formatTime(appointment.scheduledAt)}`}
                />
              ))}
            </ul>
          )}
        </GlassCard>

        <GlassCard title="Registros clínicos recentes">
          {recentObservations.length === 0 ? (
            <EmptyState title="Nenhum registro clínico encontrado" />
          ) : (
            <ul className="flex flex-col gap-3">
              {recentObservations.map((observation) => (
                <ListRow
                  key={observation.id}
                  icon={MessageIcon}
                  title={`${observation.patientName} · ${observation.category || "Observação"}`}
                  subtitle={`${observation.notes || "Sem detalhes"} · ${formatDate(observation.date)}`}
                />
              ))}
            </ul>
          )}
        </GlassCard>
      </div>

      <GlassCard title="Medicamentos registrados na semana">
        <BarTrendChart
          data={weeklyChart}
          xKey="day"
          yKey="medications"
          seriesName="Registros"
          height={200}
          summary={`Registros de medicamentos nos últimos 7 dias: ${weeklyChart
            .map((item) => `${item.day}, ${item.medications}`)
            .join("; ")}.`}
        />
      </GlassCard>
    </div>
  );
}