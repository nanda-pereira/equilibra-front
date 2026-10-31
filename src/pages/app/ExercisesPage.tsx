import { useState } from "react";
import EmptyState from "../../components/app/EmptyState";
import GlassCard from "../../components/app/GlassCard";
import ListRow from "../../components/app/ListRow";
import PageHeader from "../../components/app/PageHeader";
import ProgressRing from "../../components/app/ProgressRing";
import SmallButton from "../../components/app/SmallButton";
import StatusBadge from "../../components/app/StatusBadge";
import StretchDialog from "../../components/app/StretchDialog";
import StretchIllustration from "../../components/app/StretchIllustration";
import { ExerciseIcon } from "../../components/ui/icons";
import {
  exerciseToday,
  exerciseWeek,
  exercises,
  frequencyLabel,
  type ExerciseDay,
} from "../../modules/demo/demoData";
import { DISCLAIMER, STRETCHES, type Stretch } from "../../modules/demo/stretches";
import { useSession } from "../../modules/session/session";

function DayStatus({ day, doneToday }: { day: ExerciseDay; doneToday: boolean }) {
  if (!day.exercise) return <span className="text-sm text-ink-soft">Sem exercício</span>;
  if (day.offset < 0 || (day.offset === 0 && doneToday)) {
    return <StatusBadge status="stable" label="Feito" />;
  }
  if (day.offset === 0) return <StatusBadge status="info" label="Hoje" />;
  return <StatusBadge status="info" label="Previsto" />;
}

function StretchCard({ stretch, onOpen }: { stretch: Stretch; onOpen: () => void }) {
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
          <SmallButton onClick={onOpen} label={`Ver passo a passo: ${stretch.title}`}>
            Ver passo a passo
          </SmallButton>
        </div>
      </div>
    </li>
  );
}

export default function ExercisesPage() {
  const { session } = useSession();
  const [doneToday, setDoneToday] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  if (!session) return null;

  const isPatient = session.profile === "paciente";
  const week = exerciseWeek();
  const done = week.doneBase + (doneToday ? 1 : 0);
  const openStretch = STRETCHES.find((item) => item.id === openId) ?? null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Exercícios" subtitle="Orientados pela sua equipe de saúde" demo />

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <GlassCard title="Hoje">
          {exerciseToday ? (
            <ul>
              <ListRow
                icon={ExerciseIcon}
                title={exerciseToday.title}
                subtitle={`${exerciseToday.duration} · recomendado por ${exerciseToday.prescriber}`}
                trailing={
                  doneToday ? (
                    <StatusBadge status="stable" label="Feito" />
                  ) : isPatient ? (
                    <SmallButton variant="solid" onClick={() => setDoneToday(true)}>
                      Marcar como feito
                    </SmallButton>
                  ) : (
                    <StatusBadge status="info" label="Previsto para hoje" />
                  )
                }
              />
            </ul>
          ) : (
            <EmptyState title="Nenhum exercício previsto para hoje" />
          )}
        </GlassCard>

        <GlassCard title="Progresso da semana">
          <div className="flex flex-col items-center gap-3 text-center">
            <ProgressRing value={done} max={week.total} label="Exercícios concluídos na semana" />
            <p className="text-sm text-ink-soft">exercícios concluídos</p>
          </div>
        </GlassCard>
      </div>

      <GlassCard title="Semana" description="Três dias antes e três depois de hoje">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {week.days.map((day) => (
            <li
              key={day.offset}
              className={`flex flex-col items-center gap-2 rounded-2xl p-3 text-center ${
                day.offset === 0 ? "border-2 border-brand bg-white/70" : "bg-mint-100/60"
              }`}
            >
              <span className="text-sm text-ink-soft">{day.label}</span>
              <span className="text-2xl font-semibold text-deep">{day.day}</span>
              <span className="min-h-5 text-sm text-ink">{day.exercise?.duration}</span>
              <DayStatus day={day} doneToday={doneToday} />
            </li>
          ))}
        </ul>
      </GlassCard>

      <GlassCard title="Rotina de exercícios">
        <ul className="flex flex-col gap-3">
          {exercises.map((exercise) => (
            <ListRow
              key={exercise.id}
              icon={ExerciseIcon}
              title={exercise.title}
              subtitle={`${exercise.duration} · ${frequencyLabel(exercise)} · ${exercise.prescriber}`}
            />
          ))}
        </ul>
      </GlassCard>

      <section aria-labelledby="stretch-guide-title" className="flex flex-col gap-4">
        <div>
          <h2 id="stretch-guide-title" className="text-xl font-medium text-deep">
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

      <StretchDialog stretch={openStretch} onClose={() => setOpenId(null)} />
    </div>
  );
}