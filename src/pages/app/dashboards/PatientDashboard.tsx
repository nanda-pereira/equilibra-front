// import AssistantCard from "../../../components/app/AssistantCard";
import Avatar from "../../../components/app/Avatar";
import EmptyState from "../../../components/app/EmptyState";
import GlassCard from "../../../components/app/GlassCard";
import ListRow from "../../../components/app/ListRow";
import MetricCard from "../../../components/app/MetricCard";
import PageHeader from "../../../components/app/PageHeader";
import ProgressRing from "../../../components/app/ProgressRing";
import SmallButton from "../../../components/app/SmallButton";
import { BarTrendChart } from "../../../components/app/charts";
import {
  CalendarIcon,
  CheckCircleIcon,
  ExerciseIcon,
  MedicineIcon,
  MessageIcon,
} from "../../../components/ui/icons";
import {
  adherenceWeek,
  confirmDose,
  dosesToday,
  nextConsultation,
  recordsAll,
  useAppState,
} from "../../../modules/demo/appStore";
import { careNetwork, exerciseWeek, longDayLabel, shortDay } from "../../../modules/demo/demoData";

export default function PatientDashboard() {
  useAppState();
  const doses = dosesToday("maria");
  const taken = doses.filter((dose) => dose.taken).length;
  const nextDose = doses.find((dose) => !dose.taken);
  const next = nextConsultation("maria");
  const week = exerciseWeek();
  const exercise = week.days.find((day) => day.offset === 0)?.exercise;
  const notes = recordsAll().filter((item) => item.patientId === "maria").slice(0, 3);
  const chart = adherenceWeek("maria");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader demo />
      {/* <AssistantCard /> */}

      <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
        <GlassCard title="Medicamentos de hoje">
          {doses.length === 0 ? (
            <EmptyState title="Nenhum medicamento hoje" />
          ) : (
            <div className="flex flex-col items-center gap-3 text-center">
              <ProgressRing value={taken} max={doses.length} label="Medicamentos registrados hoje" />
              <p className="text-sm text-ink-soft">
                {nextDose
                  ? `Próximo: ${nextDose.name} às ${nextDose.time}`
                  : "Todos os horários de hoje foram registrados."}
              </p>
            </div>
          )}
        </GlassCard>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
          <MetricCard
            icon={CalendarIcon}
            label="Próxima consulta"
            value={next ? shortDay(next.date) : "—"}
            note={next ? `às ${next.time} · Dra. Marina` : "Nenhuma agendada"}
          />
          <MetricCard
            icon={ExerciseIcon}
            label="Exercício de hoje"
            value={exercise ? exercise.duration : "—"}
            note={exercise ? exercise.title : "Sem exercício hoje"}
          />
          <MetricCard
            icon={CheckCircleIcon}
            label="Exercícios da semana"
            value={`${week.doneBase} de ${week.total}`}
            note="concluídos"
          />
          <MetricCard icon={MessageIcon} label="Registros recentes" value={String(notes.length)} note="da sua equipe" />
        </div>
      </div>

      <GlassCard title="Hoje">
        <ul className="flex flex-col gap-3">
          {nextDose && (
            <ListRow
              icon={MedicineIcon}
              title={`${nextDose.name} — ${nextDose.time}`}
              subtitle={nextDose.dose}
              trailing={
                <SmallButton
                  variant="solid"
                  onClick={() => confirmDose(nextDose.medId, nextDose.time)}
                  label={`Confirmar ${nextDose.name} das ${nextDose.time}`}
                >
                  Confirmar
                </SmallButton>
              }
            />
          )}
          {exercise && (
            <ListRow
              icon={ExerciseIcon}
              title={exercise.title}
              subtitle={`${exercise.duration} · recomendado pela Dra. Marina`}
              trailing={<SmallButton to="/app/exercicios">Ver exercícios</SmallButton>}
            />
          )}
          {next && (
            <ListRow
              icon={CalendarIcon}
              title="Consulta com Dra. Marina"
              subtitle={longDayLabel(next.date, next.time)}
              trailing={<SmallButton to="/app/agenda">Ver detalhes</SmallButton>}
            />
          )}
          {!nextDose && !exercise && !next && <EmptyState title="Nada previsto para hoje" />}
        </ul>
      </GlassCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassCard title="Medicamentos na semana" description="Horários registrados por dia">
          <BarTrendChart
            data={chart}
            xKey="day"
            yKey="medications"
            seriesName="Registrados"
            summary={`Medicamentos registrados nos últimos 7 dias: ${chart
              .map((item) => `${item.day}, ${item.medications}`)
              .join("; ")}.`}
          />
        </GlassCard>

        <GlassCard title="Sua rede de cuidado">
          <ul className="flex flex-col gap-3">
            {careNetwork.map((person) => (
              <li key={person.id} className="flex items-center gap-4 rounded-[20px] bg-mint-100/70 px-4 py-3">
                <Avatar name={person.name} tone="soft" className="bg-white!" />
                <div>
                  <p className="text-base font-medium text-ink">{person.name}</p>
                  <p className="text-sm text-ink-soft">{person.role}</p>
                </div>
              </li>
            ))}
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

        <GlassCard title="Plano de tratamento">
          <p className="text-base text-ink-soft">Consulte as orientações registradas pela sua equipe de saúde.</p>
          <div className="mt-4">
            <SmallButton to="/app/plano-de-tratamento">Ver plano</SmallButton>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}