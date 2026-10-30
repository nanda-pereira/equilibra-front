import { useState } from "react";
import Avatar from "../../../components/app/Avatar";
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
  appointment,
  careNetwork,
  exerciseToday,
  exerciseWeek,
  medicationsToday,
  medicationsWeek,
  patientNotes,
} from "../../../modules/demo/demoData";

export default function PatientDashboard() {
  const [meds, setMeds] = useState(medicationsToday);
  const taken = meds.filter((med) => med.taken).length;
  const nextMed = meds.find((med) => !med.taken);
  const week = exerciseWeek();

  function confirmMed(id: string) {
    // simulado: só atualiza a tela; nada é gravado
    setMeds((list) => list.map((med) => (med.id === id ? { ...med, taken: true } : med)));
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader demo />

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
            icon={CalendarIcon}
            label="Próxima consulta"
            value={appointment.dayLabel}
            note={`às ${appointment.time} · Dra. Marina`}
          />
          <MetricCard
            icon={ExerciseIcon}
            label="Exercício de hoje"
            value={exerciseToday.duration}
            note={exerciseToday.title}
          />
          <MetricCard
            icon={CheckCircleIcon}
            label="Exercícios da semana"
            value={`${week.doneBase} de ${week.total}`}
            note="concluídos"
          />
          <MetricCard
            icon={MessageIcon}
            label="Registros recentes"
            value={String(patientNotes.length)}
            note="da sua equipe"
          />
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
            subtitle={`${exerciseToday.duration} · recomendado pela Dra. Marina`}
            trailing={<SmallButton to="/app/exercicios">Ver exercícios</SmallButton>}
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
        <GlassCard title="Medicamentos na semana" description="Registrados por dia (3 por dia)">
          <BarTrendChart
            data={medicationsWeek}
            xKey="day"
            yKey="medications"
            seriesName="Medicamentos registrados"
            summary={`Medicamentos registrados nos últimos 7 dias: ${medicationsWeek
              .map((item) => `${item.day}, ${item.medications} de 3`)
              .join("; ")}.`}
          />
        </GlassCard>

        <GlassCard title="Sua rede de cuidado">
          <ul className="flex flex-col gap-3">
            {careNetwork.map((person) => (
              <li
                key={person.id}
                className="flex items-center gap-4 rounded-[20px] bg-mint-100/70 px-4 py-3"
              >
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