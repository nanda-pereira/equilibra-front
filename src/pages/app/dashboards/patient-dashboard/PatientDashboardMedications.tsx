
import EmptyState from "../../../../components/app/EmptyState";
import GlassCard from "../../../../components/app/GlassCard";
import ListRow from "../../../../components/app/ListRow";
import { MedicineIcon } from "../../../../components/ui/icons";
import type { PatientMedicationsData } from "../../../../services/api/patients";

type PatientDashboardMedicationsProps = {
  loading: boolean;
  error: string | null;
  activePrescriptions: PatientMedicationsData["prescriptions"];
  medications: PatientMedicationsData["medications"];
};

export default function PatientDashboardMedications({
  loading,
  error,
  activePrescriptions,
  medications,
}: PatientDashboardMedicationsProps) {
  return (
    <GlassCard title="Medicamentos prescritos">
      {loading ? (
        <p className="text-sm text-ink-soft">
          Carregando seus medicamentos...
        </p>
      ) : error ? (
        <EmptyState
          title="Não foi possível carregar os medicamentos"
          description="Tente atualizar a página. Se o problema continuar, verifique a conexão com o servidor."
        />
      ) : activePrescriptions.length === 0 ? (
        <EmptyState
          title="Nenhuma prescrição cadastrada"
          description="Quando sua equipe registrar uma prescrição no sistema, ela aparecerá aqui."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {activePrescriptions.map((prescription) => {
            const medication = medications.find(
              (item) =>
                item._id === prescription.data.medicationId,
            );

            const dose = prescription.data.dose;
            const unit = prescription.data.unit;
            const schedule = prescription.data.schedule;

            return (
              <ListRow
                key={prescription._id}
                icon={MedicineIcon}
                title={medication?.data.name ?? "Medicamento"}
                subtitle={
                  [
                    dose != null
                      ? `Dose: ${dose}${unit ? ` ${unit}` : ""}`
                      : null,
                    schedule?.length
                      ? `Programação: ${schedule.join(", ")}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" · ") ||
                  "Detalhes da prescrição não informados"
                }
              />
            );
          })}
        </ul>
      )}
    </GlassCard>
  );
}