import { useState } from "react";
import GlassCard from "../../components/app/GlassCard";
import MedicationsPanel from "../../components/app/MedicationsPanel";
import PageHeader from "../../components/app/PageHeader";
import PatientFilter from "../../components/app/PatientFilter";
import { BarTrendChart } from "../../components/app/charts";
import { adherenceWeek, useAppState } from "../../modules/demo/appStore";
import { PATIENTS_BASE } from "../../modules/demo/demoData";
import { useSession } from "../../modules/session/session";

export default function MedicationsPage() {
  const { session } = useSession();
  const [selectedId, setSelectedId] = useState(PATIENTS_BASE[0].id);
  useAppState();

  if (!session) return null;

  const picksPatient = session.profile === "medico" || session.profile === "cuidador-clinico";
  const patientId = picksPatient ? selectedId : "maria";
  const chart = adherenceWeek(patientId);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Medicamentos"
        subtitle="Horários e registros do dia"
        demo
      />

      {picksPatient && (
        <GlassCard title="Paciente">
          <PatientFilter value={selectedId} onChange={setSelectedId} label="Escolher paciente" />
        </GlassCard>
      )}

      <MedicationsPanel
        patientId={patientId}
        canConfirm={session.profile === "paciente"}
        prescribe={session.profile === "medico"}
        authorName={session.name}
      />

      <GlassCard title="Medicamentos na semana" description="Horários registrados por dia">
        <BarTrendChart
          data={chart}
          xKey="day"
          yKey="medications"
          seriesName="Registrados"
          summary={`Medicamentos registrados nos últimos 7 dias: ${chart
            .map((item) => `${item.day}, ${item.medications}`)
            .join("; ")}.`}
        />
      </GlassCard>
    </div>
  );
}