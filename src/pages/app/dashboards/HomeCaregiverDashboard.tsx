// import AssistantCard from "../../../components/app/AssistantCard";
import EmptyState from "../../../components/app/EmptyState";
import GlassCard from "../../../components/app/GlassCard";
import ListRow from "../../../components/app/ListRow";
import PageHeader from "../../../components/app/PageHeader";
import StatusBadge from "../../../components/app/StatusBadge";
import { BarTrendChart } from "../../../components/app/charts";
import { CalendarIcon, ExerciseIcon, MedicineIcon, MessageIcon } from "../../../components/ui/icons";
import {
  adherenceWeek,
  dosesToday,
  nextConsultation,
  recordsAll,
  useAppState,
} from "../../../modules/demo/appStore";
import { DEMO_PATIENT, exerciseWeek, longDayLabel, shortDay } from "../../../modules/demo/demoData";

export default function HomeCaregiverDashboard() {
  useAppState();
  const doses = dosesToday("maria");
  const taken = doses.filter((dose) => dose.taken).length;
  const nextDose = doses.find((dose) => !dose.taken);
  const next = nextConsultation("maria");
  const exercise = exerciseWeek().days.find((day) => day.offset === 0)?.exercise;
  const notes = recordsAll().filter((item) => item.patientId === "maria").slice(0, 3);
  const chart = adherenceWeek("maria");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader demo />
      {/* <AssistantCard /> */}

      <GlassCard className="sm:p-8">
        <h2 className="text-xl font-medium text-deep sm:text-2xl">Rotina de {DEMO_PATIENT.firstName} hoje</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[20px] bg-mint-100/70 p-4">
            <p className="text-sm text-ink-soft">Medicamentos</p>
            <p className="mt-1 text-2xl font-semibold text-deep">
              {taken} de {doses.length}
            </p>
            <p className="text-sm text-ink-soft">registrados</p>
          </div>
          <div className="rounded-[20px] bg-mint-100/70 p-4">
            <p className="text-sm text-ink-soft">Exercício de hoje</p>
            <p className="mt-1 text-2xl font-semibold text-deep">{exercise ? exercise.duration : "—"}</p>
            <div className="mt-1">
              <StatusBadge status="info" label={exercise ? "Previsto" : "Sem exercício"} />
            </div>
          </div>
          <div className="rounded-[20px] bg-mint-100/70 p-4">
            <p className="text-sm text-ink-soft">Próxima consulta</p>
            <p className="mt-1 text-2xl font-semibold text-deep">{next ? shortDay(next.date) : "—"}</p>
            <p className="text-sm text-ink-soft">{next ? `às ${next.time}` : "Nenhuma agendada"}</p>
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassCard title="Próximo medicamento">
          {nextDose ? (
            <ul>
              <ListRow icon={MedicineIcon} title={`${nextDose.name} — ${nextDose.time}`} subtitle={nextDose.dose} />
            </ul>
          ) : (
            <EmptyState title="Todos os horários de hoje foram registrados" />
          )}
        </GlassCard>

        <GlassCard title="Próximas atividades">
          <ul className="flex flex-col gap-3">
            {exercise && (
              <ListRow
                icon={ExerciseIcon}
                title={exercise.title}
                subtitle={`${exercise.duration} · recomendado pela Dra. Marina`}
              />
            )}
            {next && (
              <ListRow
                icon={CalendarIcon}
                title="Consulta com Dra. Marina"
                subtitle={longDayLabel(next.date, next.time)}
              />
            )}
            {!exercise && !next && <EmptyState title="Nada previsto" />}
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
                <ListRow key={note.id} icon={MessageIcon} title={note.text} subtitle={`${note.author} · ${note.when}`} />
              ))}
            </ul>
          )}
        </GlassCard>

        <GlassCard title="Medicamentos na semana">
          <BarTrendChart
            data={chart}
            xKey="day"
            yKey="medications"
            seriesName="Registrados"
            height={200}
            summary={`Medicamentos de ${DEMO_PATIENT.firstName} registrados nos últimos 7 dias: ${chart
              .map((item) => `${item.day}, ${item.medications}`)
              .join("; ")}.`}
          />
        </GlassCard>
      </div>
    </div>
  );
}