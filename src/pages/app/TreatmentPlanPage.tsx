
import { useEffect, useState } from "react";

import EmptyState from "../../components/app/EmptyState";
import GlassCard from "../../components/app/GlassCard";
import ListRow from "../../components/app/ListRow";
import PageHeader from "../../components/app/PageHeader";

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

  const query = `?patientId=${encodeURIComponent(patientId)}`;

  const response = await fetch(
    `${API_URL}/records/${resource}${query}`,
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

  if (Number.isNaN(date.getTime())) {
    return "Data não informada";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value?: string | null): string {
  if (!value) return "Data não informada";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data não informada";
  }

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
  return (
    record.data.text ??
    record.data.notes ??
    "Sem descrição registrada."
  );
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  type?: string;
}) {
  const className =
    "w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-teal-700";

  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-ink">
      {label}

      {multiline ? (
        <textarea
          className={`${className} min-h-24 resize-y`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          className={className}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
      )}
    </label>
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
  const [treatmentInstructions, setTreatmentInstructions] = useState("");
  const [treatmentGoals, setTreatmentGoals] = useState("");
  const [treatmentStart, setTreatmentStart] = useState("");
  const [treatmentEnd, setTreatmentEnd] = useState("");

  const [exerciseTitle, setExerciseTitle] = useState("");
  const [exerciseIds, setExerciseIds] = useState("");
  const [exerciseSchedule, setExerciseSchedule] = useState("");
  const [exerciseStart, setExerciseStart] = useState("");
  const [exerciseEnd, setExerciseEnd] = useState("");

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
        setSelectedId((current) => {
          if (current && options.some((patient) => patient.id === current)) {
            return current;
          }

          return options[0]?.id ?? "";
        });
      } catch (loadError) {
        if (!cancelled) {
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
        return;
      }

      setLoadingRecords(true);
      setError(null);
      setNotice(null);
      setPlans([]);
      setExercises(null);

      try {
        const requests = await Promise.allSettled([
          getRecords<TreatmentPlanRecord>(
            "treatment-plans",
            selectedId,
            session.accessToken,
          ),
          getPatientExercises(session.accessToken, selectedId),
        ]);

        if (cancelled) return;

        const plansResult = requests[0];
        const exercisesResult = requests[1];

        if (plansResult.status === "fulfilled") {
          setPlans(plansResult.value);
        }

        if (exercisesResult.status === "fulfilled") {
          setExercises(exercisesResult.value);
        }

        const failures = requests.filter(
          (request) => request.status === "rejected",
        );

        if (failures.length > 0) {
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
    setTreatmentInstructions("");
    setTreatmentGoals("");
    setTreatmentStart("");
    setTreatmentEnd("");
  }

  function resetExerciseForm() {
    setEditingExerciseId(null);
    setExerciseTitle("");
    setExerciseIds("");
    setExerciseSchedule("");
    setExerciseStart("");
    setExerciseEnd("");
  }

  function editTreatment(plan: TreatmentPlanRecord) {
    setEditingTreatmentId(plan._id);
    setTreatmentTitle(plan.data.title ?? "");
    setTreatmentDescription(plan.data.description ?? "");
    setTreatmentInstructions(plan.data.instructions ?? "");
    setTreatmentGoals(plan.data.goals?.join(", ") ?? "");
    setTreatmentStart(toDateInput(plan.data.startsAt));
    setTreatmentEnd(toDateInput(plan.data.endsAt));
    setNotice(null);
  }

  function editExercisePlan(plan: ExerciseRecord<PatientExercisePlanData>) {
    setEditingExerciseId(plan._id);
    setExerciseTitle(plan.data.title ?? "");
    setExerciseIds(plan.data.exerciseIds?.join(", ") ?? "");
    setExerciseSchedule(plan.data.schedule?.join(", ") ?? "");
    setExerciseStart(toDateInput(plan.data.startsAt));
    setExerciseEnd(toDateInput(plan.data.endsAt));
    setNotice(null);
  }

  async function saveTreatment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canManage || !session?.accessToken || !selectedId) return;

    if (!treatmentTitle.trim()) {
      setError("Informe o título do plano de tratamento.");
      return;
    }

    setSaving(true);
    setError(null);
    setNotice(null);

    const data: TreatmentPlanData = {
      title: treatmentTitle.trim(),
      description: treatmentDescription.trim(),
      instructions: treatmentInstructions.trim(),
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

  async function saveExercisePlan(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canManage || !session?.accessToken || !selectedId) return;

    if (!exerciseTitle.trim()) {
      setError("Informe o título do plano de exercícios.");
      return;
    }

    setSaving(true);
    setError(null);
    setNotice(null);

    const data: PatientExercisePlanData = {
      title: exerciseTitle.trim(),
      exerciseIds: exerciseIds
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean),
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
            ? "Selecione um paciente para consultar e organizar seus planos de cuidado."
            : "Consulte os planos de cuidado dos pacientes vinculados ao seu perfil."
        }
      />

      <GlassCard title="Paciente">
        {loadingPatients ? (
          <p className="text-sm text-ink-soft">Carregando pacientes...</p>
        ) : patients.length === 0 ? (
          <EmptyState title="Nenhum paciente disponível para consulta" />
        ) : (
          <label className="flex flex-col gap-2 text-sm font-medium text-ink">
            Escolher paciente

            <select
              className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm outline-none focus:border-teal-700"
              value={selectedId}
              onChange={(event) => setSelectedId(event.target.value)}
            >
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </GlassCard>

      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-amber-300/60 bg-amber-50 p-4 text-sm text-amber-900"
        >
          {error}
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="rounded-2xl border border-teal-700/20 bg-teal-50 p-4 text-sm text-teal-900"
        >
          {notice}
        </div>
      )}

      {loadingRecords && (
        <p className="text-sm text-ink-soft">
          Carregando os planos do paciente...
        </p>
      )}

      <GlassCard title="Planos de tratamento">
        {plans.length === 0 ? (
          <EmptyState title="Nenhum plano de tratamento encontrado" />
        ) : (
          <ul className="flex flex-col gap-3">
            {plans.map((plan) => (
              <li
                key={plan._id}
                className="flex flex-col gap-3 rounded-2xl border border-ink/10 p-4"
              >
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

                {(plan.data.startsAt || plan.data.endsAt) && (
                  <p className="text-xs text-ink-soft">
                    Período: {formatDate(plan.data.startsAt)} até{" "}
                    {formatDate(plan.data.endsAt)}
                  </p>
                )}

                {plan.data.goals && plan.data.goals.length > 0 && (
                  <p className="text-sm text-ink-soft">
                    Objetivos: {plan.data.goals.join(" · ")}
                  </p>
                )}

                {canManage && (
                  <button
                    type="button"
                    className="self-start rounded-full border border-teal-700/30 px-4 py-2 text-sm font-medium text-teal-800 hover:bg-teal-50"
                    onClick={() => editTreatment(plan)}
                  >
                    Editar plano
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </GlassCard>

      <GlassCard title="Planos de exercícios">
        {(exercises?.plans.length ?? 0) === 0 ? (
          <EmptyState title="Nenhum plano de exercícios encontrado" />
        ) : (
          <ul className="flex flex-col gap-3">
            {(exercises?.plans ?? []).map((plan) => (
              <li
                key={plan._id}
                className="flex flex-col gap-3 rounded-2xl border border-ink/10 p-4"
              >
                <ListRow
                  icon={ExerciseIcon}
                  title={plan.data.title ?? "Plano de exercícios"}
                  subtitle={
                    plan.data.schedule?.join(", ") ||
                    "Frequência não informada"
                  }
                />

                {(plan.data.startsAt || plan.data.endsAt) && (
                  <p className="text-xs text-ink-soft">
                    Período: {formatDate(plan.data.startsAt)} até{" "}
                    {formatDate(plan.data.endsAt)}
                  </p>
                )}

                {canManage && (
                  <button
                    type="button"
                    className="self-start rounded-full border border-teal-700/30 px-4 py-2 text-sm font-medium text-teal-800 hover:bg-teal-50"
                    onClick={() => editExercisePlan(plan)}
                  >
                    Editar plano
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </GlassCard>

      {canManage && (
        <>
          <GlassCard
            title={
              editingTreatmentId
                ? "Editar plano de tratamento"
                : "Novo plano de tratamento"
            }
          >
            <form className="flex flex-col gap-4" onSubmit={saveTreatment}>
              <FormField
                label="Título"
                value={treatmentTitle}
                onChange={setTreatmentTitle}
                placeholder="Ex.: Plano de acompanhamento"
              />

              <FormField
                label="Descrição"
                value={treatmentDescription}
                onChange={setTreatmentDescription}
                placeholder="Descreva o objetivo geral do plano"
                multiline
              />

              <FormField
                label="Orientações"
                value={treatmentInstructions}
                onChange={setTreatmentInstructions}
                placeholder="Orientações para o paciente"
                multiline
              />

              <FormField
                label="Objetivos"
                value={treatmentGoals}
                onChange={setTreatmentGoals}
                placeholder="Separe os objetivos por vírgula"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Data de início"
                  type="date"
                  value={treatmentStart}
                  onChange={setTreatmentStart}
                />

                <FormField
                  label="Data de término"
                  type="date"
                  value={treatmentEnd}
                  onChange={setTreatmentEnd}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving || !selectedId}
                  className="rounded-full bg-teal-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Salvando..."
                    : editingTreatmentId
                      ? "Salvar alterações"
                      : "Cadastrar plano"}
                </button>

                {editingTreatmentId && (
                  <button
                    type="button"
                    className="rounded-full border border-ink/15 px-5 py-3 text-sm font-medium"
                    onClick={resetTreatmentForm}
                  >
                    Cancelar edição
                  </button>
                )}
              </div>
            </form>
          </GlassCard>

          <GlassCard
            title={
              editingExerciseId
                ? "Editar plano de exercícios"
                : "Novo plano de exercícios"
            }
          >
            <form className="flex flex-col gap-4" onSubmit={saveExercisePlan}>
              <FormField
                label="Título"
                value={exerciseTitle}
                onChange={setExerciseTitle}
                placeholder="Ex.: Rotina de exercícios diários"
              />

              <FormField
                label="IDs dos exercícios"
                value={exerciseIds}
                onChange={setExerciseIds}
                placeholder="IDs separados por vírgula"
              />

              <FormField
                label="Frequência e horários"
                value={exerciseSchedule}
                onChange={setExerciseSchedule}
                placeholder="Ex.: Segunda, Quarta, Sexta"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Data de início"
                  type="date"
                  value={exerciseStart}
                  onChange={setExerciseStart}
                />

                <FormField
                  label="Data de término"
                  type="date"
                  value={exerciseEnd}
                  onChange={setExerciseEnd}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving || !selectedId}
                  className="rounded-full bg-teal-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Salvando..."
                    : editingExerciseId
                      ? "Salvar alterações"
                      : "Cadastrar plano"}
                </button>

                {editingExerciseId && (
                  <button
                    type="button"
                    className="rounded-full border border-ink/15 px-5 py-3 text-sm font-medium"
                    onClick={resetExerciseForm}
                  >
                    Cancelar edição
                  </button>
                )}
              </div>
            </form>
          </GlassCard>
        </>
      )}
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
          getRecords<ClinicalRecord>(
            "observations",
            patientId,
            accessToken,
          ),
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

        const failedRequests = results.filter(
          (result) => result.status === "rejected",
        );

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
            plansResult.status === "fulfilled"
              ? plansResult.value
              : [],

          clinicalRecords: [
            ...(observationsResult.status === "fulfilled"
              ? observationsResult.value
              : []),
            ...(diaryResult.status === "fulfilled"
              ? diaryResult.value
              : []),
          ].sort((a, b) => {
            const dateA = new Date(
              a.data.recordedAt ??
                a.data.observedAt ??
                a.createdAt ??
                0,
            ).getTime();

            const dateB = new Date(
              b.data.recordedAt ??
                b.data.observedAt ??
                b.createdAt ??
                0,
            ).getTime();

            return dateB - dateA;
          }),
        });

        if (failedRequests.length > 0) {
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

      {error && (
        <div
          role="alert"
          className="rounded-2xl border border-amber-300/60 bg-amber-50 p-4 text-sm text-amber-900"
        >
          {error}
        </div>
      )}

      {loading && (
        <p className="text-sm text-ink-soft">
          Carregando informações do seu tratamento...
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassCard title="Medicamentos">
          {loading && !medicationData ? (
            <p className="text-sm text-ink-soft">
              Carregando medicamentos...
            </p>
          ) : activePrescriptions.length === 0 ? (
            <EmptyState title="Nenhuma prescrição ativa encontrada" />
          ) : (
            <ul className="flex flex-col gap-3">
              {activePrescriptions.map((prescription) => {
                const medication = medicationsById.get(
                  prescription.data.medicationId,
                );

                return (
                  <ListRow
                    key={prescription._id}
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
                );
              })}
            </ul>
          )}
        </GlassCard>

        <GlassCard title="Exercícios">
          {loading && !exerciseData ? (
            <p className="text-sm text-ink-soft">
              Carregando exercícios...
            </p>
          ) : activePlans.length === 0 ? (
            <EmptyState title="Nenhum plano de exercícios ativo" />
          ) : (
            <ul className="flex flex-col gap-3">
              {activePlans.map((plan) => (
                <ListRow
                  key={plan._id}
                  icon={ExerciseIcon}
                  title={plan.data.title ?? "Plano de exercícios"}
                  subtitle={
                    plan.data.schedule?.join(", ") ||
                    "Frequência não informada"
                  }
                />
              ))}
            </ul>
          )}
        </GlassCard>

        <GlassCard title="Próximas consultas">
          {loading ? (
            <p className="text-sm text-ink-soft">
              Carregando consultas...
            </p>
          ) : upcomingAppointments.length === 0 ? (
            <EmptyState title="Nenhuma consulta futura encontrada" />
          ) : (
            <ul className="flex flex-col gap-3">
              {upcomingAppointments.map((appointment) => (
                <ListRow
                  key={appointment._id}
                  icon={CalendarIcon}
                  title={appointment.data.title}
                  subtitle={[
                    formatDateTime(getAppointmentDate(appointment)),
                    appointment.data.location,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                />
              ))}
            </ul>
          )}
        </GlassCard>

        <GlassCard title="Orientações e registros">
          {loading && state.clinicalRecords.length === 0 ? (
            <p className="text-sm text-ink-soft">
              Carregando registros...
            </p>
          ) : recentRecords.length === 0 ? (
            <EmptyState title="Nenhuma orientação ou registro encontrado" />
          ) : (
            <ul className="flex flex-col gap-3">
              {recentRecords.map((record) => (
                <ListRow
                  key={record._id}
                  icon={MessageIcon}
                  title={getClinicalRecordTitle(record)}
                  subtitle={`${formatDate(
                    record.data.recordedAt ??
                      record.data.observedAt ??
                      record.createdAt,
                  )} · ${getClinicalRecordDescription(record)}`}
                />
              ))}
            </ul>
          )}
        </GlassCard>

        <GlassCard title="Orientações do plano">
          {loading && state.treatmentPlans.length === 0 ? (
            <p className="text-sm text-ink-soft">
              Carregando orientações...
            </p>
          ) : state.treatmentPlans.length === 0 ? (
            <EmptyState title="Nenhum plano de tratamento cadastrado" />
          ) : (
            <ul className="flex flex-col gap-3">
              {state.treatmentPlans.map((plan) => (
                <ListRow
                  key={plan._id}
                  icon={MessageIcon}
                  title={plan.data.title ?? "Plano de tratamento"}
                  subtitle={
                    plan.data.description ??
                    plan.data.instructions ??
                    plan.data.goals?.join(" · ") ??
                    "Sem orientações adicionais."
                  }
                />
              ))}
            </ul>
          )}
        </GlassCard>
      </div>

      <p className="text-sm text-ink-soft">
        Em caso de dúvida sobre qualquer orientação, converse com a sua equipe
        de saúde.
      </p>
    </div>
  );
}