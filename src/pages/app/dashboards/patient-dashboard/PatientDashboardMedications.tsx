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
  const medicationRows = medications.map((medication) => {
    const relatedPrescriptions = activePrescriptions.filter(
      (prescription) =>
        prescription.data.medicationId === medication._id,
    );

    const prescriptionDetails = relatedPrescriptions
      .map((prescription) => {
        const dose =
          prescription.data.dose != null
            ? `Dose: ${prescription.data.dose}${
                prescription.data.unit
                  ? ` ${prescription.data.unit}`
                  : ""
              }`
            : null;

        const schedule = prescription.data.schedule?.length
          ? `Horários: ${prescription.data.schedule.join(", ")}`
          : null;

        return [dose, schedule].filter(Boolean).join(" · ");
      })
      .filter(Boolean);

    return {
      key: medication._id,
      name: medication.data.name || "Medicamento",
      subtitle:
        prescriptionDetails.join(" | ") ||
        medication.data.instructions ||
        "Medicamento cadastrado, sem prescrição ativa.",
    };
  });

  // Mantém visíveis as prescrições cujo medicamento não veio
  // na resposta da API, evitando perder esse registro na interface.
  const unmatchedPrescriptionRows = activePrescriptions
    .filter(
      (prescription) =>
        !medications.some(
          (medication) =>
            medication._id === prescription.data.medicationId,
        ),
    )
    .map((prescription) => ({
      key: `prescription-${prescription._id}`,
      name: "Medicamento prescrito",
      subtitle: [
        prescription.data.dose != null
          ? `Dose: ${prescription.data.dose}${
              prescription.data.unit
                ? ` ${prescription.data.unit}`
                : ""
            }`
          : null,
        prescription.data.schedule?.length
          ? `Horários: ${prescription.data.schedule.join(", ")}`
          : null,
      ]
        .filter(Boolean)
        .join(" · ") || "Detalhes da prescrição não informados",
    }));

  const rows = [...medicationRows, ...unmatchedPrescriptionRows];

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
      ) : rows.length === 0 ? (
        <EmptyState
          title="Nenhum medicamento cadastrado"
          description="Quando sua equipe registrar um medicamento ou uma prescrição no sistema, ele aparecerá aqui."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((item) => (
            <ListRow
              key={item.key}
              icon={MedicineIcon}
              title={item.name}
              subtitle={item.subtitle}
            />
          ))}
        </ul>
      )}
    </GlassCard>
  );
}
