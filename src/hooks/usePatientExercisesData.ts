
import { useEffect, useState } from "react";
import {
  getMyPatientExercises,
  type PatientExercisesData,
} from "../services/api/exercises";

export default function usePatientExercisesData(
  accessToken?: string,
  profile?: string,
  userId?: string,
) {
  const [data, setData] = useState<PatientExercisesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadExercises() {
      if (profile !== "paciente") {
        setData(null);
        setError(null);
        setLoading(false);
        return;
      }

      if (!accessToken || !userId) {
        setData(null);
        setError(
          "Não foi possível identificar a sessão do paciente.",
        );
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result = await getMyPatientExercises(
          accessToken,
          userId,
        );

        if (cancelled) return;

        setData(result);

        console.info("Exercícios carregados:", {
          patientId: result.patientId,
          exercises: result.exercises.length,
          plans: result.plans.length,
          logs: result.logs.length,
        });
      } catch (error) {
        if (cancelled) return;

        setData(null);
        setError(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os exercícios.",
        );

        console.error("Erro ao carregar exercícios:", error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadExercises();

    return () => {
      cancelled = true;
    };
  }, [accessToken, profile, userId]);

  return { data, loading, error };
}