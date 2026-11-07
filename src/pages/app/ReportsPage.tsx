import { useState } from "react";
import { Navigate } from "react-router";
import EmptyState from "../../components/app/EmptyState";
import GlassCard from "../../components/app/GlassCard";
import ListRow from "../../components/app/ListRow";
import MetricCard from "../../components/app/MetricCard";
import PageHeader from "../../components/app/PageHeader";
import SmallButton from "../../components/app/SmallButton";
import Icon from "../../components/ui/Icon";
import Select from "../../components/ui/Select";
import {
  CalendarIcon,
  DownloadIcon,
  MedicineIcon,
  MessageIcon,
} from "../../components/ui/icons";
import { downloadCsv } from "../../modules/app/csv";
import {
  consultationsAll,
  medicationsFor,
  recordsAll,
  useAppState,
  weekTotals,
} from "../../modules/demo/appStore";
import { PATIENTS_BASE, addDays, shortDay } from "../../modules/demo/demoData";
import { useSession } from "../../modules/session/session";

const PERIODS = [
  { label: "Últimos 7 dias", days: 7 },
  { label: "Últimos 30 dias", days: 30 },
  { label: "Últimos 90 dias", days: 90 },
];

export default function ReportsPage() {
  const { session } = useSession();
  useAppState();
  const [patientNameSel, setPatientNameSel] = useState(PATIENTS_BASE[0].name);
  const [periodLabel, setPeriodLabel] = useState(PERIODS[1].label);

  if (!session) return null;
  if (session.profile !== "medico" && session.profile !== "cuidador-clinico") {
    return <Navigate to="/app/inicio" replace />;
  }

  const patient = PATIENTS_BASE.find((item) => item.name === patientNameSel) ?? PATIENTS_BASE[0];
  const period = PERIODS.find((item) => item.label === periodLabel) ?? PERIODS[1];
  const from = addDays(-period.days);
  from.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const consultations = consultationsAll()
    .filter((item) => item.patientId === patient.id && item.date >= from)
    .sort((a, b) => a.date.getTime() - b.date.getTime() || a.time.localeCompare(b.time));
  const records = recordsAll().filter((item) => item.patientId === patient.id && item.date >= from);
  const meds = medicationsFor(patient.id);
  const adherence = weekTotals(patient.id);
  const status = (date: Date) => (date < today ? "Já ocorreu" : "Agendada");

  function exportCsv() {
    downloadCsv(`relatorio-${patient.id}.csv`, [
      ["Relatório (dados de demonstração)", patient.name, period.label],
      [],
      ["Consultas", "Data", "Horário", "Tipo", "Situação"],
      ...consultations.map((item) => ["", shortDay(item.date), item.time, item.detail, status(item.date)]),
      [],
      ["Registros", "Quando", "Autor", "Texto"],
      ...records.map((item) => ["", item.when, item.author, item.text]),
      [],
      ["Medicamentos", "Dose", "Horários", "Origem"],
      ...meds.map((item) => [
        item.name,
        item.dose,
        item.times.join(", "),
        `${item.source === "prescricao" ? "Prescrito" : "Informado"} por ${item.addedBy}`,
      ]),
      [],
      ["Horários registrados na semana", `${adherence.taken} de ${adherence.total}`],
    ]);
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Relatórios" subtitle="Resumo por paciente e período" demo>
        <SmallButton onClick={exportCsv}>
          <span className="inline-flex items-center gap-2">
            <Icon icon={DownloadIcon} size={18} />
            Exportar CSV
          </span>
        </SmallButton>
      </PageHeader>

      <GlassCard title="Filtros">
        <div className="grid gap-x-6 sm:grid-cols-2">
          <Select
            label="Paciente"
            options={PATIENTS_BASE.map((item) => item.name)}
            value={patientNameSel}
            onChange={(e) => setPatientNameSel(e.target.value)}
          />
          <Select
            label="Período"
            options={PERIODS.map((item) => item.label)}
            value={periodLabel}
            onChange={(e) => setPeriodLabel(e.target.value)}
          />
        </div>
      </GlassCard>

      <div className="grid grid-cols-2 gap-4 sm:gap-6 xl:grid-cols-4">
        <MetricCard icon={CalendarIcon} label="Consultas no período" value={String(consultations.length)} />
        <MetricCard icon={MessageIcon} label="Registros" value={String(records.length)} />
        <MetricCard icon={MedicineIcon} label="Medicamentos em uso" value={String(meds.length)} />
        <MetricCard
          icon={MedicineIcon}
          label="Horários registrados"
          value={`${adherence.taken} de ${adherence.total}`}
          note="na última semana"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassCard title="Consultas">
          {consultations.length === 0 ? (
            <EmptyState title="Nenhuma consulta no período" />
          ) : (
            <ul className="flex flex-col gap-3">
              {consultations.map((item) => (
                <ListRow
                  key={item.id}
                  icon={CalendarIcon}
                  title={`${shortDay(item.date)} · ${item.time}`}
                  subtitle={`${item.detail} · ${status(item.date)}`}
                />
              ))}
            </ul>
          )}
        </GlassCard>

        <GlassCard title="Registros de evolução">
          {records.length === 0 ? (
            <EmptyState title="Nenhum registro no período" />
          ) : (
            <ul className="flex flex-col gap-3">
              {records.map((item) => (
                <ListRow
                  key={item.id}
                  icon={MessageIcon}
                  title={item.text}
                  subtitle={`${item.author} · ${item.when}`}
                />
              ))}
            </ul>
          )}
        </GlassCard>
      </div>

      <p className="text-sm text-ink-soft">
        Os relatórios cobrem no máximo 12 meses. A exportação em PDF ainda não está disponível.
      </p>
    </div>
  );
}