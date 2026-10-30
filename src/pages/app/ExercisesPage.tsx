import { useState } from "react";
import EmptyState from "../../components/app/EmptyState";
import GlassCard from "../../components/app/GlassCard";
import ListRow from "../../components/app/ListRow";
import PageHeader from "../../components/app/PageHeader";
import ProgressRing from "../../components/app/ProgressRing";
import SmallButton from "../../components/app/SmallButton";
import StatusBadge from "../../components/app/StatusBadge";
import { ExerciseIcon } from "../../components/ui/icons";
import {
  exerciseToday,
  exerciseWeek,
  exercises,
  frequencyLabel,
  type ExerciseDay,
} from "../../modules/demo/demoData";
import { useSession } from "../../modules/session/session";

function DayStatus({ day, doneToday }: { day: ExerciseDay; doneToday: boolean }) {
  if (!day.exercise) return <span className="text-sm text-ink-soft">Sem exercício</span>;
  if (day.offset < 0 || (day.offset === 0 && doneToday)) {
    return <StatusBadge status="stable" label="Feito" />;
  }
  if (day.offset === 0) return <StatusBadge status="info" label="Hoje" />;
  return <StatusBadge status="info" label="Previsto" />;
}

export default function ExercisesPage() {
  const { session } = useSession();
  const [doneToday, setDoneToday] = useState(false);

  if (!session) return null;

  const isPatient = session.profile === "paciente";
  const week = exerciseWeek();
  const done = week.doneBase + (doneToday ? 1 : 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Exercícios"
        subtitle="Orientados pela sua equipe de saúde"
        demo
      />

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
    </div>
  );
}