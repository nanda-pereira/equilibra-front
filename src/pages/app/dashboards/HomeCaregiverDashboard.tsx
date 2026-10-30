import EmptyState from "../../../components/app/EmptyState";
import GlassCard from "../../../components/app/GlassCard";
import ListRow from "../../../components/app/ListRow";
import PageHeader from "../../../components/app/PageHeader";
import StatusBadge from "../../../components/app/StatusBadge";
import { BarTrendChart } from "../../../components/app/charts";
import {
  CalendarIcon,
  ExerciseIcon,
  MedicineIcon,
  MessageIcon,
} from "../../../components/ui/icons";
import {
  DEMO_PATIENT,
  appointment,
  exerciseToday,
  medicationsToday,
  medicationsWeek,
  patientNotes,
} from "../../../modules/demo/demoData";

export default function HomeCaregiverDashboard() {
  const taken = medicationsToday.filter((med) => med.taken).length;
  const nextMed = medicationsToday.find((med) => !med.taken);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader demo />

      <GlassCard className="sm:p-8">
        <h2 className="text-2xl font-medium text-deep">Rotina de {DEMO_PATIENT.firstName} hoje</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[20px] bg-mint-100/70 p-4">
            <p className="text-sm text-ink-soft">Medicamentos</p>
            <p className="mt-1 text-2xl font-semibold text-deep">
              {taken} de {medicationsToday.length}
            </p>
            <p className="text-sm text-ink-soft">registrados</p>
          </div>
          <div className="rounded-[20px] bg-mint-100/70 p-4">
            <p className="text-sm text-ink-soft">Exercício de hoje</p>
            <p className="mt-1 text-2xl font-semibold text-deep">{exerciseToday.duration}</p>
            <div className="mt-1">
              <StatusBadge status="info" label="Previsto" />
            </div>
          </div>
          <div className="rounded-[20px] bg-mint-100/70 p-4">
            <p className="text-sm text-ink-soft">Próxima consulta</p>
            <p className="mt-1 text-2xl font-semibold text-deep">{appointment.dayLabel}</p>
            <p className="text-sm text-ink-soft">às {appointment.time}</p>
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassCard title="Próximo medicamento">
          {nextMed ? (
            <ul>
              <ListRow
                icon={MedicineIcon}
                title={`${nextMed.name} — ${nextMed.time}`}
                subtitle={nextMed.detail}
              />
            </ul>
          ) : (
            <EmptyState title="Todos os horários de hoje foram registrados" />
          )}
        </GlassCard>

        <GlassCard title="Próximas atividades">
          <ul className="flex flex-col gap-3">
            <ListRow
              icon={ExerciseIcon}
              title={exerciseToday.title}
              subtitle={`${exerciseToday.duration} · recomendado pela Dra. Marina`}
            />
            <ListRow icon={CalendarIcon} title={appointment.title} subtitle={appointment.when} />
          </ul>
        </GlassCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassCard title="Registros recentes">
          <ul className="flex flex-col gap-3">
            {patientNotes.map((note) => (
              <ListRow
                key={note.id}
                icon={MessageIcon}
                title={note.text}
                subtitle={`${note.author} · ${note.when}`}
              />
            ))}
          </ul>
        </GlassCard>

        <GlassCard title="Medicamentos na semana">
          <BarTrendChart
            data={medicationsWeek}
            xKey="day"
            yKey="medications"
            seriesName="Medicamentos registrados"
            height={200}
            summary={`Medicamentos de ${DEMO_PATIENT.firstName} registrados nos últimos 7 dias: ${medicationsWeek
              .map((item) => `${item.day}, ${item.medications} de 3`)
              .join("; ")}.`}
          />
        </GlassCard>
      </div>
    </div>
  );
}