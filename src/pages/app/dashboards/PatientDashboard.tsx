import { useState } from "react";
import EmptyState from "../../../components/app/EmptyState";
import GlassCard from "../../../components/app/GlassCard";
import ListRow from "../../../components/app/ListRow";
import MetricCard from "../../../components/app/MetricCard";
import PageHeader from "../../../components/app/PageHeader";
import ProgressRing from "../../../components/app/ProgressRing";
import SmallButton from "../../../components/app/SmallButton";
import StatusBadge from "../../../components/app/StatusBadge";
import { BarTrendChart, LineTrendChart } from "../../../components/app/charts";
import {
  ActivityIcon,
  AlertIcon,
  CalendarIcon,
  ExerciseIcon,
  HeartIcon,
  InfoIcon,
  MedicineIcon,
  MoonIcon,
  StepsIcon,
} from "../../../components/ui/icons";
import {
  appointment,
  device,
  exerciseToday,
  heartRateToday,
  medicationsToday,
  metricsToday,
  recentEvents,
  stepsWeek,
} from "../../../modules/demo/demoData";

export default function PatientDashboard() {
  const [meds, setMeds] = useState(medicationsToday);
  const taken = meds.filter((med) => med.taken).length;
  const nextMed = meds.find((med) => !med.taken);
  const hasReadings = device.connected && heartRateToday.length > 0;

  function confirmMed(id: string) {
    // simulado: só atualiza a tela; nada é gravado
    setMeds((list) => list.map((med) => (med.id === id ? { ...med, taken: true } : med)));
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader demo>
        <span className="inline-flex h-8 items-center gap-2 rounded-full bg-mint-100 px-3 text-sm font-medium text-action-hover">
          <span aria-hidden="true" className="size-2 rounded-full bg-action" />
          {device.connected
            ? `Smartwatch conectado · sincronizado ${device.lastSyncLabel}`
            : "Smartwatch sem conexão"}
        </span>
      </PageHeader>

      <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
        <GlassCard title="Medicamentos de hoje">
          <div className="flex flex-col items-center gap-3 text-center">
            <ProgressRing value={taken} max={meds.length} label="Medicamentos registrados hoje" />
            <p className="text-sm text-ink-soft">
              {nextMed
                ? `Próximo: ${nextMed.name} às ${nextMed.time}`
                : "Todos os horários de hoje foram registrados."}
            </p>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
          <MetricCard
            icon={HeartIcon}
            label="Frequência cardíaca"
            value={String(metricsToday.heartRate)}
            unit="bpm"
            note={`Última leitura ${device.lastSyncLabel}`}
          />
          <MetricCard icon={ActivityIcon} label="Tremores" value={metricsToday.tremor} note="Menor que ontem" />
          <MetricCard
            icon={StepsIcon}
            label="Passos hoje"
            value={metricsToday.steps.toLocaleString("pt-BR")}
            note={`Meta: ${metricsToday.stepsGoal.toLocaleString("pt-BR")}`}
          />
          <MetricCard icon={MoonIcon} label="Sono" value={metricsToday.sleep} note="Última noite" />
        </div>
      </div>

      <GlassCard title="Hoje">
        <ul className="flex flex-col gap-3">
          {nextMed && (
            <ListRow
              icon={MedicineIcon}
              title={`${nextMed.name} — ${nextMed.time}`}
              subtitle={nextMed.detail}
              trailing={
                <SmallButton
                  variant="solid"
                  onClick={() => confirmMed(nextMed.id)}
                  label={`Confirmar ${nextMed.name} das ${nextMed.time}`}
                >
                  Confirmar
                </SmallButton>
              }
            />
          )}
          <ListRow
            icon={ExerciseIcon}
            title={exerciseToday.title}
            subtitle={exerciseToday.detail}
            trailing={<StatusBadge status="stable" label="Feito" />}
          />
          <ListRow
            icon={CalendarIcon}
            title={appointment.title}
            subtitle={appointment.when}
            trailing={<SmallButton to="/app/agenda">Ver detalhes</SmallButton>}
          />
        </ul>
      </GlassCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassCard title="Frequência cardíaca hoje" description="Leituras do smartwatch">
          {hasReadings ? (
            <LineTrendChart
              data={heartRateToday}
              xKey="time"
              yKey="bpm"
              seriesName="Frequência cardíaca (bpm)"
              summary={`Frequência cardíaca de hoje: ${heartRateToday
                .map((item) => `${item.time}, ${item.bpm} bpm`)
                .join("; ")}.`}
            />
          ) : (
            <EmptyState
              title="Sem leituras do smartwatch neste período"
              description="Isso não indica ausência de eventos, apenas que o dispositivo não enviou dados."
            />
          )}
        </GlassCard>

        <GlassCard title="Passos na semana" description={`Meta diária: ${metricsToday.stepsGoal.toLocaleString("pt-BR")}`}>
          {hasReadings ? (
            <BarTrendChart
              data={stepsWeek}
              xKey="day"
              yKey="steps"
              seriesName="Passos"
              summary={`Passos nos últimos 7 dias: ${stepsWeek
                .map((item) => `${item.day}, ${item.steps}`)
                .join("; ")}.`}
            />
          ) : (
            <EmptyState title="Sem leituras do smartwatch neste período" />
          )}
        </GlassCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassCard title="Últimos eventos">
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

        <GlassCard title="Plano de tratamento">
          <p className="text-base text-ink-soft">
            Consulte as orientações registradas pela sua equipe de saúde.
          </p>
          <div className="mt-4">
            <SmallButton to="/app/plano-de-tratamento">Ver plano</SmallButton>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}