
import { useEffect, useState } from "react";
import { useSession } from "../../modules/session/session";
import {
  getAccessiblePatients,
  getMyPatientProfileId,
} from "../../services/api/patients";
import {
  getMonitoringHistory,
  getMonitoringSummary,
  type MonitoringRecord,
  type MonitoringSummary,
} from "../../services/api/monitoring";
import GlassCard from "../../components/app/GlassCard";
import PageHeader from "../../components/app/PageHeader";

type PatientOption = {
  id: string;
  name: string;
};

function getName(value: unknown): string {
  if (value && typeof value === "object") {
    const item = value as {
      fullName?: string;
      name?: string;
      email?: string;
    };

    return item.fullName ?? item.name ?? item.email ?? "Paciente";
  }

  return "Paciente";
}

function formatDate(value?: string) {
  if (!value) return "Data não informada";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Data não informada";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function formatSensor(sensorType: string) {
  const labels: Record<string, string> = {
    HEART_RATE: "Frequência cardíaca",
    ACCELEROMETER: "Acelerômetro",
    ACTIVITY: "Atividade",
    STEPS: "Passos",
    SLEEP: "Sono",
    GAIT: "Marcha",
    OTHER: "Outro registro",
  };

  return labels[sensorType] ?? sensorType.replaceAll("_", " ");
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—";

  if (typeof value === "boolean") return value ? "Sim" : "Não";

  if (typeof value === "object") return JSON.stringify(value);

  return String(value);
}

function MetricCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <article className="rounded-2xl border border-line bg-white/75 p-4 sm:p-5">
      <p className="text-sm text-ink-soft">{title}</p>
      <p className="mt-3 break-words text-2xl font-medium text-deep">
        {value}
      </p>
      <p className="mt-2 text-xs leading-5 text-ink-soft">
        {description}
      </p>
    </article>
  );
}

