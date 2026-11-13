import { useEffect, useMemo, useState } from "react";
import EmptyState from "../../components/app/EmptyState";
import GlassCard from "../../components/app/GlassCard";
import PageHeader from "../../components/app/PageHeader";
import SmallButton from "../../components/app/SmallButton";
import { BarTrendChart } from "../../components/app/charts";
import { useSession } from "../../modules/session/session";
import {
  getMonitoringHistory,
  getMonitoringSummary,
  type MonitoringRecord,
  type MonitoringSummary,
} from "../../services/api/monitoring";
import { getAccessiblePatients, getMyPatientProfileId } from "../../services/api/patients";

type PatientOption = { id: string; name: string };
type Period = "today" | "7d" | "30d";

const PERIODS: { id: Period; label: string }[] = [
  { id: "today", label: "Hoje" },
  { id: "7d", label: "7 dias" },
  { id: "30d", label: "30 dias" },
];

const SENSOR_LABELS: Record<string, string> = {
  HEART_RATE: "Frequência cardíaca",
  ACCELEROMETER: "Acelerômetro",
  ACTIVITY: "Atividade",
  STEPS: "Passos",
  SLEEP: "Sono",
  GAIT: "Marcha",
  OTHER: "Outro registro",
};

const MAIN_SENSORS = ["HEART_RATE", "STEPS", "SLEEP", "ACTIVITY", "GAIT", "ACCELEROMETER"];

const sensorLabel = (type: string) => SENSOR_LABELS[type] ?? type.replaceAll("_", " ");

function getName(value: unknown): string {
  if (value && typeof value === "object") {
    const item = value as { fullName?: string; name?: string; email?: string };
    return item.fullName ?? item.name ?? item.email ?? "Paciente";
  }
  return "Paciente";
}

