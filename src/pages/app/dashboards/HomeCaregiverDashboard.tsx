import GlassCard from "../../../components/app/GlassCard";
import ListRow from "../../../components/app/ListRow";
import EmptyState from "../../../components/app/EmptyState";
import PageHeader from "../../../components/app/PageHeader";
import StatusBadge from "../../../components/app/StatusBadge";
import { BarTrendChart } from "../../../components/app/charts";
import { AlertIcon, CalendarIcon, ExerciseIcon, InfoIcon, MedicineIcon } from "../../../components/ui/icons";
import {
  DEMO_PATIENT,
  appointment,
  device,
  exerciseToday,
  medicationsToday,
  patients,
  recentEvents,
  stepsWeek,
} from "../../../modules/demo/demoData";

export default function HomeCaregiverDashboard() {
  const patient = patients[0]; // Maria Aparecida (demonstração)
  const nextMed = medicationsToday.find((med) => !med.taken);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader demo />

      <GlassCard className="sm:p-8">
        <h2 className="text-2xl font-medium text-deep">Como está {DEMO_PATIENT.firstName} hoje</h2>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <StatusBadge status={patient.event.status} />
          <p className="text-base text-ink">
            Última atualização: {patient.event.text}, {patient.event.when}.
          </p>
        </div>
        <p className="mt-3 text-sm text-ink-soft">
          Smartwatch {device.connected ? `sincronizado ${device.lastSyncLabel}` : "sem conexão"}.
        </p>
      </GlassCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassCard title="Próximo medicamento">
          {nextMed ? (
            <ul>
              <ListRow icon={MedicineIcon} title={`${nextMed.name} — ${nextMed.time}`} subtitle={nextMed.detail} />
            </ul>
          ) : (
            <EmptyState title="Todos os horários de hoje foram registrados" />
          )}
        </GlassCard>

        <GlassCard title="Próximas atividades">
          <ul className="flex flex-col gap-3">
            <ListRow icon={ExerciseIcon} title={exerciseToday.title} subtitle={exerciseToday.detail} />
            <ListRow icon={CalendarIcon} title={appointment.title} subtitle={appointment.when} />
          </ul>
        </GlassCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassCard title="Alertas recentes">
          <ul className="flex flex-col gap-3">
            {recentEvents.map((event) => (
              <ListRow
                key={event.id}
                icon={event.status === "info" ? InfoIcon : AlertIcon}
                title={event.text}
                subtitle={event.when}
                trailing={<StatusBadge status={event.status} />}
              />
            ))}
          </ul>
        </GlassCard>

        <GlassCard title="Passos na semana">
          <BarTrendChart
            data={stepsWeek}
            xKey="day"
            yKey="steps"
            seriesName="Passos"
            height={200}
            summary={`Passos de ${DEMO_PATIENT.firstName} nos últimos 7 dias: ${stepsWeek
              .map((item) => `${item.day}, ${item.steps}`)
              .join("; ")}.`}
          />
        </GlassCard>
      </div>
    </div>
  );
}