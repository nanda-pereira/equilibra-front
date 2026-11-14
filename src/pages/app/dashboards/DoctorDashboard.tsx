
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import Avatar from "../../../components/app/Avatar";
import EmptyState from "../../../components/app/EmptyState";
import GlassCard from "../../../components/app/GlassCard";
import ListRow from "../../../components/app/ListRow";
import MetricCard from "../../../components/app/MetricCard";
import PageHeader from "../../../components/app/PageHeader";
import SmallButton from "../../../components/app/SmallButton";
import { BarTrendChart } from "../../../components/app/charts";
import {
  CalendarIcon,
  ClockIcon,
  MessageIcon,
  PatientsIcon,
} from "../../../components/ui/icons";
import { useSession } from "../../../modules/session/session";
import {
  getAccessiblePatients,
  getMyPatientCareNetwork,
  getPatientAppointments,
  getPatientMedications,
  getPatientObservations,
  respondToCareInvite,
  type ObservationData,
  type PatientAppointment,
  type PatientCareLink,
  type PatientMedicationsData,
  type PatientProfile,
  type PatientRecord,
} from "../../../services/api/patients";

type DashboardPatient = {
  id: string;
  name: string;
  appointments: PatientAppointment[];
  medications: PatientMedicationsData["medications"];
  observations: PatientRecord<ObservationData>[];
};

function getPatientId(patient: PatientProfile): string {
  return patient.id ?? patient._id ?? "";
}

function getPatientName(patient: PatientProfile): string {
  if (typeof patient.userId === "object" && patient.userId) {
    return patient.userId.fullName || "Paciente";
  }

  return "Paciente";
}

function getInviteId(invite: PatientCareLink): string {
  return invite._id;
}

function getInvitePatientName(invite: PatientCareLink): string {
  const patient = invite.patientId;

  if (patient && typeof patient === "object") {
    const patientUser = patient.userId;

    if (patientUser && typeof patientUser === "object") {
      return patientUser.fullName || "Paciente";
    }
  }

  return "Paciente";
}

function getInvitePatientEmail(invite: PatientCareLink): string {
  const patient = invite.patientId;

  if (patient && typeof patient === "object") {
    const patientUser = patient.userId;

    if (patientUser && typeof patientUser === "object") {
      return patientUser.email || "";
    }
  }

  return "";
}

function getAppointmentDate(
  appointment: PatientAppointment,
): string | undefined {
  return appointment.data.scheduledAt ?? appointment.scheduledAt ?? undefined;
}

function isAppointmentCountable(appointment: PatientAppointment): boolean {
  return !["CANCELLED", "CANCELED", "REJECTED", "COMPLETED"].includes(
    appointment.status.toUpperCase(),
  );
}

function getObservationDate(
  observation: PatientRecord<ObservationData>,
): string | undefined {
  const data = observation.data as ObservationData & {
    observedAt?: string;
  };

  return data.observedAt ?? observation.createdAt ?? observation.updatedAt;
}

function isValidDate(value?: string): boolean {
  return Boolean(value && !Number.isNaN(new Date(value).getTime()));
}

function formatDate(value?: string): string {
  if (!isValidDate(value)) return "Data não informada";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value!));
}

function formatTime(value?: string): string {
  if (!isValidDate(value)) return "--:--";

  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value!));
}

