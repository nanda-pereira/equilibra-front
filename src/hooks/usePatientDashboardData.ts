import { useEffect, useState } from "react";
import {
  getMyPatientAppointments,
  getMyPatientMedications,
  type PatientAppointment,
  type PatientMedicationsData,
} from "../services/api/patients";

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

interface UsePatientDashboardDataParams {
  accessToken?: string | null;
  profile?: string | null;
  userId?: string | null;
}

export default function usePatientDashboardData({
  accessToken,
  profile,
  userId,
}: UsePatientDashboardDataParams) {
  const [patientMedications, setPatientMedications] =
    useState<PatientMedicationsData | null>(null);
  const [medicationsLoading, setMedicationsLoading] = useState(true);
  const [medicationsError, setMedicationsError] =
    useState<string | null>(null);

  const [patientAppointments, setPatientAppointments] =
    useState<PatientAppointment[] | null>(null);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [appointmentsError, setAppointmentsError] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPatientData() {
      if (!accessToken || profile !== "paciente" || !userId) {
        setPatientMedications(null);
        setPatientAppointments(null);
        setMedicationsError(null);
        setAppointmentsError(null);
        setMedicationsLoading(false);
        setAppointmentsLoading(false);
        return;
      }

      setMedicationsLoading(true);
      setMedicationsError(null);
      setAppointmentsLoading(true);
      setAppointmentsError(null);

      const [medicationsResult, appointmentsResult] =
        await Promise.allSettled([
          getMyPatientMedications(accessToken, userId ?? ""),
          getMyPatientAppointments(accessToken, userId ?? ""),
        ]);

      if (cancelled) return;

      if (medicationsResult.status === "fulfilled") {
        setPatientMedications(medicationsResult.value);
        setMedicationsError(null);
      } else {
        setPatientMedications(null);
        setMedicationsError(
          getErrorMessage(
            medicationsResult.reason,
            "Não foi possível carregar os medicamentos.",
          ),
        );
      }

      if (appointmentsResult.status === "fulfilled") {
        setPatientAppointments(appointmentsResult.value);
        setAppointmentsError(null);
      } else {
        setPatientAppointments(null);
        setAppointmentsError(
          getErrorMessage(
            appointmentsResult.reason,
            "Não foi possível carregar a agenda.",
          ),
        );
      }

      setMedicationsLoading(false);
      setAppointmentsLoading(false);
    }

    void loadPatientData();

    return () => {
      cancelled = true;
    };
  }, [accessToken, profile, userId]);

  return {
    patientMedications,
    medicationsLoading,
    medicationsError,
    patientAppointments,
    appointmentsLoading,
    appointmentsError,
  };
}