export default function MonitoringPage() {
  const { session } = useSession();
  const isPatient = session?.profile === "paciente";

  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [patientId, setPatientId] = useState("");
  const [summary, setSummary] = useState<MonitoringSummary | null>(null);
  const [records, setRecords] = useState<MonitoringRecord[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPatients() {
      if (!session?.accessToken || !session.userId) {
        setError("Sua sessão não possui as informações necessárias para consultar o monitoramento.");
        setLoadingPatients(false);
        return;
      }

      setLoadingPatients(true);
      setError("");

      try {
        if (isPatient) {
          const ownPatientId = await getMyPatientProfileId(
            session.accessToken,
            session.userId,
          );

          if (!ownPatientId) {
            throw new Error("Não encontramos seu cadastro de paciente.");
          }

          if (!cancelled) {
            setPatients([{ id: ownPatientId, name: session.name || "Meu monitoramento" }]);
            setPatientId(ownPatientId);
          }
        } else {
          const accessible = await getAccessiblePatients(
            session.accessToken,
          );

          const options = accessible
            .map((patient) => ({
              id: patient._id ?? patient.id ?? "",
              name: getName(patient.userId),
            }))
            .filter((patient) => Boolean(patient.id));

          if (!cancelled) {
            setPatients(options);
            setPatientId((current) =>
              current && options.some((item) => item.id === current)
                ? current
                : options[0]?.id ?? "",
            );

            if (options.length === 0) {
              setError("Não encontramos pacientes disponíveis para sua conta.");
            }
          }
        }
      } catch (cause) {
        if (!cancelled) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Não foi possível carregar os pacientes.",
          );
        }
      } finally {
        if (!cancelled) setLoadingPatients(false);
      }
    }

    void loadPatients();

    return () => {
      cancelled = true;
    };
  }, [
    session?.accessToken,
    session?.userId,
    session?.name,
    isPatient,
  ]);

  useEffect(() => {
    let cancelled = false;

    async function loadMonitoring() {
      if (!session?.accessToken || !patientId) {
        setSummary(null);
        setRecords([]);
        return;
      }

      setLoadingData(true);
      setError("");

      try {
        const [nextSummary, nextHistory] = await Promise.all([
          getMonitoringSummary(session.accessToken, patientId),
          getMonitoringHistory(session.accessToken, patientId),
        ]);

        if (!cancelled) {
          setSummary(nextSummary);
          setRecords(nextHistory.items);
        }
      } catch (cause) {
        if (!cancelled) {
          setSummary(null);
          setRecords([]);
          setError(
            cause instanceof Error
              ? cause.message
              : "Não foi possível carregar os dados de monitoramento.",
          );
        }
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    }

    void loadMonitoring();

    return () => {
      cancelled = true;
    };
  }, [session?.accessToken, patientId]);

  if (
    !session ||
    !["paciente", "cuidador-clinico"].includes(session.profile)
  ) {
    return (
      <main className="space-y-5">
        <PageHeader
          title="Monitoramento"
          subtitle="Acompanhamento dos registros de movimento e atividade."
        />
        <GlassCard>
          <p className="text-sm leading-6 text-ink-soft">
            Esta área está disponível para os perfis autorizados.
          </p>
        </GlassCard>
      </main>
    );
  }

  const latestBatch = summary?.latestBatch;
  const latestAnalysis = summary?.latestAnalysis;
  const latestWellbeing = summary?.latestWellbeing;

  return (
    <main className="space-y-5">
      <PageHeader
        title="Monitoramento"
        subtitle="Acompanhe os registros recebidos e o histórico de atividade."
      />

      {error && (
        <div
          role="alert"
          className="rounded-[20px] bg-alert-bg px-4 py-3 text-sm text-alert-text"
        >
          {error}
        </div>
      )}

      {!isPatient && (
        <GlassCard title="Paciente" description="Selecione quem deseja acompanhar.">
          {loadingPatients ? (
            <p className="text-sm text-ink-soft">Carregando pacientes...</p>
          ) : patients.length > 0 ? (
            <select
              aria-label="Selecionar paciente para monitoramento"
              value={patientId}
              onChange={(event) => setPatientId(event.target.value)}
              className="min-h-12 w-full rounded-2xl border border-field-border bg-white px-4 text-sm text-ink outline-none focus:border-action"
            >
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-sm text-ink-soft">
              Nenhum paciente disponível para consulta.
            </p>
          )}
        </GlassCard>
      )}

      <GlassCard
        title="Visão geral"
        description="Resumo dos dados que a API disponibiliza para este paciente."
      >
        {loadingData ? (
          <p className="py-6 text-sm text-ink-soft">
            Carregando informações...
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <MetricCard
              title="Registros nas últimas 24 horas"
              value={String(summary?.recordsLast24Hours ?? 0)}
              description="Quantidade informada pelo serviço de monitoramento."
            />
            <MetricCard
              title="Último lote recebido"
              value={
                latestBatch
                  ? formatDate(latestBatch.createdAt)
                  : "Sem registros"
              }
              description={
                latestBatch?.batchId
                  ? `Lote: ${latestBatch.batchId}`
                  : "Nenhum lote disponível no resumo."
              }
            />
            <MetricCard
              title="Análise mais recente"
              value={latestAnalysis ? "Disponível" : "Não disponível"}
              description={
                latestAnalysis
                  ? "A API retornou uma análise para consulta."
                  : "Ainda não há análise disponível no resumo."
              }
            />
          </div>
        )}
      </GlassCard>

      {(latestAnalysis || latestWellbeing) && !loadingData && (
        <GlassCard
          title="Informações da análise"
          description="Conteúdo retornado pelo backend, sem interpretações clínicas adicionais."
        >
          <div className="grid gap-4 md:grid-cols-2">
            {latestAnalysis && (
              <div className="min-w-0 rounded-2xl bg-white/65 p-4">
                <h3 className="font-medium text-deep">Análise</h3>
                <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words text-xs leading-5 text-ink-soft">
                  {JSON.stringify(latestAnalysis, null, 2)}
                </pre>
              </div>
            )}
            {latestWellbeing && (
              <div className="min-w-0 rounded-2xl bg-white/65 p-4">
                <h3 className="font-medium text-deep">Bem-estar</h3>
                <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words text-xs leading-5 text-ink-soft">
                  {JSON.stringify(latestWellbeing, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </GlassCard>
      )}

      <GlassCard
        title="Histórico de medições"
        description="Registros recebidos dos dispositivos ou outras fontes integradas."
      >
        {loadingData ? (
          <p className="py-6 text-sm text-ink-soft">
            Carregando histórico...
          </p>
        ) : records.length === 0 ? (
          <div className="rounded-2xl bg-white/60 p-6">
            <p className="font-medium text-deep">
              Nenhuma medição disponível
            </p>
            <p className="mt-2 text-sm leading-6 text-ink-soft">
              Quando a API receber registros para este paciente, eles aparecerão aqui. Isso não significa, por si só, que um dispositivo esteja conectado ou transmitindo dados neste momento.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((record, index) => (
              <article
                key={record._id ?? record.recordId ?? `${record.recordedAt}-${index}`}
                className="rounded-2xl border border-line bg-white/65 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-medium text-deep">
                      {formatSensor(record.sensorType)}
                    </h3>
                    <p className="mt-1 text-xs text-ink-soft">
                      {formatDate(record.recordedAt)}
                    </p>
                  </div>
                  {record.unit && (
                    <span className="rounded-full bg-mint-100 px-3 py-1 text-xs text-deep">
                      Unidade: {record.unit}
                    </span>
                  )}
                </div>

                <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(record.measurements ?? {}).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="rounded-xl bg-page px-3 py-2"
                      >
                        <dt className="text-xs text-ink-soft">{key}</dt>
                        <dd className="mt-1 break-words text-sm font-medium text-ink">
                          {formatValue(value)}
                        </dd>
                      </div>
                    ),
                  )}
                </dl>
              </article>
            ))}
          </div>
        )}
      </GlassCard>
    </main>
  );
}