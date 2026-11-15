import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import type { FormEvent } from "react";
import EmptyState from "../../components/app/EmptyState";
import GlassCard from "../../components/app/GlassCard";
import ListRow from "../../components/app/ListRow";
import PageHeader from "../../components/app/PageHeader";
import SmallButton from "../../components/app/SmallButton";

import Select from "../../components/ui/Select";
import DatePicker from "../../components/ui/DatePicker";
import Icon from "../../components/ui/Icon";
import Input from "../../components/ui/Input";

import {
  CalendarIcon,
  ExerciseIcon,
  MedicineIcon,
  MessageIcon,
} from "../../components/ui/icons";

import { useSession } from "../../modules/session/session";

import {
  getAccessiblePatients,
  getMyPatientAppointments,
  getMyPatientMedications,
  getMyPatientProfileId,
  type PatientAppointment,
  type PatientMedicationsData,
  type PatientProfile,
  type PatientRecord,
} from "../../services/api/patients";

import {
  createPatientExercisePlan,
  getMyPatientExercises,
  getPatientExercises,
  updatePatientExercisePlan,
  type ExerciseRecord,
  type PatientExercisePlanData,
  type PatientExercisesData,
} from "../../services/api/exercises";

const API_URL: string | undefined = import.meta.env.VITE_API_URL;

const styles = {
  input:
    "w-full min-h-14 rounded-2xl border border-[#788685]/60 bg-white px-4 py-3 text-sm text-[#282B2D] outline-none transition placeholder:text-[#586463]/75 focus:border-[#247477] focus:ring-4 focus:ring-[#247477]/10 disabled:cursor-not-allowed disabled:opacity-60",
  mutedPanel:
    "rounded-2xl border border-[#247477]/10 bg-[#F4F9F8] p-4 sm:p-5",
  item:
    "rounded-2xl border border-[#788685]/20 bg-white p-4 transition hover:border-[#247477]/30 sm:p-5",
  eyebrow:
    "mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#247477]",
};

type ClinicalRecordData = {
  title?: string;
  name?: string;
  text?: string;
  notes?: string;
  category?: string;
  recordedAt?: string;
  observedAt?: string;
};

type ClinicalRecord = PatientRecord<ClinicalRecordData>;

type TreatmentPlanData = {
  title?: string;
  description?: string;
  instructions?: string;
  goals?: string[];
  startsAt?: string;
  endsAt?: string;
  status?: string;
};

type TreatmentPlanRecord = PatientRecord<TreatmentPlanData>;

type TreatmentPlanState = {
  medications: PatientMedicationsData | null;
  appointments: PatientAppointment[];
  exercises: PatientExercisesData | null;
  treatmentPlans: TreatmentPlanRecord[];
  clinicalRecords: ClinicalRecord[];
};

type PatientOption = {
  id: string;
  name: string;
};

const initialState: TreatmentPlanState = {
  medications: null,
  appointments: [],
  exercises: null,
  treatmentPlans: [],
  clinicalRecords: [],
};

