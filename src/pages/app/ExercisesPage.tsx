import { useState } from "react";
import EmptyState from "../../components/app/EmptyState";
import GlassCard from "../../components/app/GlassCard";
import ListRow from "../../components/app/ListRow";
import PageHeader from "../../components/app/PageHeader";
import StatusBadge from "../../components/app/StatusBadge";
import StretchDialog from "../../components/app/StretchDialog";
import StretchIllustration from "../../components/app/StretchIllustration";
import { ExerciseIcon } from "../../components/ui/icons";
import { DISCLAIMER, STRETCHES, type Stretch } from "../../modules/demo/stretches";
import { useSession } from "../../modules/session/session";
import usePatientExercisesData from "../../hooks/usePatientExercisesData";
import ProgressRing from "../../components/app/ProgressRing";

function formatDuration(minutes?: number) {
  if (!minutes || minutes <= 0) return "Duração não informada";
  return `${minutes} min`;
}

function formatDate(value?: string) {
  if (!value) return "Data não informada";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Data não informada";

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

function isWithinCurrentWeek(value?: string) {
  if (!value) return false;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();
  const startOfWeek = new Date(now);
  const dayOfWeek = (now.getDay() + 6) % 7;

  startOfWeek.setDate(now.getDate() - dayOfWeek);
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  return date >= startOfWeek && date < endOfWeek;
}

function StretchCard({
  stretch,
  onOpen,
}: {
  stretch: Stretch;
  onOpen: () => void;
}) {
  return (
    <li className="glass-card flex flex-col rounded-3xl">
      <div className="p-3 pb-0">
        <StretchIllustration
          pose={stretch.pose}
          label={stretch.illustrationLabel}
          className="w-full"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="text-lg font-medium text-deep">{stretch.title}</h3>

        <p className="text-sm text-ink-soft">{stretch.summary}</p>

        <span className="inline-flex w-fit rounded-full bg-mint-100 px-3 py-1 text-sm font-medium text-action-hover">
          {stretch.duration}
        </span>

        <div className="mt-auto pt-1">
          <button
            type="button"
            onClick={onOpen}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-action px-5 py-2 text-sm font-medium text-action transition hover:bg-mint-100"
            aria-label={`Ver passo a passo: ${stretch.title}`}
          >
            Ver passo a passo
          </button>
        </div>
      </div>
    </li>
  );
}

export default function ExercisesPage() {
  const { session } = useSession();

  const { data, loading, error } = usePatientExercisesData(
    session?.accessToken,
    session?.profile,
    session?.userId,
  );

  const [openId, setOpenId] = useState<string | null>(null);
  const exercises =
    data?.exercises.filter(
      (exercise) => exercise.status.toUpperCase() === "ACTIVE",
    ) ?? [];

  const plans =
    data?.plans.filter(
      (plan) => plan.status.toUpperCase() === "ACTIVE",
    ) ?? [];

  const completedLogs =
    data?.logs.filter(
      (log) =>
        log.data.completed === true &&
        isWithinCurrentWeek(
          log.data.performedAt ?? log.scheduledAt ?? log.createdAt,
        ),
    ) ?? [];

  const openStretch = STRETCHES.find((item) => item.id === openId) ?? null;

  if (!session) return null;

  if (session.profile !== "paciente") {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Exercícios"
          subtitle="Acompanhe os exercícios registrados no sistema."
        />
        <EmptyState
          title="Área do paciente"
          description="Esta página exibe o plano individual de exercícios do perfil de paciente."
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Exercícios"
        subtitle="Acompanhe seu plano e os registros de atividade."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <GlassCard title="Meu plano de exercícios">
          {loading ? (
            <p className="text-sm text-ink-soft">
              Carregando seus exercícios...
            </p>
          ) : error ? (
            <EmptyState
              title="Não foi possível carregar os exercícios"
              description={error}
            />
          ) : exercises.length === 0 ? (
            <EmptyState
              title="Nenhum exercício cadastrado"
              description="Quando sua equipe registrar exercícios no sistema, eles aparecerão aqui."
            />
          ) : (
            <ul className="flex flex-col gap-3">
              {exercises.map((exercise) => (
                <ListRow
                  key={exercise._id}
                  icon={ExerciseIcon}
                  title={exercise.data.name}
                  subtitle={`${formatDuration(exercise.data.durationMinutes)}${
                    exercise.data.category
                      ? ` · ${exercise.data.category}`
                      : ""
                  }`}
                />
              ))}
            </ul>
          )}
        </GlassCard>


        <GlassCard title="Progresso da semana">
          {loading ? (
            <p className="text-sm text-ink-soft">
              Calculando seu progresso...
            </p>
          ) : error ? (
            <p className="text-sm text-ink-soft">
              O progresso não está disponível no momento.
            </p>
          ) : (
            <div className="flex flex-col items-center gap-3 text-center">
              <ProgressRing
                value={completedLogs.length}
                label="Exercícios concluídos nesta semana"
              />

              <p className="text-sm font-medium text-deep">
                {completedLogs.length === 1
                  ? "1 exercício concluído nesta semana"
                  : `${completedLogs.length} exercícios concluídos nesta semana`}
              </p>

              <p className="max-w-xs text-sm text-ink-soft">
                {completedLogs.length === 0
                  ? "Seus exercícios concluídos aparecerão aqui ao longo da semana."
                  : "Este total considera os registros marcados como concluídos nesta semana."}
              </p>
            </div>
          )}
        </GlassCard>
      </div>

      <GlassCard
        title="Planos cadastrados"
        description="Planos registrados para seu acompanhamento."
      >
        {loading ? (
          <p className="text-sm text-ink-soft">Carregando seus planos...</p>
        ) : error ? (
          <EmptyState
            title="Planos indisponíveis"
            description={error}
          />
        ) : plans.length === 0 ? (
          <EmptyState
            title="Nenhum plano cadastrado"
            description="Os planos aparecerão aqui quando forem registrados pela equipe."
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {plans.map((plan) => (
              <ListRow
                key={plan._id}
                icon={ExerciseIcon}
                title={plan.data.title}
                subtitle={
                  plan.data.startsAt
                    ? `Início: ${formatDate(plan.data.startsAt)}`
                    : "Plano ativo"
                }
                trailing={
                  <StatusBadge status="stable" label="Ativo" />
                }
              />
            ))}
          </ul>
        )}
      </GlassCard>

      <GlassCard
        title="Histórico de exercícios"
        description="Registros de atividades enviados à plataforma."
      >
        {loading ? (
          <p className="text-sm text-ink-soft">Carregando histórico...</p>
        ) : error ? (
          <EmptyState
            title="Histórico indisponível"
            description={error}
          />
        ) : !data?.logs.length ? (
          <EmptyState
            title="Nenhuma atividade registrada"
            description="Quando houver registros de exercícios, você poderá consultá-los aqui."
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {data.logs.map((log) => (
              <ListRow
                key={log._id}
                icon={ExerciseIcon}
                title={
                  exercises.find(
                    (exercise) => exercise._id === log.data.exerciseId,
                  )?.data.name ?? "Exercício registrado"
                }
                subtitle={`${formatDate(
                  log.data.performedAt ??
                    log.scheduledAt ??
                    log.createdAt,
                )}${
                  log.data.durationMinutes
                    ? ` · ${log.data.durationMinutes} min`
                    : ""
                }`}
                trailing={
                  <StatusBadge
                    status={log.data.completed ? "stable" : "info"}
                    label={log.data.completed ? "Concluído" : "Registrado"}
                  />
                }
              />
            ))}
          </ul>
        )}
      </GlassCard>

      <section aria-labelledby="stretch-guide-title" className="flex flex-col gap-4">
        <div>
          <h2
            id="stretch-guide-title"
            className="text-xl font-medium text-deep"
          >
            Guia de alongamentos
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-ink-soft">
            Movimentos simples, explicados passo a passo. {DISCLAIMER}
          </p>
        </div>

        <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {STRETCHES.map((stretch) => (
            <StretchCard
              key={stretch.id}
              stretch={stretch}
              onOpen={() => setOpenId(stretch.id)}
            />
          ))}
        </ul>
      </section>

      <StretchDialog
        stretch={openStretch}
        onClose={() => setOpenId(null)}
      />
    </div>
  );
}