function toDate(value?: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDateTime(value?: string) {
  const date = toDate(value);
  if (!date) return "Data não informada";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(date);
}

function timeAgo(value?: string) {
  const date = toDate(value);
  if (!date) return "";
  const minutes = Math.round((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return "agora há pouco";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.round(hours / 24);
  return `há ${days} ${days === 1 ? "dia" : "dias"}`;
}

function dayLabel(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" })
    .format(date)
    .replace(".", "");
}

function prettyKey(key: string) {
  const text = key.replace(/_/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (typeof value === "number") return Number.isInteger(value) ? String(value) : value.toFixed(2);
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function periodStart(period: Period) {
  const start = new Date();
  if (period === "today") start.setHours(0, 0, 0, 0);
  else start.setTime(start.getTime() - (period === "7d" ? 7 : 30) * 24 * 60 * 60 * 1000);
  return start;
}

function Pairs({ data }: { data: unknown }) {
  if (data === null || data === undefined) return null;

  if (typeof data !== "object") {
    return <p className="text-2xl font-medium text-deep">{formatValue(data)}</p>;
  }

  const entries = Object.entries(data as Record<string, unknown>);
  if (entries.length === 0) return <p className="text-sm text-ink-soft">Sem detalhes informados.</p>;

  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {entries.map(([key, value]) => (
        <div key={key} className="min-w-0 rounded-xl bg-white/70 px-3 py-2">
          <dt className="text-xs text-ink-soft">{prettyKey(key)}</dt>
          <dd className="mt-0.5 break-words text-sm font-medium text-ink">{formatValue(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

function Technical({ data }: { data: unknown }) {
  return (
    <details className="mt-3">
      <summary className="min-h-11 cursor-pointer py-2 text-sm font-medium text-action">
        Ver dados técnicos
      </summary>
      <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-words rounded-xl bg-page p-3 text-xs leading-5 text-ink-soft">
        {JSON.stringify(data, null, 2)}
      </pre>
    </details>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-2xl bg-mint-100/70 p-4">
      <p className="text-sm text-ink-soft">{label}</p>
      <p className="mt-2 break-words text-2xl font-semibold leading-tight text-deep">{value}</p>
      {note && <p className="mt-1 text-sm text-ink-soft">{note}</p>}
    </div>
  );
}

function Skeleton() {
  return (
    <div aria-hidden="true" className="grid gap-3 sm:grid-cols-3 motion-safe:animate-pulse">
      {[0, 1, 2].map((item) => (
        <div key={item} className="h-28 rounded-2xl bg-mint-100" />
      ))}
    </div>
  );
}

export default function MonitoringPage() {
  const { session } = useSession();
  const isPatient = session?.profile === "paciente";

  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [patientId, setPatientId] = useState("");
  const [summary, setSummary] = useState<MonitoringSummary | null>(null);
  const [records, setRecords] = useState<MonitoringRecord[]>([]);
  const [period, setPeriod] = useState<Period>("7d");
  const [sensorFilter, setSensorFilter] = useState("all");
  const [visible, setVisible] = useState(10);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

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
          const ownPatientId = await getMyPatientProfileId(session.accessToken, session.userId);
          if (!ownPatientId) throw new Error("Não encontramos seu cadastro de paciente.");

          if (!cancelled) {
            setPatients([{ id: ownPatientId, name: session.name || "Meu monitoramento" }]);
            setPatientId(ownPatientId);
          }
        } else {
          const accessible = await getAccessiblePatients(session.accessToken);
          const options = accessible
            .map((patient) => ({ id: patient._id ?? patient.id ?? "", name: getName(patient.userId) }))
            .filter((patient) => Boolean(patient.id));

          if (!cancelled) {
            setPatients(options);
            setPatientId((current) =>
              current && options.some((item) => item.id === current) ? current : (options[0]?.id ?? ""),
            );
            if (options.length === 0) setError("Não encontramos pacientes disponíveis para sua conta.");
          }
        }
      } catch (cause) {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : "Não foi possível carregar os pacientes.");
        }
      } finally {
        if (!cancelled) setLoadingPatients(false);
      }
    }

    void loadPatients();
    return () => {
      cancelled = true;
    };
  }, [session?.accessToken, session?.userId, session?.name, isPatient]);

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
            cause instanceof Error ? cause.message : "Não foi possível carregar os dados de monitoramento.",
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
  }, [session?.accessToken, patientId, reloadKey]);

  /* ---------- dados derivados (filtros aplicados sobre o que a API já devolveu) ---------- */
  const inPeriod = useMemo(() => {
    const start = periodStart(period).getTime();
    return records
      .filter((record) => (toDate(record.recordedAt)?.getTime() ?? 0) >= start)
      .sort((a, b) => (toDate(b.recordedAt)?.getTime() ?? 0) - (toDate(a.recordedAt)?.getTime() ?? 0));
  }, [records, period]);

  const sensorTypes = useMemo(
    () => Array.from(new Set(inPeriod.map((record) => record.sensorType))),
    [inPeriod],
  );

  const filtered = useMemo(
    () => (sensorFilter === "all" ? inPeriod : inPeriod.filter((record) => record.sensorType === sensorFilter)),
    [inPeriod, sensorFilter],
  );

  const bySensor = useMemo(() => {
    const map = new Map<string, MonitoringRecord[]>();
    inPeriod.forEach((record) => map.set(record.sensorType, [...(map.get(record.sensorType) ?? []), record]));
    return map;
  }, [inPeriod]);

  const chartData = useMemo(() => {
    const now = new Date();

    if (period === "today") {
      return Array.from({ length: now.getHours() + 1 }, (_, hour) => ({
        label: `${String(hour).padStart(2, "0")}h`,
        records: filtered.filter((record) => toDate(record.recordedAt)?.getHours() === hour).length,
      }));
    }

    const days = period === "7d" ? 7 : 30;
    return Array.from({ length: days }, (_, index) => {
      const date = new Date();
      date.setDate(now.getDate() - (days - 1 - index));
      return {
        label: dayLabel(date),
        records: filtered.filter((record) => {
          const recorded = toDate(record.recordedAt);
          return Boolean(recorded) && recorded?.toDateString() === date.toDateString();
        }).length,
      };
    });
  }, [filtered, period]);

  const groupedHistory = useMemo(() => {
    const groups: { key: string; label: string; items: MonitoringRecord[] }[] = [];
    filtered.slice(0, visible).forEach((record) => {
      const date = toDate(record.recordedAt);
      const key = date ? date.toDateString() : "sem-data";
      const last = groups[groups.length - 1];
      if (last && last.key === key) last.items.push(record);
      else groups.push({ key, label: date ? dayLabel(date) : "Data não informada", items: [record] });
    });
    return groups;
  }, [filtered, visible]);

  if (!session || !["paciente", "cuidador-clinico"].includes(session.profile)) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Monitoramento" subtitle="Acompanhamento dos registros de movimento e atividade." />
        <GlassCard>
          <EmptyState title="Área indisponível para este perfil" />
        </GlassCard>
      </div>
    );
  }

  const latestBatch = summary?.latestBatch;
  const latestAnalysis = summary?.latestAnalysis;
  const latestWellbeing = summary?.latestWellbeing;
  const lastSync = latestBatch?.createdAt;

  const changePeriod = (next: Period) => {
    setPeriod(next);
    setSensorFilter("all");
    setVisible(10);
  };

  const pill = (active: boolean) =>
    `inline-flex h-11 items-center rounded-full px-5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action ${
      active
        ? "bg-action text-white shadow-[0_8px_20px_rgba(36,116,119,0.25)]"
        : "border border-brand text-action hover:bg-mint-100"
    }`;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Monitoramento"
        subtitle="Registros recebidos e histórico de atividade"
        children={
          <SmallButton onClick={() => setReloadKey((value) => value + 1)}>Atualizar</SmallButton>
        }
      />

      <p className="rounded-[20px] bg-info-bg px-4 py-3 text-sm text-info-text">
        Estes dados são apoio informacional: não são diagnóstico e não substituem a avaliação da equipe de
        saúde. A ausência de registros não significa ausência de sintomas, e pode ter outras causas, como
        bateria, desconexão ou falha de sincronização.
      </p>

      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] bg-alert-bg px-4 py-3 text-sm text-alert-text"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={() => setReloadKey((value) => value + 1)}
            className="min-h-11 rounded-full px-4 font-medium underline underline-offset-4"
          >
            Tentar novamente
          </button>
        </div>
      )}

      <GlassCard title="Filtros">
        <div className="flex flex-col gap-4">
          {!isPatient && (
            <div>
              <p id="patient-filter" className="mb-2 text-sm font-medium text-ink">
                Paciente
              </p>
              {loadingPatients ? (
                <p className="text-sm text-ink-soft">Carregando pacientes…</p>
              ) : patients.length === 0 ? (
                <p className="text-sm text-ink-soft">Nenhum paciente disponível para consulta.</p>
              ) : (
                <div role="group" aria-labelledby="patient-filter" className="flex flex-wrap gap-2.5">
                  {patients.map((patient) => (
                    <button
                      key={patient.id}
                      type="button"
                      aria-pressed={patient.id === patientId}
                      onClick={() => {
                        setPatientId(patient.id);
                        setSensorFilter("all");
                        setVisible(10);
                      }}
                      className={pill(patient.id === patientId)}
                    >
                      {patient.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <p id="period-filter" className="mb-2 text-sm font-medium text-ink">
              Período
            </p>
            <div role="group" aria-labelledby="period-filter" className="flex flex-wrap gap-2.5">
              {PERIODS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={period === item.id}
                  onClick={() => changePeriod(item.id)}
                  className={pill(period === item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard title="Estado da coleta" description="Quando e de onde chegaram os últimos dados">
        {loadingData ? (
          <Skeleton />
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat
              label="Última sincronização"
              value={lastSync ? timeAgo(lastSync) : "Sem registros"}
              note={lastSync ? formatDateTime(lastSync) : "Nenhum lote disponível no resumo."}
            />
            <Stat
              label="Registros nas últimas 24 horas"
              value={String(summary?.recordsLast24Hours ?? 0)}
              note="Informado pelo serviço de monitoramento."
            />
            <Stat
              label={`Registros em ${PERIODS.find((item) => item.id === period)?.label.toLowerCase()}`}
              value={String(inPeriod.length)}
              note="Dentro do que a API devolveu no histórico."
            />
          </div>
        )}
      </GlassCard>

      {!loadingData && !error && inPeriod.length === 0 && (
        <GlassCard>
          <EmptyState
            title="Sem leituras neste período"
            description="Quando o serviço receber registros para este paciente, eles aparecem aqui. Isso não indica, por si só, que um dispositivo esteja conectado ou transmitindo agora, nem que não houve ocorrências."
          />
        </GlassCard>
      )}

      {!loadingData && inPeriod.length > 0 && (
        <>
          <GlassCard title="Medidas recebidas" description="Um cartão por tipo de medida, dentro do período">
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[...MAIN_SENSORS, ...sensorTypes.filter((type) => !MAIN_SENSORS.includes(type))].map((type) => {
                const items = bySensor.get(type) ?? [];
                const latest = items[0];

                return (
                  <li key={type} className="flex flex-col gap-2 rounded-[20px] bg-mint-100/70 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-base font-medium text-ink">{sensorLabel(type)}</p>
                      <span className="rounded-full bg-white px-2.5 py-0.5 text-xs text-action-hover">
                        {items.length} {items.length === 1 ? "registro" : "registros"}
                      </span>
                    </div>

                    {latest ? (
                      <>
                        <p className="text-sm text-ink-soft">
                          Última leitura: {formatDateTime(latest.recordedAt)}
                          {latest.unit ? ` · ${latest.unit}` : ""}
                        </p>
                        <dl className="grid grid-cols-2 gap-2">
                          {Object.entries(latest.measurements ?? {})
                            .slice(0, 4)
                            .map(([key, value]) => (
                              <div key={key} className="min-w-0 rounded-xl bg-white/70 px-3 py-1.5">
                                <dt className="truncate text-xs text-ink-soft">{prettyKey(key)}</dt>
                                <dd className="truncate text-sm font-medium text-ink">{formatValue(value)}</dd>
                              </div>
                            ))}
                        </dl>
                      </>
                    ) : (
                      <p className="text-sm text-ink-soft">Sem dados no período.</p>
                    )}
                  </li>
                );
              })}
            </ul>
          </GlassCard>

          <GlassCard
            title="Registros recebidos"
            description={
              period === "today"
                ? "Quantidade por hora, hoje. Mostra quando chegaram dados, não o valor das medidas."
                : "Quantidade por dia. Mostra quando chegaram dados, não o valor das medidas."
            }
          >
            {sensorTypes.length > 1 && (
              <div role="group" aria-label="Filtrar por tipo de medida" className="mb-4 flex flex-wrap gap-2.5">
                <button type="button" aria-pressed={sensorFilter === "all"} onClick={() => setSensorFilter("all")} className={pill(sensorFilter === "all")}>
                  Todas
                </button>
                {sensorTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    aria-pressed={sensorFilter === type}
                    onClick={() => {
                      setSensorFilter(type);
                      setVisible(10);
                    }}
                    className={pill(sensorFilter === type)}
                  >
                    {sensorLabel(type)}
                  </button>
                ))}
              </div>
            )}

            <BarTrendChart
              data={chartData}
              xKey="label"
              yKey="records"
              seriesName="Registros recebidos"
              summary={`Registros recebidos ${period === "today" ? "por hora hoje" : "por dia"}: ${chartData
                .map((item) => `${item.label}, ${item.records}`)
                .join("; ")}.`}
            />
          </GlassCard>
        </>
      )}

      {!loadingData && (latestAnalysis || latestWellbeing) && (
        <div className="grid gap-6 xl:grid-cols-2">
          {latestAnalysis && (
            <GlassCard
              title="Análise mais recente"
              description="Resumo estatístico e exploratório. Não é diagnóstico e não determina gravidade."
            >
              <Pairs data={latestAnalysis} />
              <Technical data={latestAnalysis} />
            </GlassCard>
          )}

          {latestWellbeing && (
            <GlassCard
              title="Cobertura dos dados"
              description="Indica quanto os dados recebidos sustentam a análise (confiança técnica). Não é uma nota de saúde nem de bem-estar."
            >
              <Pairs data={latestWellbeing} />
              <Technical data={latestWellbeing} />
            </GlassCard>
          )}
        </div>
      )}

      {!loadingData && filtered.length > 0 && (
        <GlassCard title="Histórico de medições" description="Registros recebidos dos dispositivos ou de outras fontes">
          <div className="flex flex-col gap-5">
            {groupedHistory.map((group) => (
              <section key={group.key} aria-label={group.label}>
                <h3 className="mb-2 text-sm font-medium text-action-hover">{group.label}</h3>
                <ul className="flex flex-col gap-3">
                  {group.items.map((record, index) => (
                    <li
                      key={record._id ?? record.recordId ?? `${record.recordedAt}-${index}`}
                      className="rounded-[20px] border border-line bg-white/65 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-base font-medium text-deep">{sensorLabel(record.sensorType)}</p>
                          <p className="text-sm text-ink-soft">{formatDateTime(record.recordedAt)}</p>
                        </div>
                        {record.unit && (
                          <span className="rounded-full bg-mint-100 px-3 py-1 text-xs text-deep">
                            Unidade: {record.unit}
                          </span>
                        )}
                      </div>

                      <dl className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {Object.entries(record.measurements ?? {}).map(([key, value]) => (
                          <div key={key} className="min-w-0 rounded-xl bg-page px-3 py-2">
                            <dt className="text-xs text-ink-soft">{prettyKey(key)}</dt>
                            <dd className="mt-0.5 break-words text-sm font-medium text-ink">
                              {formatValue(value)}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          {filtered.length > visible && (
            <div className="mt-5 flex justify-center">
              <SmallButton onClick={() => setVisible((value) => value + 10)}>
                Mostrar mais ({filtered.length - visible})
              </SmallButton>
            </div>
          )}
        </GlassCard>
      )}
    </div>
  );
}