async function getRecords<T>(
  resource: string,
  patientId: string,
  accessToken: string,
): Promise<T[]> {
  if (!API_URL) {
    throw new Error("A URL da API não está configurada.");
  }

  const response = await fetch(
    `${API_URL}/records/${resource}?patientId=${encodeURIComponent(patientId)}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    },
  );

  const result = await response.json().catch(() => null);

  if (!response.ok || !result?.success) {
    throw new Error(
      result?.error?.message ??
        result?.message ??
        `Não foi possível carregar ${resource}.`,
    );
  }

  return result.data as T[];
}

async function mutateRecord<T>(
  resource: string,
  accessToken: string,
  method: "POST" | "PATCH",
  body: unknown,
  recordId?: string,
): Promise<T> {
  if (!API_URL) {
    throw new Error("A URL da API não está configurada.");
  }

  const path = recordId
    ? `/records/${resource}/${encodeURIComponent(recordId)}`
    : `/records/${resource}`;

  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(
      "Não foi possível conectar ao servidor. Verifique se a API está ativa.",
    );
  }

  const result = await response.json().catch(() => null);

  if (!response.ok || !result?.success) {
    const message = result?.error?.message ?? result?.message;

    throw new Error(
      Array.isArray(message)
        ? message.join(" ")
        : message ?? "Não foi possível salvar o plano.",
    );
  }

  return result.data as T;
}

function formatDate(value?: string | null): string {
  if (!value) return "Data não informada";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Data não informada";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value?: string | null): string {
  if (!value) return "Data não informada";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Data não informada";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getAppointmentDate(
  appointment: PatientAppointment,
): string | undefined {
  return appointment.data.scheduledAt ?? appointment.scheduledAt ?? undefined;
}

function getClinicalRecordTitle(record: ClinicalRecord): string {
  return (
    record.data.title ??
    record.data.category ??
    record.data.name ??
    "Registro clínico"
  );
}

function getClinicalRecordDescription(record: ClinicalRecord): string {
  return record.data.text ?? record.data.notes ?? "Sem descrição registrada.";
}

function getPatientOption(patient: PatientProfile): PatientOption | null {
  const id = patient._id ?? patient.id;

  if (!id) return null;

  const user = patient.userId;

  const name =
    typeof user === "object" && user !== null && "fullName" in user
      ? String(user.fullName ?? "")
      : "";

  return {
    id,
    name: name || "Paciente",
  };
}

function toDateInput(value?: string): string {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 10);
}

function dateInputToIso(value: string): string | undefined {
  if (!value) return undefined;

  return new Date(`${value}T12:00:00`).toISOString();
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
  type = "text",
  required = false,
  min,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  type?: string;
  required?: boolean;
  min?: string;
}) {
  if (type === "date") {
    return (
      <DatePicker
        label={label}
        value={value}
        onChange={onChange}
        min={min}
        required={required}
      />
    );
  }

  if (multiline) {
    return (
      <label className="flex min-w-0 flex-col">
        <span className="mb-2.5 text-base text-ink">
          {label}
          {required && <span className="ml-1 text-action">*</span>}
        </span>

        <textarea
          className="min-h-28 w-full resize-y rounded-[24px] border border-brand bg-transparent px-6 py-4 text-sm text-ink transition-colors placeholder:text-placeholder hover:bg-mint-100/60 focus:border-action focus:bg-white/60 focus:outline-none focus:ring-4 focus:ring-action/15"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          required={required}
          rows={4}
        />
      </label>
    );
  }

  return (
    <Input
      label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      required={required}
      type={type}
      min={min}
      autoComplete="off"
    />
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5">
      {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}

      <h2 className="text-lg font-semibold tracking-tight text-[#123F42] sm:text-xl">
        {title}
      </h2>

      {description && (
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#586463]">
          {description}
        </p>
      )}
    </div>
  );
}

function FeedbackMessage({
  type,
  children,
}: {
  type: "error" | "success";
  children: string;
}) {
  const isError = type === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      className={`rounded-2xl border p-4 text-sm leading-6 ${
        isError
          ? "border-amber-300/70 bg-amber-50 text-amber-950"
          : "border-[#247477]/20 bg-[#F4F9F8] text-[#123F42]"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
            isError ? "bg-amber-200/70" : "bg-[#247477]/10"
          }`}
          aria-hidden="true"
        >
          {isError ? "!" : "✓"}
        </span>

        <p>{children}</p>
      </div>
    </div>
  );
}

function LoadingMessage({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#247477]/10 bg-white/80 p-4">
      <span className="size-5 animate-spin rounded-full border-2 border-[#247477]/20 border-t-[#247477]" />
      <p className="text-sm text-[#586463]">{children}</p>
    </div>
  );
}

function SummaryTile({
  icon,
  label,
  value,
}: {
  icon: typeof CalendarIcon;
  label: string;
  value: number;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-[#247477]/10 bg-white/85 p-4">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#F4F9F8] text-[#247477]">
        <Icon icon={icon} size={21} />
      </span>

      <div className="min-w-0">
        <p className="text-2xl font-semibold leading-tight text-[#123F42]">
          {value}
        </p>
        <p className="mt-1 text-xs leading-5 text-[#586463]">{label}</p>
      </div>
    </div>
  );
}

function DateRange({
  startsAt,
  endsAt,
}: {
  startsAt?: string;
  endsAt?: string;
}) {
  if (!startsAt && !endsAt) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm text-[#586463]">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#F4F9F8] text-[#247477]">
        <Icon icon={CalendarIcon} size={16} />
      </span>

      <span>
        {formatDate(startsAt)} até {formatDate(endsAt)}
      </span>
    </div>
  );
}

function GoalList({ goals }: { goals?: string[] }) {
  if (!goals?.length) return null;

  return (
    <div className="rounded-2xl bg-[#F4F9F8] p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#247477]">
        Objetivos do acompanhamento
      </p>

      <ul className="flex flex-col gap-2">
        {goals.map((goal, index) => (
          <li
            key={`${goal}-${index}`}
            className="flex items-start gap-3 text-sm leading-6 text-[#586463]"
          >
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#247477]" />
            <span>{goal}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProfessionalTreatmentPanel({
  canManage,
}: {
  canManage: boolean;
}) {
  const { session } = useSession();

  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [plans, setPlans] = useState<TreatmentPlanRecord[]>([]);
  const [exercises, setExercises] = useState<PatientExercisesData | null>(null);

  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [editingTreatmentId, setEditingTreatmentId] = useState<string | null>(
    null,
  );
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(
    null,
  );

  const [treatmentTitle, setTreatmentTitle] = useState("");
  const [treatmentDescription, setTreatmentDescription] = useState("");
  const [treatmentGoals, setTreatmentGoals] = useState("");
  const [treatmentStart, setTreatmentStart] = useState("");
  const [treatmentEnd, setTreatmentEnd] = useState("");

  const [exerciseTitle, setExerciseTitle] = useState("");
  const [exerciseIds, setExerciseIds] = useState<string[]>([]);
  const [exerciseSchedule, setExerciseSchedule] = useState("");
  const [exerciseStart, setExerciseStart] = useState("");
  const [exerciseEnd, setExerciseEnd] = useState("");

  const availableExercises = exercises?.exercises ?? [];
  const exercisePlans = exercises?.plans ?? [];

  useEffect(() => {
    let cancelled = false;

    async function loadPatients() {
      if (!session?.accessToken) {
        setLoadingPatients(false);
        return;
      }

      setLoadingPatients(true);
      setError(null);

      try {
        const result = await getAccessiblePatients(session.accessToken);

        if (cancelled) return;

        const options = result
          .map(getPatientOption)
          .filter((patient): patient is PatientOption => patient !== null)
          .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

        setPatients(options);
        setSelectedId("");
      } catch (loadError) {
        if (!cancelled) {
          setPatients([]);
          setSelectedId("");
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Não foi possível carregar os pacientes disponíveis.",
          );
        }
      } finally {
        if (!cancelled) setLoadingPatients(false);
      }
    }

    void loadPatients();

    return () => {
      cancelled = true;
    };
  }, [session?.accessToken]);

  useEffect(() => {
    let cancelled = false;

    async function loadSelectedPatient() {
      if (!session?.accessToken || !selectedId) {
        setPlans([]);
        setExercises(null);
        setLoadingRecords(false);
        return;
      }

      setLoadingRecords(true);
      setError(null);
      setNotice(null);
      setPlans([]);
      setExercises(null);

      try {
        const results = await Promise.allSettled([
          getRecords<TreatmentPlanRecord>(
            "treatment-plans",
            selectedId,
            session.accessToken,
          ),
          getPatientExercises(session.accessToken, selectedId),
        ]);

        if (cancelled) return;

        const [plansResult, exercisesResult] = results;

        if (plansResult.status === "fulfilled") {
          setPlans(plansResult.value);
        }

        if (exercisesResult.status === "fulfilled") {
          setExercises(exercisesResult.value);
        }

        if (results.some((result) => result.status === "rejected")) {
          setError(
            "Algumas informações não puderam ser carregadas. Verifique as permissões de acesso do seu perfil.",
          );
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Não foi possível carregar os dados do paciente.",
          );
        }
      } finally {
        if (!cancelled) setLoadingRecords(false);
      }
    }

    void loadSelectedPatient();

    return () => {
      cancelled = true;
    };
  }, [session?.accessToken, selectedId]);

  function resetTreatmentForm() {
    setEditingTreatmentId(null);
    setTreatmentTitle("");
    setTreatmentDescription("");
    setTreatmentGoals("");
    setTreatmentStart("");
    setTreatmentEnd("");
  }

  function resetExerciseForm() {
    setEditingExerciseId(null);
    setExerciseTitle("");
    setExerciseIds([]);
    setExerciseSchedule("");
    setExerciseStart("");
    setExerciseEnd("");
  }

  function editTreatment(plan: TreatmentPlanRecord) {
    setEditingTreatmentId(plan._id);
    setTreatmentTitle(plan.data.title ?? "");
    setTreatmentDescription(
      plan.data.description ?? plan.data.instructions ?? "",
    );
    setTreatmentGoals(plan.data.goals?.join(", ") ?? "");
    setTreatmentStart(toDateInput(plan.data.startsAt));
    setTreatmentEnd(toDateInput(plan.data.endsAt));
    setNotice(null);
    setError(null);
  }

  function editExercisePlan(plan: ExerciseRecord<PatientExercisePlanData>) {
    setEditingExerciseId(plan._id);
    setExerciseTitle(plan.data.title ?? "");
    setExerciseIds(plan.data.exerciseIds ?? []);
    setExerciseSchedule(plan.data.schedule?.join(", ") ?? "");
    setExerciseStart(toDateInput(plan.data.startsAt));
    setExerciseEnd(toDateInput(plan.data.endsAt));
    setNotice(null);
    setError(null);
  }

  function toggleExercise(exerciseId: string) {
    setExerciseIds((current) =>
      current.includes(exerciseId)
        ? current.filter((id) => id !== exerciseId)
        : [...current, exerciseId],
    );
  }

  async function saveTreatment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canManage || !session?.accessToken || !selectedId) return;

    if (!treatmentTitle.trim()) {
      setError("Informe o título do plano de tratamento.");
      return;
    }

    if (
      treatmentStart &&
      treatmentEnd &&
      new Date(treatmentEnd) < new Date(treatmentStart)
    ) {
      setError(
        "A data de término deve ser igual ou posterior à data de início.",
      );
      return;
    }

    setSaving(true);
    setError(null);
    setNotice(null);

    const data: TreatmentPlanData = {
      title: treatmentTitle.trim(),
      description: treatmentDescription.trim(),
      goals: treatmentGoals
        .split(",")
        .map((goal) => goal.trim())
        .filter(Boolean),
      startsAt: dateInputToIso(treatmentStart),
      endsAt: dateInputToIso(treatmentEnd),
    };

    try {
      if (editingTreatmentId) {
        await mutateRecord<TreatmentPlanRecord>(
          "treatment-plans",
          session.accessToken,
          "PATCH",
          { data },
          editingTreatmentId,
        );
      } else {
        await mutateRecord<TreatmentPlanRecord>(
          "treatment-plans",
          session.accessToken,
          "POST",
          { patientId: selectedId, data },
        );
      }

      const updatedPlans = await getRecords<TreatmentPlanRecord>(
        "treatment-plans",
        selectedId,
        session.accessToken,
      );

      setPlans(updatedPlans);
      resetTreatmentForm();
      setNotice("Plano de tratamento salvo com sucesso.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Não foi possível salvar o plano de tratamento.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function saveExercisePlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canManage || !session?.accessToken || !selectedId) return;

    if (!exerciseTitle.trim()) {
      setError("Informe o título do plano de exercícios.");
      return;
    }

    if (exerciseIds.length === 0) {
      setError("Selecione pelo menos um exercício para o plano.");
      return;
    }

    if (
      exerciseStart &&
      exerciseEnd &&
      new Date(exerciseEnd) < new Date(exerciseStart)
    ) {
      setError(
        "A data de término deve ser igual ou posterior à data de início.",
      );
      return;
    }

    setSaving(true);
    setError(null);
    setNotice(null);

    const data: PatientExercisePlanData = {
      title: exerciseTitle.trim(),
      exerciseIds,
      schedule: exerciseSchedule
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      startsAt: dateInputToIso(exerciseStart),
      endsAt: dateInputToIso(exerciseEnd),
    };

    try {
      if (editingExerciseId) {
        await updatePatientExercisePlan(
          session.accessToken,
          editingExerciseId,
          data,
        );
      } else {
        await createPatientExercisePlan(
          session.accessToken,
          selectedId,
          data,
        );
      }

      const updatedExercises = await getPatientExercises(
        session.accessToken,
        selectedId,
      );

      setExercises(updatedExercises);
      resetExerciseForm();
      setNotice("Plano de exercícios salvo com sucesso.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Não foi possível salvar o plano de exercícios.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Planos de tratamento"
        subtitle={
          canManage
            ? "Organize o acompanhamento, as orientações e os exercícios de cada paciente."
            : "Consulte os planos de cuidado dos pacientes vinculados ao seu perfil."
        }
      />

      <GlassCard title="Paciente">
        {loadingPatients ? (
          <LoadingMessage>Carregando pacientes...</LoadingMessage>
        ) : patients.length === 0 ? (
          <EmptyState title="Nenhum paciente disponível para consulta" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <Select
              label="Selecionar paciente"
              options={patients.map((patient) => ({
                label: patient.name,
                value: patient.id,
              }))}
              value={selectedId}
              placeholder="Selecione um paciente"
              onChange={(event) => {
                setSelectedId(event.target.value);
                resetTreatmentForm();
                resetExerciseForm();
                setError(null);
                setNotice(null);
              }}
            />

            <p className="pb-1 text-sm text-[#586463]">
              {patients.length} paciente(s) disponível(is)
            </p>
          </div>
        )}
      </GlassCard>

      {error && <FeedbackMessage type="error">{error}</FeedbackMessage>}
      {notice && <FeedbackMessage type="success">{notice}</FeedbackMessage>}

      {loadingRecords && (
        <LoadingMessage>Carregando os planos do paciente...</LoadingMessage>
      )}

      {!loadingPatients && patients.length > 0 && !selectedId && (
        <div className={styles.mutedPanel}>
          <div className="flex flex-col items-center gap-3 py-5 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-white text-[#247477]">
              <Icon icon={MessageIcon} size={28} />
            </span>

            <h2 className="text-base font-semibold text-[#123F42]">
              Selecione um paciente
            </h2>

            <p className="max-w-md text-sm leading-6 text-[#586463]">
              Escolha um paciente no campo acima para visualizar os planos de
              tratamento, os exercícios e as opções de gerenciamento.
            </p>
          </div>
        </div>
      )}

      {!loadingPatients && patients.length > 0 && selectedId && (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryTile
              icon={MessageIcon}
              label="Planos de tratamento"
              value={plans.length}
            />

            <SummaryTile
              icon={ExerciseIcon}
              label="Planos de exercícios"
              value={exercisePlans.length}
            />

            <SummaryTile
              icon={CalendarIcon}
              label="Exercícios disponíveis"
              value={availableExercises.length}
            />
          </div>

          <GlassCard title="Planos de tratamento">
            <div className="flex flex-col gap-4">
              {plans.length === 0 ? (
                <EmptyState title="Nenhum plano de tratamento cadastrado" />
              ) : (
                <ul className="flex flex-col gap-3">
                  {plans.map((plan) => (
                    <li key={plan._id} className={styles.item}>
                      <div className="flex flex-col gap-4">
                        <ListRow
                          icon={MessageIcon}
                          title={plan.data.title ?? "Plano de tratamento"}
                          subtitle={
                            plan.data.description ??
                            plan.data.instructions ??
                            "Sem descrição registrada."
                          }
                        />

                        <DateRange
                          startsAt={plan.data.startsAt}
                          endsAt={plan.data.endsAt}
                        />

                        <GoalList goals={plan.data.goals} />

                        {canManage && (
                          <div className="flex justify-end border-t border-[#788685]/15 pt-3">
                            <SmallButton
                              type="button"
                              onClick={() => editTreatment(plan)}
                            >
                              Editar plano
                            </SmallButton>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {canManage && (
                <div className="border-t border-[#788685]/15 pt-5">
                  <SectionHeading
                    eyebrow="Gerenciamento"
                    title={
                      editingTreatmentId
                        ? "Editar plano de tratamento"
                        : "Novo plano de tratamento"
                    }
                    description="Registre as orientações e os objetivos do acompanhamento do paciente."
                  />

                  <form
                    className="flex flex-col gap-4"
                    onSubmit={saveTreatment}
                  >
                    <FormField
                      label="Título do plano"
                      value={treatmentTitle}
                      onChange={setTreatmentTitle}
                      placeholder="Ex.: Acompanhamento motor"
                      required
                    />

                    <FormField
                      label="Descrição e orientações"
                      value={treatmentDescription}
                      onChange={setTreatmentDescription}
                      placeholder="Descreva as orientações do acompanhamento."
                      multiline
                    />

                    <FormField
                      label="Objetivos"
                      value={treatmentGoals}
                      onChange={setTreatmentGoals}
                      placeholder="Separe os objetivos por vírgulas"
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        label="Data de início"
                        value={treatmentStart}
                        onChange={setTreatmentStart}
                        type="date"
                        required
                      />

                      <FormField
                        label="Data de término"
                        value={treatmentEnd}
                        onChange={setTreatmentEnd}
                        type="date"
                        min={treatmentStart || undefined}
                      />
                    </div>

                    <div className="flex flex-wrap justify-end gap-3">
                      {editingTreatmentId && (
                        <SmallButton
                          type="button"
                          onClick={resetTreatmentForm}
                        >
                          Cancelar edição
                        </SmallButton>
                      )}

                      <button
                        type="submit"
                        disabled={saving}
                        className="min-h-12 rounded-full bg-[#247477] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1B5E60] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {saving
                          ? "Salvando..."
                          : editingTreatmentId
                            ? "Salvar alterações"
                            : "Criar plano"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </GlassCard>

          <GlassCard title="Planos de exercícios">
            <div className="flex flex-col gap-4">
              {exercisePlans.length === 0 ? (
                <EmptyState title="Nenhum plano de exercícios cadastrado" />
              ) : (
                <ul className="flex flex-col gap-3">
                  {exercisePlans.map((plan) => (
                    <li key={plan._id} className={styles.item}>
                      <div className="flex flex-col gap-4">
                        <ListRow
                          icon={ExerciseIcon}
                          title={plan.data.title ?? "Plano de exercícios"}
                          subtitle={
                            plan.data.schedule?.join(", ") ||
                            "Frequência não informada"
                          }
                        />

                        <DateRange
                          startsAt={plan.data.startsAt}
                          endsAt={plan.data.endsAt}
                        />

                        {canManage && (
                          <div className="flex justify-end border-t border-[#788685]/15 pt-3">
                            <SmallButton
                              type="button"
                              onClick={() => editExercisePlan(plan)}
                            >
                              Editar plano
                            </SmallButton>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {canManage && (
                <div className="border-t border-[#788685]/15 pt-5">
                  <SectionHeading
                    eyebrow="Gerenciamento"
                    title={
                      editingExerciseId
                        ? "Editar plano de exercícios"
                        : "Novo plano de exercícios"
                    }
                    description="Escolha os exercícios e defina a frequência e o período do plano."
                  />

                  <form
                    className="flex flex-col gap-4"
                    onSubmit={saveExercisePlan}
                  >
                    <FormField
                      label="Título do plano"
                      value={exerciseTitle}
                      onChange={setExerciseTitle}
                      placeholder="Ex.: Rotina de mobilidade"
                      required
                    />

                    <div className="flex flex-col gap-3">
                      <p className="text-sm font-medium text-[#123F42]">
                        Exercícios disponíveis
                        <span className="ml-1 text-[#247477]">*</span>
                      </p>

                      {availableExercises.length === 0 ? (
                        <div className={styles.mutedPanel}>
                          <p className="text-sm leading-6 text-[#586463]">
                            Não há exercícios disponíveis para selecionar
                            neste momento.
                          </p>
                        </div>
                      ) : (
                        <div className="grid gap-3 sm:grid-cols-2">
                          {availableExercises.map((exercise) => {
                            const exerciseId = exercise._id;
                            const selected = exerciseIds.includes(exerciseId);

                            return (
                              <label
                                key={exerciseId}
                                className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                                  selected
                                    ? "border-[#247477]/50 bg-[#F4F9F8]"
                                    : "border-[#788685]/20 bg-white hover:border-[#247477]/30"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={selected}
                                  onChange={() => toggleExercise(exerciseId)}
                                  className="mt-1 size-4 accent-[#247477]"
                                />

                                <span className="min-w-0">
                                  <span className="block text-sm font-semibold text-[#123F42]">
                                    {
                                      exercise.data.name || "Exercício" 
                                    }
                                  </span>

                                  {exercise.data.description && (
                                    <span className="mt-1 block text-sm leading-5 text-[#586463]">
                                      {exercise.data.description}
                                    </span>
                                  )}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      )}

                      <p className="text-xs text-[#586463]">
                        {exerciseIds.length} exercício(s) selecionado(s)
                      </p>
                    </div>

                    <FormField
                      label="Frequência e horários"
                      value={exerciseSchedule}
                      onChange={setExerciseSchedule}
                      placeholder="Ex.: Segunda, quarta e sexta"
                    />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        label="Data de início"
                        value={exerciseStart}
                        onChange={setExerciseStart}
                        type="date"
                        required
                      />

                      <FormField
                        label="Data de término"
                        value={exerciseEnd}
                        onChange={setExerciseEnd}
                        type="date"
                        min={exerciseStart || undefined}
                      />
                    </div>

                    <div className="flex flex-wrap justify-end gap-3">
                      {editingExerciseId && (
                        <SmallButton
                          type="button"
                          onClick={resetExerciseForm}
                        >
                          Cancelar edição
                        </SmallButton>
                      )}

                      <button
                        type="submit"
                        disabled={saving || availableExercises.length === 0}
                        className="min-h-12 rounded-full bg-[#247477] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1B5E60] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {saving
                          ? "Salvando..."
                          : editingExerciseId
                            ? "Salvar alterações"
                            : "Criar plano de exercícios"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </GlassCard>
        </>
      )}

      <p className="text-sm leading-6 text-[#586463]">
        As informações exibidas dependem dos registros disponíveis e das
        permissões de acesso do seu perfil.
      </p>
    </div>
  );
}

export default function TreatmentPlanPage() {
  const { session } = useSession();

  const [state, setState] = useState<TreatmentPlanState>(initialState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);

  const isProfessional =
    session?.profile === "medico" ||
    session?.profile === "cuidador-clinico";

  useEffect(() => {
    let cancelled = false;

    async function loadTreatmentPlan() {
      if (isProfessional) {
        setLoading(false);
        return;
      }

      if (!session?.accessToken || !session.userId) {
        setState(initialState);
        setError(
          session?.accessToken
            ? "Não foi possível identificar o usuário da sessão."
            : null,
        );
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const accessToken = session.accessToken;

        const patientId = await getMyPatientProfileId(
          accessToken,
          session.userId,
        );

        const results = await Promise.allSettled([
          getMyPatientMedications(accessToken, session.userId),
          getMyPatientAppointments(accessToken, session.userId),
          getMyPatientExercises(accessToken, session.userId),
          getRecords<TreatmentPlanRecord>(
            "treatment-plans",
            patientId,
            accessToken,
          ),
          getRecords<ClinicalRecord>("observations", patientId, accessToken),
          getRecords<ClinicalRecord>("diary", patientId, accessToken),
        ]);

        if (cancelled) return;

        setCurrentTime(Date.now());

        const [
          medicationsResult,
          appointmentsResult,
          exercisesResult,
          plansResult,
          observationsResult,
          diaryResult,
        ] = results;

        setState({
          medications:
            medicationsResult.status === "fulfilled"
              ? medicationsResult.value
              : null,
          appointments:
            appointmentsResult.status === "fulfilled"
              ? appointmentsResult.value
              : [],
          exercises:
            exercisesResult.status === "fulfilled"
              ? exercisesResult.value
              : null,
          treatmentPlans:
            plansResult.status === "fulfilled" ? plansResult.value : [],
          clinicalRecords: [
            ...(observationsResult.status === "fulfilled"
              ? observationsResult.value
              : []),
            ...(diaryResult.status === "fulfilled" ? diaryResult.value : []),
          ].sort((a, b) => {
            const dateA = new Date(
              a.data.recordedAt ?? a.data.observedAt ?? a.createdAt ?? 0,
            ).getTime();

            const dateB = new Date(
              b.data.recordedAt ?? b.data.observedAt ?? b.createdAt ?? 0,
            ).getTime();

            return dateB - dateA;
          }),
        });

        if (results.some((result) => result.status === "rejected")) {
          setError(
            "Algumas informações não puderam ser carregadas. Os dados disponíveis continuam visíveis.",
          );
        }
      } catch (loadError) {
        if (cancelled) return;

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Não foi possível carregar o plano de tratamento.",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadTreatmentPlan();

    return () => {
      cancelled = true;
    };
  }, [
    session?.accessToken,
    session?.userId,
    session?.profile,
    isProfessional,
  ]);

  if (!session) return null;

  if (
    session.profile !== "paciente" &&
    session.profile !== "medico" &&
    session.profile !== "cuidador-clinico" &&
    session.profile !== "cuidador-domiciliar"
  ) {
    return <Navigate to="/app/inicio" replace />;
  }

  if (isProfessional) {
    return (
      <ProfessionalTreatmentPanel
        canManage={session.profile === "medico"}
      />
    );
  }

  const medicationData = state.medications;
  const exerciseData = state.exercises;

  const activePrescriptions =
    medicationData?.prescriptions.filter(
      (prescription) => prescription.status.toUpperCase() === "ACTIVE",
    ) ?? [];

  const medicationsById = new Map(
    (medicationData?.medications ?? []).map((medication) => [
      medication._id,
      medication,
    ]),
  );

  const upcomingAppointments = state.appointments
    .filter((appointment) => {
      const value = getAppointmentDate(appointment);

      return (
        value !== undefined &&
        !Number.isNaN(new Date(value).getTime()) &&
        new Date(value).getTime() >= currentTime &&
        appointment.status.toUpperCase() !== "CANCELLED"
      );
    })
    .sort(
      (a, b) =>
        new Date(getAppointmentDate(a) ?? 0).getTime() -
        new Date(getAppointmentDate(b) ?? 0).getTime(),
    )
    .slice(0, 3);

  const activePlans =
    exerciseData?.plans.filter(
      (plan) => plan.status.toUpperCase() === "ACTIVE",
    ) ?? [];

  const recentRecords = state.clinicalRecords.slice(0, 4);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Plano de tratamento"
        subtitle="Consulte os registros e as orientações da sua equipe de saúde."
      />

      {error && <FeedbackMessage type="error">{error}</FeedbackMessage>}

      {loading && (
        <LoadingMessage>
          Carregando informações do seu tratamento...
        </LoadingMessage>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassCard title="Medicamentos">
          {loading && !medicationData ? (
            <LoadingMessage>Carregando medicamentos...</LoadingMessage>
          ) : activePrescriptions.length === 0 ? (
            <EmptyState title="Nenhuma prescrição ativa encontrada" />
          ) : (
            <ul className="flex flex-col gap-3">
              {activePrescriptions.map((prescription) => {
                const medication = medicationsById.get(
                  prescription.data.medicationId,
                );

                return (
                  <li key={prescription._id} className={styles.item}>
                    <ListRow
                      icon={MedicineIcon}
                      title={medication?.data.name ?? "Medicamento"}
                      subtitle={[
                        `${prescription.data.dose} ${prescription.data.unit}`,
                        prescription.data.route,
                        prescription.data.schedule?.join(", "),
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </GlassCard>

        <GlassCard title="Exercícios">
          {loading && !exerciseData ? (
            <LoadingMessage>Carregando exercícios...</LoadingMessage>
          ) : activePlans.length === 0 ? (
            <EmptyState title="Nenhum plano de exercícios ativo" />
          ) : (
            <ul className="flex flex-col gap-3">
              {activePlans.map((plan) => (
                <li key={plan._id} className={styles.item}>
                  <ListRow
                    icon={ExerciseIcon}
                    title={plan.data.title ?? "Plano de exercícios"}
                    subtitle={
                      plan.data.schedule?.join(", ") ||
                      "Frequência não informada"
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </GlassCard>

        <GlassCard title="Próximas consultas">
          {loading ? (
            <LoadingMessage>Carregando consultas...</LoadingMessage>
          ) : upcomingAppointments.length === 0 ? (
            <EmptyState title="Nenhuma consulta futura encontrada" />
          ) : (
            <ul className="flex flex-col gap-3">
              {upcomingAppointments.map((appointment) => (
                <li key={appointment._id} className={styles.item}>
                  <ListRow
                    icon={CalendarIcon}
                    title={appointment.data.title}
                    subtitle={[
                      formatDateTime(getAppointmentDate(appointment)),
                      appointment.data.location,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  />
                </li>
              ))}
            </ul>
          )}
        </GlassCard>

        <GlassCard title="Orientações e registros">
          {loading && state.clinicalRecords.length === 0 ? (
            <LoadingMessage>Carregando registros...</LoadingMessage>
          ) : recentRecords.length === 0 ? (
            <EmptyState title="Nenhuma orientação ou registro encontrado" />
          ) : (
            <ul className="flex flex-col gap-3">
              {recentRecords.map((record) => (
                <li key={record._id} className={styles.item}>
                  <ListRow
                    icon={MessageIcon}
                    title={getClinicalRecordTitle(record)}
                    subtitle={`${formatDate(
                      record.data.recordedAt ??
                        record.data.observedAt ??
                        record.createdAt,
                    )} · ${getClinicalRecordDescription(record)}`}
                  />
                </li>
              ))}
            </ul>
          )}
        </GlassCard>

        <GlassCard title="Orientações do plano">
          {loading && state.treatmentPlans.length === 0 ? (
            <LoadingMessage>Carregando orientações...</LoadingMessage>
          ) : state.treatmentPlans.length === 0 ? (
            <EmptyState title="Nenhum plano de tratamento cadastrado" />
          ) : (
            <ul className="flex flex-col gap-3">
              {state.treatmentPlans.map((plan) => (
                <li key={plan._id} className={styles.item}>
                  <div className="flex flex-col gap-4">
                    <ListRow
                      icon={MessageIcon}
                      title={plan.data.title ?? "Plano de tratamento"}
                      subtitle={
                        plan.data.description ??
                        plan.data.instructions ??
                        plan.data.goals?.join(" · ") ??
                        "Sem orientações adicionais."
                      }
                    />

                    <DateRange
                      startsAt={plan.data.startsAt}
                      endsAt={plan.data.endsAt}
                    />

                    <GoalList goals={plan.data.goals} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>
      </div>

      <p className="text-sm leading-6 text-[#586463]">
        Em caso de dúvida sobre qualquer orientação, converse com a sua equipe
        de saúde.
      </p>
    </div>
  );
}