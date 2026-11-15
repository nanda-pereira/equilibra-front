
import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router";
import EmptyState from "../../components/app/EmptyState";
import GlassCard from "../../components/app/GlassCard";
import Info from "../../components/app/Info";
import ListRow from "../../components/app/ListRow";
import MedicationsPanel from "../../components/app/MedicationsPanel";
import PageHeader from "../../components/app/PageHeader";
import SmallButton from "../../components/app/SmallButton";
import { CalendarIcon, MessageIcon } from "../../components/ui/icons";
import {
  getPatientById,
  getPatientAppointments,
  getPatientObservations,
  type ObservationData,
  type PatientAppointment,
  type PatientProfile,
  type PatientRecord,
} from "../../services/api/patients";
import { useSession } from "../../modules/session/session";

type PatientItem = {
  id: string;
  name: string;
  email: string;
  birthDate?: string;
  phone?: string;
  diagnosis?: string;
  diagnosisDate?: string;
  stage?: string;
  caregiver?: string;
  notes?: string;
};

type ObservationItem = {
  id: string;
  category: string;
  notes: string;
  createdAt?: string;
};

type PatientProfileWithOptionalFields = PatientProfile & {
  diagnosis?: string;
  stage?: string;
  caregiver?: string;
  clinicalProfile?: PatientProfile["clinicalProfile"] & {
    diagnosis?: string;
    stage?: string;
  };
};

const DATE_FORMAT = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const DATE_TIME_FORMAT = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function getPatientId(patient: PatientProfile): string {
  return patient.id ?? patient._id ?? "";
}

function toPatientItem(
  patient: PatientProfile,
): PatientItem {
  const profile = patient as PatientProfileWithOptionalFields;
  const user = patient.userId;

  const userData =
    typeof user === "object" && user !== null
      ? user
      : undefined;

  const name =
    userData?.fullName?.trim() ||
    userData?.email?.trim() ||
    "Paciente";

  return {
    id: getPatientId(patient),
    name,
    email: userData?.email ?? "",
    birthDate: userData?.dateOfBirth,
    phone: userData?.phone,
    diagnosis:
      profile.diagnosis ??
      profile.clinicalProfile?.diagnosis,
    diagnosisDate: patient.clinicalProfile?.diagnosisDate,
    stage:
      profile.stage ??
      profile.clinicalProfile?.stage,
    caregiver: profile.caregiver,
    notes: patient.clinicalProfile?.followUpNotes,
  };
}

function toObservationItem(
  record: PatientRecord<ObservationData>,
): ObservationItem {
  return {
    id: record._id,
    category: record.data?.category || "Observação",
    notes: record.data?.notes || "",
    createdAt: record.createdAt ?? record.updatedAt,
  };
}

function formatDate(value?: string): string {
  if (!value) return "Não informado";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Não informado";
  }

  return DATE_FORMAT.format(date);
}

function formatDateTime(value?: string): string {
  if (!value) return "Data não informada";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data não informada";
  }

  return DATE_TIME_FORMAT.format(date);
}

