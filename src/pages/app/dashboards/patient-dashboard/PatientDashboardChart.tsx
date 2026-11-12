import { useMemo } from "react";
import GlassCard from "../../../../components/app/GlassCard";
import { BarTrendChart } from "../../../../components/app/charts";
import type { PatientMedicationsData } from "../../../../services/api/patients";

interface PatientDashboardChartProps {
  medicationLogs: PatientMedicationsData["medicationLogs"];
}

function formatShortDay(date: Date): string {
  const weekday = new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
  })
    .format(date)
    .replace(".", "");

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${weekday}, ${day}/${month}`;
}

export default function PatientDashboardChart({
  medicationLogs,
}: PatientDashboardChartProps) {
  const chart = useMemo(() => {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const start = new Date(today);
    start.setDate(start.getDate() - 6);

    const counts = new Map<number, number>();

    for (let index = 0; index < 7; index++) {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      counts.set(day.getTime(), 0);
    }

  medicationLogs.forEach((log) => {
    const status = (
      log.data.status ?? log.status
    ).toUpperCase();

    const validStatuses = [
      "COMPLETED",
      "ADMINISTERED",
      "TAKEN",
    ];

    if (!validStatuses.includes(status)) return;

    const value = log.data.administeredAt;

    if (!value) return;

    const administeredDate = new Date(value);

    if (Number.isNaN(administeredDate.getTime())) return;

    const day = new Date(administeredDate);
    day.setHours(0, 0, 0, 0);

    const timestamp = day.getTime();

    if (counts.has(timestamp)) {
      counts.set(
        timestamp,
        (counts.get(timestamp) ?? 0) + 1,
      );
    }
  });

    return Array.from(counts.entries()).map(
      ([timestamp, medications]) => ({
        day: formatShortDay(new Date(timestamp)),
        medications,
      }),
    );
  }, [medicationLogs]);

  const summary = `Registros de medicamentos nos últimos 7 dias: ${chart
    .map((item) => `${item.day}, ${item.medications}`)
    .join("; ")}.`;

  return (
    <GlassCard title="Medicamentos na semana">
      <BarTrendChart
        data={chart}
        xKey="day"
        yKey="medications"
        seriesName="Registrados"
        summary={summary}
      />
    </GlassCard>
  );
}