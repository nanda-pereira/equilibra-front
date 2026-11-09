
import type { PatientMedicationsData } from "./patients";

export type TodayMedicationDose = {
  key: string;
  medicationName: string;
  dose: number | string;
  unit: string;
  scheduledTime: string;
  taken: boolean;
  state: "taken" | "pending" | "scheduled";
};

function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDate(value?: string | null): Date | null {
  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function timeKey(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
}

export function getTodayMedicationSchedule(
  data: PatientMedicationsData | null,
  now = new Date(),
): TodayMedicationDose[] {
  if (!data) return [];

  const todayKey = dateKey(now);
  const medications = new Map(
    data.medications.map((item) => [item._id, item]),
  );

  const logs = data.medicationLogs.filter(
    (log) => log.status.toUpperCase() !== "CANCELLED",
  );

  const doses: TodayMedicationDose[] = [];

  for (const prescription of data.prescriptions) {
    if (prescription.status.toUpperCase() !== "ACTIVE") continue;

    const prescriptionData = prescription.data;
    const startsAt = parseDate(prescriptionData.startsAt);
    const endsAt = parseDate(prescriptionData.endsAt);

    if (startsAt && todayKey < dateKey(startsAt)) continue;
    if (endsAt && todayKey > dateKey(endsAt)) continue;

    const medication = medications.get(prescriptionData.medicationId);

    const scheduledTimes = [
      ...new Set(prescriptionData.schedule ?? []),
    ].filter((time) =>
      /^([01]\d|2[0-3]):[0-5]\d$/.test(time),
    );

    for (const scheduledTime of scheduledTimes) {
      const matchingLog = logs.find((log) => {
        if (log.data.prescriptionId !== prescription._id) {
          return false;
        }

        const value = log.data.scheduledAt ?? log.scheduledAt;
        const scheduledAt = parseDate(value);

        return (
          scheduledAt !== null &&
          dateKey(scheduledAt) === todayKey &&
          timeKey(scheduledAt) === scheduledTime
        );
      });

      const taken = Boolean(matchingLog?.data.administeredAt);

      const [hours, minutes] = scheduledTime.split(":").map(Number);
      const scheduledDate = new Date(now);
      scheduledDate.setHours(hours, minutes, 0, 0);

      doses.push({
        key: `${prescription._id}-${scheduledTime}`,
        medicationName: medication?.data.name ?? "Medicamento",
        dose: prescriptionData.dose,
        unit: prescriptionData.unit,
        scheduledTime,
        taken,
        state: taken
          ? "taken"
          : scheduledDate < now
            ? "pending"
            : "scheduled",
      });
    }
  }

  return doses.sort((a, b) =>
    a.scheduledTime.localeCompare(b.scheduledTime),
  );
}