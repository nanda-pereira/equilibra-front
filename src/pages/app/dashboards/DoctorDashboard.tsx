import EmptyState from "../../../components/app/EmptyState";
import Avatar from "../../../components/app/Avatar";
import GlassCard from "../../../components/app/GlassCard";
import ListRow from "../../../components/app/ListRow";
import MetricCard from "../../../components/app/MetricCard";
import PageHeader from "../../../components/app/PageHeader";
import SmallButton from "../../../components/app/SmallButton";
import StatusBadge from "../../../components/app/StatusBadge";
import { EventsChart } from "../../../components/app/charts";
import { AlertIcon, CalendarIcon, ClockIcon, PatientsIcon } from "../../../components/ui/icons";
import { doctorAgenda, eventsWeek, patients, recentRecords } from "../../../modules/demo/demoData";

export default function DoctorDashboard() {
  const highLevel = patients.filter((patient) => patient.event.status === "alert").length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader demo />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
        <MetricCard icon={PatientsIcon} label="Pacientes sob responsabilidade" value={String(patients.length)} />
        <MetricCard icon={CalendarIcon} label="Consultas hoje" value={String(doctorAgenda.length)} />
        <MetricCard
          icon={AlertIcon}
          label="Pacientes com evento de nível alto"
          value={String(highLevel)}
          note="Pelo último evento registrado"
        />
      </div>

      <GlassCard title="Pacientes" action={<SmallButton to="/app/pacientes">Ver todos</SmallButton>}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <caption className="sr-only">Pacientes sob responsabilidade e último evento de cada um</caption>
            <thead>
              <tr className="text-sm text-ink-soft">
                <th scope="col" className="pb-3 font-medium">Paciente</th>
                <th scope="col" className="pb-3 font-medium">Última sincronização</th>
                <th scope="col" className="pb-3 font-medium">Último evento</th>
                <th scope="col" className="pb-3"><span className="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id} className="border-t border-line">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={patient.name} tone="soft" />
                      <div>
                        <p className="text-base font-medium text-ink">{patient.name}</p>
                        <p className="text-sm text-ink-soft">{patient.age} anos</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-base text-ink">{patient.lastSync}</td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={patient.event.status} />
                      <span className="text-sm text-ink-soft">
                        {patient.event.text} · {patient.event.when}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <SmallButton to="/app/pacientes" label={`Ver ${patient.name}`}>
                      Ver
                    </SmallButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassCard title="Eventos por nível na semana" description="Soma de todos os pacientes">
          <EventsChart
            data={eventsWeek}
            summary={`Eventos por nível nos últimos 7 dias: ${eventsWeek
              .map((d) => `${d.day}, ${d.stable} estáveis, ${d.attention} de atenção, ${d.alert} de alerta`)
              .join("; ")}.`}
          />
        </GlassCard>

        <GlassCard title="Agenda de hoje">
          {doctorAgenda.length === 0 ? (
            <EmptyState title="Nenhuma consulta cadastrada para hoje" />
          ) : (
            <ul className="flex flex-col gap-3">
              {doctorAgenda.map((item) => (
                <ListRow key={item.id} icon={ClockIcon} title={item.patient} subtitle={`Consulta às ${item.time}`} />
              ))}
            </ul>
          )}
        </GlassCard>
      </div>

      <GlassCard title="Registros recentes">
        <ul className="flex flex-col gap-3">
          {recentRecords.map((record) => (
            <ListRow
              key={record.id}
              icon={CalendarIcon}
              title={`${record.patient} · ${record.text}`}
              subtitle={`${record.author} · ${record.when}`}
            />
          ))}
        </ul>
      </GlassCard>
    </div>
  );
}