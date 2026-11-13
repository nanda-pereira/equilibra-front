
import { useEffect, useState, type FormEvent } from "react";
import { Navigate } from "react-router";
import EmptyState from "../../components/app/EmptyState";
import GlassCard from "../../components/app/GlassCard";
import ListRow from "../../components/app/ListRow";
import Modal from "../../components/app/Modal";
import PageHeader from "../../components/app/PageHeader";
import SmallButton from "../../components/app/SmallButton";
import Select from "../../components/ui/Select";
import Textarea from "../../components/ui/Textarea";
import { MessageIcon } from "../../components/ui/icons";
import {
  createPatientObservation,
  getAccessiblePatients,
  getPatientObservations,
  type ObservationData,
  type PatientProfile,
  type PatientRecord,
} from "../../services/api/patients";
import { useSession } from "../../modules/session/session";

type PatientOption = {
  id: string;
  name: string;
};

type ObservationItem = {
  id: string;
  patientId: string;
  patientName: string;
  category: string;
  notes: string;
  createdAt?: string;
};

const CATEGORIES = [
  "Evolução clínica",
  "Observação",
  "Acompanhamento",
];

const DATE_FORMAT = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function toPatientOption(
  patient: PatientProfile,
): PatientOption | null {
  const id = patient.id ?? patient._id;
  if (!id) return null;

  const user = patient.userId;
  const name =
    typeof user === "object" && user !== null
      ? user.fullName || user.email
      : undefined;

  return { id, name: name || "Paciente" };
}

function toObservationItem(
  record: PatientRecord<ObservationData>,
  patients: PatientOption[],
): ObservationItem {
  const patient = patients.find(
    (item) => item.id === record.patientId,
  );

  return {
    id: record._id,
    patientId: record.patientId,
    patientName: patient?.name || "Paciente",
    category: record.data?.category || "Observação",
    notes: record.data?.notes || "",
    createdAt: record.createdAt ?? record.updatedAt,
  };
}

function formatDate(value?: string) {
  if (!value) return "Data não informada";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data não informada";

  return DATE_FORMAT.format(date);
}

