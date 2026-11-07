import { Navigate } from "react-router";
import EmptyState from "../../components/app/EmptyState";
import GlassCard from "../../components/app/GlassCard";
import ListRow from "../../components/app/ListRow";
import PageHeader from "../../components/app/PageHeader";
import {
  CalendarIcon,
  ExerciseIcon,
  MedicineIcon,
  MessageIcon,
} from "../../components/ui/icons";
import {
  consultationsAll,
  medicationsFor,
  recordsAll,
  useAppState,
} from "../../modules/demo/appStore";
import { exercises, frequencyLabel, longDayLabel } from "../../modules/demo/demoData";
import { useSession } from "../../modules/session/session";

export default function TreatmentPlanPage() {
  const { session } = useSession();
  useAppState();

  if (!session) return null;
  if (session.profile === "medico" || session.profile === "cuidador-clinico") {
    return <Navigate to="/app/inicio" replace />;
  }

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const meds = medicationsFor("maria");
  const consultations = consultationsAll()
    .filter((item) => item.patientId === "maria" && item.date >= start)
    .sort((a, b) => a.date.getTime() - b.date.getTime() || a.time.localeCompare(b.time))
    .slice(0, 3);
  const notes = recordsAll().filter((item) => item.patientId === "maria").slice(0, 4);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Plano de tratamento"
        subtitle="Reúne os registros feitos pela equipe de saúde"
        demo
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassCard title="Medicamentos">
          {meds.length === 0 ? (
            <EmptyState title="Nenhum medicamento cadastrado" />
          ) : (
            <ul className="flex flex-col gap-3">
              {meds.map((med) => (
                <ListRow
                  key={med.id}
                  icon={MedicineIcon}
                  title={med.name}
                  subtitle={`${med.dose} · ${med.times.join(", ")}`}
                />
              ))}
            </ul>
          )}
        </GlassCard>

        <GlassCard title="Exercícios">
          <ul className="flex flex-col gap-3">
            {exercises.map((exercise) => (
              <ListRow
                key={exercise.id}
                icon={ExerciseIcon}
                title={exercise.title}
                subtitle={`${exercise.duration} · ${frequencyLabel(exercise)}`}
              />
            ))}
          </ul>
        </GlassCard>

        <GlassCard title="Próximas consultas">
          {consultations.length === 0 ? (
            <EmptyState title="Nenhuma consulta agendada" />
          ) : (
            <ul className="flex flex-col gap-3">
              {consultations.map((item) => (
                <ListRow
                  key={item.id}
                  icon={CalendarIcon}
                  title="Consulta com Dra. Marina"
                  subtitle={`${longDayLabel(item.date, item.time)} · ${item.detail}`}
                />
              ))}
            </ul>
          )}
        </GlassCard>

        <GlassCard title="Orientações e registros">
          {notes.length === 0 ? (
            <EmptyState title="Nenhum registro ainda" />
          ) : (
            <ul className="flex flex-col gap-3">
              {notes.map((note) => (
                <ListRow
                  key={note.id}
                  icon={MessageIcon}
                  title={note.text}
                  subtitle={`${note.author} · ${note.when}`}
                />
              ))}
            </ul>
          )}
        </GlassCard>
      </div>

      <p className="text-sm text-ink-soft">
        Em caso de dúvida sobre qualquer orientação, converse com a sua equipe de saúde.
      </p>
    </div>
  );
}