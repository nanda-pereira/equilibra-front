
import { useMemo } from "react";
import type { PatientMedicationsData } from "../services/api/patients";

interface UsePatientDashboardMedicationSummaryProps {
  patientMedications: PatientMedicationsData | null;
}

function isToday(value?: string | null): boolean {
  if (!value) return false;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export default function usePatientDashboardMedicationSummary({
  patientMedications,
}: UsePatientDashboardMedicationSummaryProps) {
  const medications = patientMedications?.medications ?? [];

  const prescriptions = useMemo(
    () => patientMedications?.prescriptions ?? [],
    [patientMedications?.prescriptions],
  );

  const medicationLogs = useMemo(
    () => patientMedications?.medicationLogs ?? [],
    [patientMedications?.medicationLogs],
  );

  const activePrescriptions = useMemo(
    () =>
      prescriptions.filter(
        (prescription) =>
          prescription.status.toUpperCase() === "ACTIVE",
      ),
    [prescriptions],
  );

  const todayMedicationLogs = useMemo(
    () =>
      medicationLogs.filter((log) => {
        const status = log.status.toUpperCase();

        return (
          isToday(log.data.scheduledAt ?? log.scheduledAt) &&
          !["CANCELLED", "CANCELED", "REJECTED"].includes(status)
        );
      }),
    [medicationLogs],
  );

  const completedToday = useMemo(
    () =>
      todayMedicationLogs.filter((log) => {
        const status = (
          log.data.status ?? log.status
        ).toUpperCase();

        return (
          isToday(log.data.administeredAt) &&
          ["COMPLETED", "ADMINISTERED", "TAKEN"].includes(status)
        );
      }).length,
    [todayMedicationLogs],
  );

  return {
    medications,
    prescriptions,
    medicationLogs,
    activePrescriptions,
    todayMedicationLogs,
    completedToday,
  };
}