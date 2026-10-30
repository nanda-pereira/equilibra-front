import Avatar from "../../../components/app/Avatar";
import GlassCard from "../../../components/app/GlassCard";
import ListRow from "../../../components/app/ListRow";
import PageHeader from "../../../components/app/PageHeader";
import SmallButton from "../../../components/app/SmallButton";
import { BarTrendChart } from "../../../components/app/charts";
import { ExerciseIcon, MedicineIcon, MessageIcon } from "../../../components/ui/icons";
import {
  appointmentsNextDays,
  patients,
  pendingExercises,
  recentRecords,
  upcomingMeds,
} from "../../../modules/demo/demoData";

export default function ClinicalCaregiverDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader demo />

      <GlassCard title="Pacientes vinculados" action={<SmallButton to="/app/pacientes">Ver todos</SmallButton>}>
        <ul className="grid gap-4 sm:grid-cols-2">
          {patients.map((patient) => (
            <li key={patient.id} className="flex flex-col gap-3 rounded-[20px] bg-mint-100/70 p-4">
              <div className="flex items-center gap-3">
                <Avatar name={patient.name} tone="soft" className="bg-white!" />
                <div className="min-w-0 flex-1">
                  <p className="text-base font-medium text-ink">{patient.name}</p>
                  <p className="text-sm text-ink-soft">{patient.age} anos</p>
                </div>
              </div>
              <div className="text-sm text-ink-soft">
                <p>Próxima consulta: {patient.nextAppointment}</p>
                <p>
                  Medicamentos na semana: {patient.medsWeek.taken} de {patient.medsWeek.total}
                </p>
              </div>
              <div>
                <SmallButton to="/app/pacientes" label={`Ver ${patient.name}`}>
                  Ver paciente
                </SmallButton>
              </div>
            </li>
          ))}
        </ul>
      </GlassCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassCard title="Próximos medicamentos">
          <ul className="flex flex-col gap-3">
            {upcomingMeds.map((med) => (
              <ListRow
                key={med.id}
                icon={MedicineIcon}
                title={`${med.patient} · ${med.name}`}
                subtitle={`Horário: ${med.time}`}
              />
            ))}
          </ul>
        </GlassCard>

        <GlassCard title="Exercícios pendentes">
          <ul className="flex flex-col gap-3">
            {pendingExercises.map((exercise) => (
              <ListRow
                key={exercise.id}
                icon={ExerciseIcon}
                title={`${exercise.patient} · ${exercise.title}`}
                subtitle={exercise.detail}
              />
            ))}
          </ul>
        </GlassCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassCard title="Consultas nos próximos 7 dias" description="Pacientes vinculados">
          <BarTrendChart
            data={appointmentsNextDays}
            xKey="day"
            yKey="appointments"
            seriesName="Consultas"
            summary={`Consultas nos próximos 7 dias: ${appointmentsNextDays
              .map((item) => `${item.day}, ${item.appointments}`)
              .join("; ")}.`}
          />
        </GlassCard>

        <GlassCard title="Registros recentes">
          <ul className="flex flex-col gap-3">
            {recentRecords.map((record) => (
              <ListRow
                key={record.id}
                icon={MessageIcon}
                title={`${record.patient} · ${record.text}`}
                subtitle={`${record.author} · ${record.when}`}
              />
            ))}
          </ul>
        </GlassCard>
      </div>
    </div>
  );
}