import MetricCard from "../../../../components/app/MetricCard";
import {
  CalendarIcon,
  CheckCircleIcon,
  ExerciseIcon,
  MessageIcon,
} from "../../../../components/ui/icons";

type Metric = {
  value: string;
  note: string;
};

type PatientDashboardMetricsProps = {
  nextAppointment: Metric;
  todayExerciseMetric: Metric;
  weekExercises: Metric;
  recentRecords: Metric;
};

export default function PatientDashboardMetrics({
  nextAppointment,
  todayExerciseMetric,
  weekExercises,
  recentRecords,
}: PatientDashboardMetricsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
      <MetricCard
        icon={CalendarIcon}
        label="Próxima consulta"
        value={nextAppointment.value}
        note={nextAppointment.note}
      />

      <MetricCard
        icon={ExerciseIcon}
        label="Exercício de hoje"
        value={todayExerciseMetric.value}
        note={todayExerciseMetric.note}
      />

      <MetricCard
        icon={CheckCircleIcon}
        label="Exercícios da semana"
        value={weekExercises.value}
        note={weekExercises.note}
      />

      <MetricCard
        icon={MessageIcon}
        label="Registros recentes"
        value={recentRecords.value}
        note={recentRecords.note}
      />
    </div>
  );
}