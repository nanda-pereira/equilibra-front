import Avatar from "../../../components/app/Avatar";
import EmptyState from "../../../components/app/EmptyState";
import GlassCard from "../../../components/app/GlassCard";
import ListRow from "../../../components/app/ListRow";
import PageHeader from "../../../components/app/PageHeader";
import SmallButton from "../../../components/app/SmallButton";
import StatusBadge from "../../../components/app/StatusBadge";
import { EventsChart } from "../../../components/app/charts";
import Icon from "../../../components/ui/Icon";
import { AlertIcon, ExerciseIcon, MedicineIcon } from "../../../components/ui/icons";
import { eventsWeek, patients, pendingExercises, upcomingMeds } from "../../../modules/demo/demoData";

export default function ClinicalCaregiverDashboard() {
  const activeAlerts = patients.filter((patient) => patient.event.status === "alert");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader demo />

      <GlassCard title="Alertas ativos" description="Eventos de nível alto registrados">
        {activeAlerts.length === 0 ? (
          <EmptyState title="Nenhum alerta ativo registrado" />
        ) : (
          <ul className="flex flex-col gap-3">
            {activeAlerts.map((patient) => (
              <li
                key={patient.id}
                className="flex flex-wrap items-center gap-4 rounded-[20px] bg-alert-bg px-4 py-3"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-alert-text">
                  <Icon icon={AlertIcon} size={22} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-medium text-alert-text">
                    {patient.name} · {patient.event.text}
                  </p>
                  <p className="text-sm text-ink">
                    {patient.event.when}. Confirme a situação com o paciente.
                  </p>
                </div>
                <SmallButton to="/app/pacientes" label={`Ver detalhes de ${patient.name}`}>
                  Ver detalhes
                </SmallButton>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>

      <GlassCard title="Pacientes" action={<SmallButton to="/app/pacientes">Ver todos</SmallButton>}>
        <ul className="grid gap-4 sm:grid-cols-2">
          {patients.map((patient) => (
            <li key={patient.id} className="flex flex-col gap-3 rounded-[20px] bg-mint-100/70 p-4">
              <div className="flex items-center gap-3">
                <Avatar name={patient.name} tone="soft" className="bg-white!" />
                <div className="min-w-0 flex-1">
                  <p className="text-base font-medium text-ink">{patient.name}</p>
                  <p className="text-sm text-ink-soft">{patient.age} anos</p>
                </div>
                <StatusBadge status={patient.event.status} />
              </div>
              <p className="text-sm text-ink-soft">
                Última sincronização: {patient.lastSync}
              </p>
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

      <GlassCard title="Eventos por nível na semana" description="Soma dos pacientes vinculados">
        <EventsChart
          data={eventsWeek}
          summary={`Eventos por nível nos últimos 7 dias: ${eventsWeek
            .map((d) => `${d.day}, ${d.stable} estáveis, ${d.attention} de atenção, ${d.alert} de alerta`)
            .join("; ")}.`}
        />
      </GlassCard>
    </div>
  );
}