export default function ClinicalEvolutionPage() {
  const { session } = useSession();

  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [records, setRecords] = useState<ObservationItem[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [open, setOpen] = useState(false);
  const [patient, setPatient] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState("");

  const accessToken = session?.accessToken;
  const profile = session?.profile;

  useEffect(() => {
    let cancelled = false;

    async function loadRecords() {
      if (!accessToken || profile !== "medico") {
        setPatients([]);
        setRecords([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const profiles = await getAccessiblePatients(accessToken);
        const patientOptions = profiles
          .map(toPatientOption)
          .filter((item): item is PatientOption => item !== null);

        const results = await Promise.all(
          patientOptions.map((item) =>
            getPatientObservations(accessToken, item.id),
          ),
        );

        const observations = results
          .flat()
          .map((record) => toObservationItem(record, patientOptions))
          .sort((a, b) => {
            const dateA = a.createdAt
              ? new Date(a.createdAt).getTime()
              : 0;
            const dateB = b.createdAt
              ? new Date(b.createdAt).getTime()
              : 0;
            return dateB - dateA;
          });

        if (cancelled) return;

        setPatients(patientOptions);
        setRecords(observations);
        setPatient((current) =>
          patientOptions.some((item) => item.id === current)
            ? current
            : patientOptions[0]?.id ?? "",
        );
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Não foi possível carregar os registros clínicos.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadRecords();

    return () => {
      cancelled = true;
    };
  }, [accessToken, profile]);

  if (!session) return null;

  if (session.profile !== "medico") {
    return <Navigate to="/app/inicio" replace />;
  }

  const visibleRecords =
    filter === "all"
      ? records
      : records.filter((record) => record.patientId === filter);

  const errors = {
    patient: patient ? undefined : "Selecione um paciente",
    text:
      text.trim().length < 5
        ? "Escreva ao menos algumas palavras"
        : undefined,
  };

  function startNew() {
    setPatient(patients[0]?.id ?? "");
    setCategory(CATEGORIES[0]);
    setText("");
    setSubmitted(false);
    setFlash("");
    setError("");
    setOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);

    if (errors.patient || errors.text) return;
    if (!accessToken) {
      setError("Sua sessão expirou. Entre novamente.");
      return;
    }

    const selectedPatient = patients.find(
      (item) => item.id === patient,
    );

    if (!selectedPatient) {
      setError("Não foi possível identificar o paciente selecionado.");
      return;
    }

    setSaving(true);
    setError("");
    setFlash("");

    try {
      await createPatientObservation(accessToken, patient, {
        category,
        notes: text.trim(),
      });

      setOpen(false);
      setFlash("Registro clínico salvo com sucesso.");

      const results = await Promise.all(
        patients.map((item) =>
          getPatientObservations(accessToken, item.id),
        ),
      );

      const observations = results
        .flat()
        .map((record) => toObservationItem(record, patients))
        .sort((a, b) => {
          const dateA = a.createdAt
            ? new Date(a.createdAt).getTime()
            : 0;
          const dateB = b.createdAt
            ? new Date(b.createdAt).getTime()
            : 0;
          return dateB - dateA;
        });

      setRecords(observations);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível salvar o registro clínico.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Evolução clínica"
        subtitle="Registros de acompanhamento"
      >
        <SmallButton
          variant="solid"
          onClick={startNew}
        >
          Novo registro
        </SmallButton>
      </PageHeader>

      {error && (
        <p
          role="alert"
          className="rounded-[20px] bg-alert-bg px-4 py-3 text-sm text-alert-text"
        >
          {error}
        </p>
      )}

      {flash && (
        <p
          role="status"
          className="rounded-[20px] bg-success-bg px-4 py-3 text-sm text-success-text"
        >
          {flash}
        </p>
      )}

      <GlassCard title="Filtrar por paciente">
        <div className="max-w-md">
          <label
            htmlFor="clinical-evolution-filter"
            className="mb-2 block text-sm font-medium text-ink"
          >
            Paciente
          </label>
          <select
            id="clinical-evolution-filter"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="h-14 w-full rounded-full border border-field-border bg-white px-5 text-sm outline-none focus:border-action"
          >
            <option value="all">Todos os pacientes</option>
            {patients.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </GlassCard>

      <GlassCard title="Registros">
        {loading ? (
          <p className="text-sm text-ink-soft">
            Carregando registros clínicos...
          </p>
        ) : visibleRecords.length === 0 ? (
          <EmptyState title="Nenhum registro encontrado" />
        ) : (
          <ul className="flex flex-col gap-3">
            {visibleRecords.map((item) => (
              <ListRow
                key={item.id}
                icon={MessageIcon}
                title={`${item.patientName} · ${item.category}`}
                subtitle={`${formatDate(item.createdAt)} · ${item.notes}`}
              />
            ))}
          </ul>
        )}
      </GlassCard>

      <Modal
        open={open}
        title="Novo registro"
        onClose={() => {
          if (!saving) setOpen(false);
        }}
      >
        <form noValidate onSubmit={handleSubmit}>
          <Select
            label="Paciente"
            options={patients.map((item) => item.name)}
            value={
              patients.find((item) => item.id === patient)?.name ?? ""
            }
            onChange={(event) => {
              const selectedPatient = patients.find(
                (item) => item.name === event.target.value,
              );
              setPatient(selectedPatient?.id ?? "");
            }}
            error={submitted ? errors.patient : undefined}
          />

          <Select
            label="Categoria"
            options={CATEGORIES}
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          />

          <Textarea
            label="Registro"
            placeholder="Descreva o acompanhamento clínico"
            value={text}
            onChange={(event) => setText(event.target.value)}
            error={submitted ? errors.text : undefined}
          />

          <div className="flex flex-wrap gap-3">
            <SmallButton type="submit" variant="solid">
              {saving ? "Salvando..." : "Salvar registro"}
            </SmallButton>
            <SmallButton onClick={() => setOpen(false)}>
              Cancelar
            </SmallButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}