function isSameDay(first: Date, second: Date): boolean {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function getNextAppointment(
  appointments: PatientAppointment[],
): PatientAppointment | undefined {
  const now = new Date();

  return appointments
    .filter((appointment) => {
      const date = getAppointmentDate(appointment);

      return (
        isValidDate(date) &&
        new Date(date!) >= now &&
        isAppointmentCountable(appointment)
      );
    })
    .sort(
      (a, b) =>
        new Date(getAppointmentDate(a)!).getTime() -
        new Date(getAppointmentDate(b)!).getTime(),
    )[0];
}

export default function DoctorDashboard() {
  const { session } = useSession();
  const accessToken = session?.accessToken;

  const [patients, setPatients] = useState<DashboardPatient[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PatientCareLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [invitesLoading, setInvitesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [inviteActionId, setInviteActionId] = useState<string | null>(null);

  const loadInvites = useCallback(async () => {
    if (!accessToken) {
      setPendingInvites([]);
      setInvitesLoading(false);
      return;
    }

    setInvitesLoading(true);
    setInviteError(null);

    try {
      const links = await getMyPatientCareNetwork(accessToken);

      setPendingInvites(
        links.filter(
          (link) =>
            link.status === "PENDING" &&
            ["NEUROLOGIST", "PROFESSIONAL"].includes(
              link.relationship.toUpperCase(),
            ),
        ),
      );
    } catch (loadError) {
      setInviteError(
        loadError instanceof Error
          ? loadError.message
          : "Não foi possível carregar as solicitações de vínculo.",
      );
    } finally {
      setInvitesLoading(false);
    }
  }, [accessToken]);

  const handleInviteResponse = async (
    invite: PatientCareLink,
    status: "ACTIVE" | "REJECTED",
  ) => {
    const inviteId = getInviteId(invite);

    if (!accessToken || !inviteId || inviteActionId) return;

    setInviteActionId(inviteId);
    setInviteError(null);
    setInviteSuccess(null);

    try {
      await respondToCareInvite(inviteId, status, accessToken);

      setPendingInvites((current) =>
        current.filter((item) => getInviteId(item) !== inviteId),
      );

      setInviteSuccess(
        status === "ACTIVE"
          ? `Solicitação de ${getInvitePatientName(invite)} aceita.`
          : `Solicitação de ${getInvitePatientName(invite)} recusada.`,
      );

      if (status === "ACTIVE") {
        try {
          const profiles = await getAccessiblePatients(accessToken);

          const results = await Promise.all(
            profiles.map(async (profile) => {
              const id = getPatientId(profile);

              if (!id) return null;

              const [appointments, medications, observations] =
                await Promise.allSettled([
                  getPatientAppointments(accessToken, id),
                  getPatientMedications(accessToken, id),
                  getPatientObservations(accessToken, id),
                ]);

              return {
                id,
                name: getPatientName(profile),
                appointments:
                  appointments.status === "fulfilled"
                    ? appointments.value
                    : [],
                medications:
                  medications.status === "fulfilled"
                    ? medications.value.medications
                    : [],
                observations:
                  observations.status === "fulfilled"
                    ? observations.value
                    : [],
              } satisfies DashboardPatient;
            }),
          );

          setPatients(
            results.filter(
              (patient): patient is DashboardPatient => patient !== null,
            ),
          );
        } catch {
          // A resposta ao convite foi concluída; a lista será atualizada
          // novamente quando o dashboard for recarregado.
        }
      }
    } catch (actionError) {
      setInviteError(
        actionError instanceof Error
          ? actionError.message
          : "Não foi possível responder à solicitação.",
      );

      await loadInvites();
    } finally {
      setInviteActionId(null);
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      if (!accessToken) {
        setPatients([]);
        setPendingInvites([]);
        setLoading(false);
        setInvitesLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [profiles, links] = await Promise.all([
          getAccessiblePatients(accessToken),
          getMyPatientCareNetwork(accessToken),
        ]);

        if (cancelled) return;

        setPendingInvites(
          links.filter(
            (link) =>
              link.status === "PENDING" &&
              ["NEUROLOGIST", "PROFESSIONAL"].includes(
                link.relationship.toUpperCase(),
              ),
          ),
        );
        setInvitesLoading(false);

        const results = await Promise.all(
          profiles.map(async (profile) => {
            const id = getPatientId(profile);

            if (!id) return null;

            const [appointments, medications, observations] =
              await Promise.allSettled([
                getPatientAppointments(accessToken, id),
                getPatientMedications(accessToken, id),
                getPatientObservations(accessToken, id),
              ]);

            return {
              id,
              name: getPatientName(profile),
              appointments:
                appointments.status === "fulfilled"
                  ? appointments.value
                  : [],
              medications:
                medications.status === "fulfilled"
                  ? medications.value.medications
                  : [],
              observations:
                observations.status === "fulfilled"
                  ? observations.value
                  : [],
            } satisfies DashboardPatient;
          }),
        );

        if (cancelled) return;

        setPatients(
          results.filter(
            (patient): patient is DashboardPatient => patient !== null,
          ),
        );
      } catch (loadError) {
        if (cancelled) return;

        setPatients([]);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Não foi possível carregar os dados do dashboard.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
          setInvitesLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  const allAppointments = patients.flatMap((patient) =>
    patient.appointments.map((appointment) => ({
      patient,
      appointment,
    })),
  );

  const now = new Date();

  const todayAppointments = allAppointments
    .filter(({ appointment }) => {
      const date = getAppointmentDate(appointment);

      return (
        isValidDate(date) &&
        isSameDay(new Date(date!), now) &&
        isAppointmentCountable(appointment)
      );
    })
    .sort(
      (a, b) =>
        new Date(getAppointmentDate(a.appointment)!).getTime() -
        new Date(getAppointmentDate(b.appointment)!).getTime(),
    );

  const recentObservations = patients
    .flatMap((patient) =>
      patient.observations.map((observation) => ({
        patient,
        observation,
      })),
    )
    .sort((a, b) => {
      const dateA = getObservationDate(a.observation);
      const dateB = getObservationDate(b.observation);

      return (
        (isValidDate(dateB) ? new Date(dateB!).getTime() : 0) -
        (isValidDate(dateA) ? new Date(dateA!).getTime() : 0)
      );
    })
    .slice(0, 4);

  const weekData = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + index);

    const appointments = allAppointments.filter(({ appointment }) => {
      const value = getAppointmentDate(appointment);

      return (
        isValidDate(value) &&
        isSameDay(new Date(value!), date) &&
        isAppointmentCountable(appointment)
      );
    }).length;

    return {
      day: new Intl.DateTimeFormat("pt-BR", {
        weekday: "short",
      }).format(date),
      appointments,
    };
  });

  if (!session) return null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader />

      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          {error}
        </div>
      )}

      <GlassCard title="Solicitações de vínculo">
        {inviteError && (
          <div
            role="alert"
            className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"
          >
            {inviteError}
          </div>
        )}

        {inviteSuccess && (
          <div
            role="status"
            className="mb-4 rounded-2xl border border-line bg-mint-100/70 p-3 text-sm text-ink"
          >
            {inviteSuccess}
          </div>
        )}

        {invitesLoading ? (
          <p className="text-sm text-ink-soft">
            Carregando solicitações...
          </p>
        ) : pendingInvites.length === 0 ? (
          <EmptyState title="Nenhuma solicitação pendente" />
        ) : (
          <ul className="flex flex-col gap-3">
            {pendingInvites.map((invite) => {
              const patientName = getInvitePatientName(invite);
              const patientEmail = getInvitePatientEmail(invite);
              const isProcessing = inviteActionId === getInviteId(invite);

              return (
                <li
                  key={getInviteId(invite)}
                  className="flex flex-col gap-4 rounded-[20px] bg-mint-100/70 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar
                      name={patientName}
                      tone="soft"
                      className="bg-white!"
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-ink">{patientName}</p>
                      {patientEmail && (
                        <p className="break-all text-sm text-ink-soft">
                          {patientEmail}
                        </p>
                      )}
                      <p className="mt-1 text-sm text-ink-soft">
                        Solicita vínculo como paciente
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 sm:shrink-0">
                    <button
                      type="button"
                      disabled={Boolean(inviteActionId)}
                      onClick={() =>
                        void handleInviteResponse(invite, "REJECTED")
                      }
                      className="min-h-11 rounded-full border border-line bg-white px-5 py-2 text-sm font-medium text-ink transition hover:bg-mint-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isProcessing ? "Aguarde..." : "Recusar"}
                    </button>

                    <button
                      type="button"
                      disabled={Boolean(inviteActionId)}
                      onClick={() =>
                        void handleInviteResponse(invite, "ACTIVE")
                      }
                      className="min-h-11 rounded-full bg-action px-5 py-2 text-sm font-medium text-white transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isProcessing ? "Aguarde..." : "Aceitar"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </GlassCard>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
        <MetricCard
          icon={PatientsIcon}
          label="Pacientes sob responsabilidade"
          value={loading ? "..." : String(patients.length)}
        />
        <MetricCard
          icon={CalendarIcon}
          label="Consultas hoje"
          value={loading ? "..." : String(todayAppointments.length)}
        />
        <MetricCard
          icon={MessageIcon}
          label="Registros recentes"
          value={loading ? "..." : String(recentObservations.length)}
        />
      </div>

      <GlassCard
        title="Pacientes"
        action={<SmallButton to="/app/pacientes">Ver todos</SmallButton>}
      >
        {loading ? (
          <p className="text-sm text-ink-soft">Carregando pacientes...</p>
        ) : patients.length === 0 ? (
          <EmptyState title="Nenhum paciente encontrado" />
        ) : (
          <>
            <ul className="flex flex-col gap-3 md:hidden">
              {patients.map((patient) => {
                const nextAppointment = getNextAppointment(
                  patient.appointments,
                );

                return (
                  <li
                    key={patient.id}
                    className="flex flex-col gap-3 rounded-[20px] bg-mint-100/70 p-4"
                  >
                    <Link
                      to={`/app/pacientes/${patient.id}`}
                      className="flex items-center gap-3 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-action"
                    >
                      <Avatar
                        name={patient.name}
                        tone="soft"
                        className="bg-white!"
                      />
                      <div>
                        <p className="text-base font-medium text-ink">
                          {patient.name}
                        </p>
                        <p className="text-sm text-ink-soft">
                          {patient.medications.length} medicamento(s)
                          cadastrado(s)
                        </p>
                      </div>
                    </Link>

                    <p className="text-sm text-ink-soft">
                      Próxima consulta:{" "}
                      {nextAppointment
                        ? formatDate(getAppointmentDate(nextAppointment))
                        : "Não agendada"}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <SmallButton to={`/app/pacientes/${patient.id}`}>
                        Ver dados
                      </SmallButton>
                      <SmallButton
                        variant="solid"
                        to={`/app/mensagens?paciente=${patient.id}`}
                        label={`Contatar ${patient.name}`}
                      >
                        Contatar
                      </SmallButton>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[640px] text-left">
                <caption className="sr-only">
                  Pacientes sob responsabilidade
                </caption>
                <thead>
                  <tr className="text-sm text-ink-soft">
                    <th scope="col" className="pb-3 font-medium">
                      Paciente
                    </th>
                    <th scope="col" className="pb-3 font-medium">
                      Próxima consulta
                    </th>
                    <th scope="col" className="pb-3 font-medium">
                      Medicamentos cadastrados
                    </th>
                    <th scope="col" className="pb-3">
                      <span className="sr-only">Ações</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => {
                    const nextAppointment = getNextAppointment(
                      patient.appointments,
                    );

                    return (
                      <tr key={patient.id} className="border-t border-line">
                        <td className="py-3 pr-4">
                          <Link
                            to={`/app/pacientes/${patient.id}`}
                            className="flex w-fit items-center gap-3 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-action"
                          >
                            <Avatar name={patient.name} tone="soft" />
                            <span className="text-base font-medium text-ink">
                              {patient.name}
                            </span>
                          </Link>
                        </td>
                        <td className="py-3 pr-4 text-base text-ink">
                          {nextAppointment
                            ? formatDate(getAppointmentDate(nextAppointment))
                            : "Não agendada"}
                        </td>
                        <td className="py-3 pr-4 text-base text-ink">
                          {patient.medications.length}
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <SmallButton to={`/app/pacientes/${patient.id}`}>
                              Ver dados
                            </SmallButton>
                            <SmallButton
                              variant="solid"
                              to={`/app/mensagens?paciente=${patient.id}`}
                              label={`Contatar ${patient.name}`}
                            >
                              Contatar
                            </SmallButton>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </GlassCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassCard title="Consultas nos próximos 7 dias">
          {loading ? (
            <p className="text-sm text-ink-soft">Carregando consultas...</p>
          ) : (
            <BarTrendChart
              data={weekData}
              xKey="day"
              yKey="appointments"
              seriesName="Consultas"
              summary={`Consultas nos próximos 7 dias: ${weekData
                .map((item) => `${item.day}, ${item.appointments}`)
                .join("; ")}.`}
            />
          )}
        </GlassCard>

        <GlassCard
          title="Agenda de hoje"
          action={<SmallButton to="/app/agenda">Ver agenda</SmallButton>}
        >
          {loading ? (
            <p className="text-sm text-ink-soft">Carregando agenda...</p>
          ) : todayAppointments.length === 0 ? (
            <EmptyState title="Nenhuma consulta cadastrada para hoje" />
          ) : (
            <ul className="flex flex-col gap-3">
              {todayAppointments.map(({ patient, appointment }) => {
                const date = getAppointmentDate(appointment);

                return (
                  <ListRow
                    key={appointment._id}
                    icon={ClockIcon}
                    title={appointment.data.title || "Consulta"}
                    subtitle={`${patient.name} · ${formatTime(date)}`}
                  />
                );
              })}
            </ul>
          )}
        </GlassCard>
      </div>

      <GlassCard
        title="Registros recentes"
        action={
          <SmallButton to="/app/evolucao-clinica">Ver todos</SmallButton>
        }
      >
        {loading ? (
          <p className="text-sm text-ink-soft">Carregando registros...</p>
        ) : recentObservations.length === 0 ? (
          <EmptyState title="Nenhum registro clínico encontrado" />
        ) : (
          <ul className="flex flex-col gap-3">
            {recentObservations.map(({ patient, observation }) => (
              <ListRow
                key={observation._id}
                icon={MessageIcon}
                title={`${patient.name} · ${observation.data.category || "Observação clínica"}`}
                subtitle={`${formatDate(getObservationDate(observation))} · ${observation.data.notes || "Sem descrição"}`}
              />
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}