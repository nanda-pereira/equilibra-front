
import { useEffect, useMemo, useState } from "react";
import {
  getMyPatientExercises,
  type PatientExercisesData,
} from "../services/api/exercises";

const EMPTY_EXERCISES: NonNullable<PatientExercisesData["exercises"]> = [];
const EMPTY_PLANS: NonNullable<PatientExercisesData["plans"]> = [];
const EMPTY_LOGS: NonNullable<PatientExercisesData["logs"]> = [];

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

export default function usePatientDashboardExercises(
  accessToken?: string,
  profile?: string,
  userId?: string,
) {
  const [patientExercises, setPatientExercises] =
    useState<PatientExercisesData | null>(null);

  const [exercisesLoading, setExercisesLoading] = useState(true);
  const [exercisesError, setExercisesError] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadExercises() {
      if (profile !== "paciente") {
        setPatientExercises(null);
        setExercisesError(null);
        setExercisesLoading(false);
        return;
      }

      if (!accessToken || !userId) {
        setPatientExercises(null);
        setExercisesError(
          "Não foi possível identificar a sessão do paciente.",
        );
        setExercisesLoading(false);
        return;
      }

      setExercisesLoading(true);
      setExercisesError(null);

      try {
        const result = await getMyPatientExercises(accessToken, userId);

        if (cancelled) return;

        setPatientExercises(result);
      } catch (error) {
        if (cancelled) return;

        setPatientExercises(null);
        setExercisesError(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os exercícios.",
        );
      } finally {
        if (!cancelled) {
          setExercisesLoading(false);
        }
      }
    }

    void loadExercises();

    return () => {
      cancelled = true;
    };
  }, [accessToken, profile, userId]);

  const exercises = patientExercises?.exercises ?? EMPTY_EXERCISES;

  const exercisePlans = patientExercises?.plans ?? EMPTY_PLANS;

  const exerciseLogs = patientExercises?.logs ?? EMPTY_LOGS;

  const todayExerciseLogs = useMemo(
    () =>
      exerciseLogs
        .filter((log) => isToday(log.data.performedAt))
        .sort((a, b) => {
          const dateA = new Date(a.data.performedAt ?? "").getTime();
          const dateB = new Date(b.data.performedAt ?? "").getTime();

          return dateB - dateA;
        }),
    [exerciseLogs],
  );

  const weekExerciseLogs = useMemo(() => {
    const now = new Date();
    const start = new Date(now);

    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    return exerciseLogs.filter((log) => {
      const value = log.data.performedAt;

      if (!value) return false;

      const date = new Date(value);

      return (
        !Number.isNaN(date.getTime()) &&
        date >= start &&
        date <= now
      );
    });
  }, [exerciseLogs]);

  const completedWeekExercises = useMemo(
    () =>
      weekExerciseLogs.filter(
        (log) => log.data.completed === true,
      ).length,
    [weekExerciseLogs],
  );

  const todayExercise = todayExerciseLogs[0] ?? null;

  const todayExerciseDetails = todayExercise
    ? exercises.find(
        (item) => item._id === todayExercise.data.exerciseId,
      )
    : undefined;

  const activePlans = useMemo(() => {
    const now = new Date();

    return exercisePlans.filter((plan) => {
      if (plan.status.toUpperCase() !== "ACTIVE") {
        return false;
      }

      const startsAt = plan.data.startsAt;
      const endsAt = plan.data.endsAt;

      if (startsAt) {
        const startDate = new Date(startsAt);

        if (
          Number.isNaN(startDate.getTime()) ||
          startDate > now
        ) {
          return false;
        }
      }

      if (endsAt) {
        const endDate = new Date(endsAt);

        if (Number.isNaN(endDate.getTime())) {
          return false;
        }

        // Se a data não tiver horário, considera o dia inteiro.
        if (/^\d{4}-\d{2}-\d{2}$/.test(endsAt)) {
          endDate.setHours(23, 59, 59, 999);
        }

        if (endDate < now) {
          return false;
        }
      }

      return true;
    });
  }, [exercisePlans]);

  return {
    patientExercises,
    exercises,
    exercisePlans,
    exerciseLogs,
    todayExerciseLogs,
    weekExerciseLogs,
    completedWeekExercises,
    todayExercise,
    todayExerciseDetails,
    activePlans,
    exercisesLoading,
    exercisesError,
  };
}