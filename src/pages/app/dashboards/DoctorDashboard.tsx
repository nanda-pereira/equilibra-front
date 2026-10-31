import Avatar from "../../../components/app/Avatar";
import EmptyState from "../../../components/app/EmptyState";
import GlassCard from "../../../components/app/GlassCard";
import ListRow from "../../../components/app/ListRow";
import MetricCard from "../../../components/app/MetricCard";
import PageHeader from "../../../components/app/PageHeader";
import SmallButton from "../../../components/app/SmallButton";
import { BarTrendChart } from "../../../components/app/charts";
import { CalendarIcon, ClockIcon, MessageIcon, PatientsIcon } from "../../../components/ui/icons";
import {
  agendaToday,
  appointmentsNextDays,
  patients,
  recentRecords,
} from "../../../modules/demo/demoData";
import { Link } from "react-router";

export default function DoctorDashboard() {
  const today = agendaToday("medico");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader demo />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
        <MetricCard icon={PatientsIcon} label="Pacientes sob responsabilidade" value={String(patients.length)} />
        <MetricCard icon={CalendarIcon} label="Consultas hoje" value={String(today.length)} />
        <MetricCard icon={MessageIcon} label="Registros recentes" value={String(recentRecords.length)} />
      </div>

      <GlassCard title="Pacientes" action={<SmallButton to="/app/pacientes">Ver todos</SmallButton>}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <caption className="sr-only">Pacientes sob responsabilidade</caption>
            <thead>
              <tr className="text-sm text-ink-soft">
                <th scope="col" className="pb-3 font-medium">Paciente</th>
                <th scope="col" className="pb-3 font-medium">Próxima consulta</th>
                <th scope="col" className="pb-3 font-medium">Medicamentos na semana</th>
                <th scope="col" className="pb-3"><span className="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id} className="border-t border-line">
                                    <td className="py-3 pr-4">
                    <Link
                      to={`/app/pacientes/${patient.id}`}
                      aria-label={`Ver dados de ${patient.name}`}
                      className="flex w-fit items-center gap-3 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-action"
                    >
                      <Avatar name={patient.name} tone="soft" />
                      <div>
                        <p className="text-base font-medium text-ink">{patient.name}</p>
                        <p className="text-sm text-ink-soft">{patient.age} anos</p>
                      </div>
                    </Link>
                  </td>
                  <td className="py-3 pr-4 text-base text-ink">{patient.nextAppointment}</td>
                  <td className="py-3 pr-4 text-base text-ink">
                    {patient.medsWeek.taken} de {patient.medsWeek.total}
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <SmallButton
                        to={`/app/pacientes/${patient.id}`}
                        label={`Ver dados de ${patient.name}`}
                      >
                        Ver dados
                      </SmallButton>
                      <SmallButton
                        variant="solid"
                        to={`/app/mensagens?paciente=${patient.id}`}
                        label={`Contatar ${patient.name}`}
                      >
                        Contatar
                      </SmallButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassCard title="Consultas nos próximos 7 dias">
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

        <GlassCard title="Agenda de hoje" action={<SmallButton to="/app/agenda">Ver agenda</SmallButton>}>
          {today.length === 0 ? (
            <EmptyState title="Nenhuma consulta cadastrada para hoje" />
          ) : (
            <ul className="flex flex-col gap-3">
              {today.map((item) => (
                <ListRow
                  key={item.id}
                  icon={ClockIcon}
                  title={item.title}
                  subtitle={`${item.detail} · ${item.time}`}
                />
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
              icon={MessageIcon}
              title={`${record.patient} · ${record.text}`}
              subtitle={`${record.author} · ${record.when}`}
            />
          ))}
        </ul>
      </GlassCard>
    </div>
  );
}