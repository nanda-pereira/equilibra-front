
import { useMemo } from "react";
import type { PatientAppointment } from "../services/api/patients";

interface UsePatientDashboardAppointmentsProps {
  patientAppointments: PatientAppointment[] | null;
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

export default function usePatientDashboardAppointments({
  patientAppointments,
}: UsePatientDashboardAppointmentsProps) {
  const upcomingAppointments = useMemo(() => {
    const now = new Date();

    return (patientAppointments ?? [])
      .map((appointment) => ({
        ...appointment,
        dateTime:
          appointment.data.scheduledAt ??
          appointment.scheduledAt ??
          "",
      }))
      .filter((appointment) => {
        const date = new Date(appointment.dateTime);
        const status = appointment.status.toUpperCase();

        return (
          !["CANCELLED", "CANCELED", "REJECTED", "COMPLETED"].includes(status) &&
          appointment.dateTime !== "" &&
          !Number.isNaN(date.getTime()) &&
          date >= now
        );
      })
      .sort(
        (a, b) =>
          new Date(a.dateTime).getTime() -
          new Date(b.dateTime).getTime(),
      );
  }, [patientAppointments]);

  const next = upcomingAppointments[0];

  const nextAppointmentDate = next
    ? new Date(next.dateTime)
    : null;

  const nextAppointmentTime = nextAppointmentDate
    ? nextAppointmentDate.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const nextAppointmentTitle =
    next?.data.title || "Consulta agendada";

  const showTodayAppointment = Boolean(
    next &&
      nextAppointmentDate &&
      isToday(nextAppointmentDate.toISOString()),
  );

  return {
    upcomingAppointments,
    next,
    nextAppointmentDate,
    nextAppointmentTime,
    nextAppointmentTitle,
    showTodayAppointment,
  };
}