export default function PatientDetailPage() {
  const { session } = useSession();
  const { patientId = "" } = useParams();

  const [patient, setPatient] = useState<PatientItem | null>(null);
  const [appointments, setAppointments] = useState<
    PatientAppointment[]
  >([]);
  const [observations, setObservations] = useState<
    ObservationItem[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState("");

  const accessToken = session?.accessToken;
  const profile = session?.profile;
  const canEdit = profile === "medico";

  useEffect(() => {
    let cancelled = false;

    async function loadPatientDetails() {
      if (
        !accessToken ||
        (profile !== "medico" &&
          profile !== "cuidador-clinico") ||
        !patientId
      ) {
        setPatient(null);
        setAppointments([]);
        setObservations([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      setPatient(null);
      setAppointments([]);
      setObservations([]);

      try {
        const selected = await getPatientById(
          accessToken,
          patientId,
        );

        if (cancelled) return;

        const patientItem = toPatientItem(selected);

        if (!patientItem.id) {
          throw new Error(
            "O cadastro retornado não possui um identificador válido.",
          );
        }

        const [
          appointmentResults,
          observationResults,
        ] = await Promise.all([
          getPatientAppointments(accessToken, patientId),
          getPatientObservations(accessToken, patientId),
        ]);

        if (cancelled) return;

        setCurrentTime(Date.now());
        setPatient(patientItem);

        setAppointments(
          [...appointmentResults].sort((a, b) => {
            const dateA = a.data?.scheduledAt
              ? new Date(a.data.scheduledAt).getTime()
              : 0;
            const dateB = b.data?.scheduledAt
              ? new Date(b.data.scheduledAt).getTime()
              : 0;

            return dateA - dateB;
          }),
        );

        setObservations(
          observationResults
            .map(toObservationItem)
            .sort((a, b) => {
              const dateA = a.createdAt
                ? new Date(a.createdAt).getTime()
                : 0;
              const dateB = b.createdAt
                ? new Date(b.createdAt).getTime()
                : 0;

              return dateB - dateA;
            })
            .slice(0, 5),
        );
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Não foi possível carregar os dados do paciente.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadPatientDetails();

    return () => {
      cancelled = true;
    };
  }, [accessToken, profile, patientId]);

  if (!session) return null;

  if (
    session.profile !== "medico" &&
    session.profile !== "cuidador-clinico"
  ) {
    return <Navigate to="/app/inicio" replace />;
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Paciente"
          subtitle="Carregando cadastro"
        />

        <GlassCard>
          <p className="text-sm text-ink-soft">
            Carregando dados do paciente...
          </p>
        </GlassCard>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Paciente" />

        {error && (
          <p
            role="alert"
            className="rounded-[20px] bg-alert-bg px-4 py-3 text-sm text-alert-text"
          >
            {error}
          </p>
        )}

        <GlassCard>
          <EmptyState
            title={
              error
                ? "Não foi possível carregar o paciente"
                : "Paciente não encontrado"
            }
            description={
              error
                ? "Verifique a conexão, suas permissões e tente novamente."
                : "O cadastro pode não existir ou você pode não ter acesso a ele."
            }
          />

          <div className="mt-4 flex justify-center">
            <SmallButton to="/app/pacientes">
              Voltar para pacientes
            </SmallButton>
          </div>
        </GlassCard>
      </div>
    );
  }

  const upcoming = appointments.filter((item) => {
    const value = item.data?.scheduledAt;

    if (!value || currentTime === 0) {
      return false;
    }

    const date = new Date(value);

    return (
      !Number.isNaN(date.getTime()) &&
      date.getTime() >= currentTime
    );
  });

  const observationItems = observations.filter((item) =>
    item.notes.trim(),
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <SmallButton to="/app/pacientes">
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden="true">←</span>
            Pacientes
          </span>
        </SmallButton>
      </div>

      <PageHeader
        title={patient.name}
        subtitle="Dados cadastrais e acompanhamento clínico"
      >
        <SmallButton
          variant="solid"
          to={`/app/mensagens?paciente=${encodeURIComponent(patientId)}`}
          label={`Contatar ${patient.name}`}
        >
          Contatar
        </SmallButton>
      </PageHeader>

      {error && (
        <p
          role="alert"
          className="rounded-[20px] bg-alert-bg px-4 py-3 text-sm text-alert-text"
        >
          {error}
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassCard title="Dados pessoais">
          <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            <Info label="Nome completo">
              {patient.name}
            </Info>

            <Info label="Data de nascimento">
              {formatDate(patient.birthDate)}
            </Info>

            <Info label="E-mail">
              {patient.email || "Não informado"}
            </Info>

            <Info label="Telefone">
              {patient.phone || "Não informado"}
            </Info>
          </dl>
        </GlassCard>

        <GlassCard title="Acompanhamento clínico">
          <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            <Info label="Diagnóstico">
              {patient.diagnosis || "Não informado"}
            </Info>

            <Info label="Data do diagnóstico">
              {formatDate(patient.diagnosisDate)}
            </Info>

            <Info label="Estágio">
              {patient.stage || "Não informado"}
            </Info>

            <Info label="Cuidador vinculado">
              {patient.caregiver || "Não informado"}
            </Info>
          </dl>
        </GlassCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassCard title="Observações clínicas">
          {patient.notes?.trim() ? (
            <p className="whitespace-pre-wrap text-base text-ink">
              {patient.notes}
            </p>
          ) : (
            <EmptyState
              title="Nenhuma observação clínica registrada"
            />
          )}
        </GlassCard>

        <GlassCard title="Próximas consultas">
          {upcoming.length === 0 ? (
            <EmptyState title="Nenhuma consulta prevista" />
          ) : (
            <ul className="flex flex-col gap-3">
              {upcoming.slice(0, 4).map((item) => (
                <ListRow
                  key={item._id}
                  icon={CalendarIcon}
                  title={item.data?.title || "Consulta"}
                  subtitle={`${formatDateTime(
                    item.data?.scheduledAt,
                  )}${
                    item.data?.location
                      ? ` · ${item.data.location}`
                      : ""
                  }`}
                />
              ))}
            </ul>
          )}
        </GlassCard>
      </div>

      <GlassCard title="Registros de evolução">
        {observationItems.length === 0 ? (
          <EmptyState
            title="Nenhum registro de evolução encontrado"
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {observationItems.map((item) => (
              <ListRow
                key={item.id}
                icon={MessageIcon}
                title={item.category}
                subtitle={`${formatDateTime(
                  item.createdAt,
                )} · ${item.notes}`}
              />
            ))}
          </ul>
        )}
      </GlassCard>

      <MedicationsPanel
        patientId={patientId}
        canConfirm={false}
        prescribe={canEdit}
        authorName={session.name}
      />
    </div>
  );
}
