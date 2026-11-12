import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  createPatientMedication,
  createPatientMedicationLog,
  createPatientPrescription,
  getPatientMedications,
  type PatientMedicationsData,
} from "../../services/api/patients";
import { useSession } from "../../modules/session/session";
import Icon from "../ui/Icon";
import Input from "../ui/Input";
import Textarea from "../ui/Textarea";
import { CloseIcon, MedicineIcon, PlusIcon } from "../ui/icons";
import EmptyState from "./EmptyState";
import GlassCard from "./GlassCard";
import ListRow from "./ListRow";
import Modal from "./Modal";
import SmallButton from "./SmallButton";
import StatusBadge from "./StatusBadge";

type Props = {
  patientId: string;
  canConfirm: boolean;
  prescribe: boolean;
  authorName: string;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Não foi possível concluir a operação.";
}

function getMedicationName(
  data: PatientMedicationsData,
  medicationId: string,
) {
  return data.medications.find((med) => med._id === medicationId)?.data.name
    ?? "Medicamento";
}

export default function MedicationsPanel({
  patientId,
  canConfirm,
  prescribe,
}: Props) {
  const { session } = useSession();
  const accessToken = session?.accessToken;

  const [data, setData] = useState<PatientMedicationsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [flash, setFlash] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [name, setName] = useState("");
  const [dose, setDose] = useState("1");
  const [unit, setUnit] = useState("comprimido");
  const [route, setRoute] = useState("");
  const [times, setTimes] = useState([""]);
  const [notes, setNotes] = useState("");

  const loadData = useCallback(async (showLoading = true) => {
    if (!accessToken || !patientId) return;

    if (showLoading) {
      setLoading(true);
      setError("");
    }

    try {
      const result = await getPatientMedications(accessToken, patientId);
      setData(result);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [accessToken, patientId]);

  useEffect(() => {
    if (!accessToken || !patientId) {
      return;
    }

    let active = true;

    const fetchData = async () => {
      try {
        const result = await getPatientMedications(accessToken, patientId);

        if (active) {
          setData(result);
          setError("");
        }
      } catch (err) {
        if (active) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void fetchData();

    return () => {
      active = false;
    };
  }, [accessToken, patientId]);

  const prescriptions = (data?.prescriptions ?? []).filter(
    (item) => item.status === "ACTIVE",
  );

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const scheduledDoses = prescriptions.flatMap((prescription) => {
    const schedule = prescription.data.schedule ?? [];

    return schedule.map((time) => {
      const scheduledAt = new Date(`${todayKey}T${time}:00`);
      const taken = (data?.medicationLogs ?? []).some((log) => {
        if (log.data.prescriptionId !== prescription._id) return false;
        if (!log.data.administeredAt) return false;

        const administeredAt = new Date(log.data.administeredAt);
        return (
          !Number.isNaN(administeredAt.getTime()) &&
          administeredAt.toDateString() === today.toDateString() &&
          (log.data.status ?? "").toUpperCase() !== "SKIPPED" &&
          Math.abs(
            administeredAt.getTime() - scheduledAt.getTime(),
          ) < 2 * 60 * 60 * 1000
        );
      });

      return {
        key: `${prescription._id}-${time}`,
        prescriptionId: prescription._id,
        name: getMedicationName(data!, prescription.data.medicationId),
        time,
        dose: `${prescription.data.dose} ${prescription.data.unit}`,
        taken,
        scheduledAt: scheduledAt.toISOString(),
      };
    });
  }).sort((a, b) => a.time.localeCompare(b.time));

  function startAdding() {
    setName("");
    setDose("1");
    setUnit("comprimido");
    setRoute("");
    setTimes([""]);
    setNotes("");
    setSubmitted(false);
    setFlash("");
    setError("");
    setOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    setFlash("");
    setError("");

    const validTimes =
      times.length > 0 &&
      times.every((time) => /^\d{2}:\d{2}$/.test(time)) &&
      new Set(times).size === times.length;

    const numericDose = Number(dose.replace(",", "."));

    if (
      name.trim().length < 2 ||
      !Number.isFinite(numericDose) ||
      numericDose <= 0 ||
      !unit.trim() ||
      !validTimes ||
      (prescribe && !route.trim())
    ) {
      return;
    }

    if (!accessToken) {
      setError("Sua sessão expirou. Entre novamente para continuar.");
      return;
    }

    setSaving(true);

    try {
      const medication = await createPatientMedication(
        accessToken,
        patientId,
        {
          name: name.trim(),
          instructions: notes.trim() || undefined,
        },
      );

      if (prescribe) {
        await createPatientPrescription(accessToken, patientId, {
          medicationId: medication._id,
          dose: numericDose,
          unit: unit.trim(),
          route: route.trim(),
          schedule: [...times].sort(),
          instructions: notes.trim() || undefined,
        });

        setFlash("Medicamento e prescrição cadastrados com sucesso.");
      } else {
        setFlash("Medicamento cadastrado com sucesso.");
      }

      setOpen(false);
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function confirmDose(
    prescriptionId: string,
    time: string,
  ) {
    if (!accessToken || !data) return;

    setError("");
    setFlash("");

    try {
      const scheduledAt = new Date(`${todayKey}T${time}:00`);

      await createPatientMedicationLog(accessToken, patientId, {
        prescriptionId,
        scheduledAt: scheduledAt.toISOString(),
        administeredAt: new Date().toISOString(),
        status: "TAKEN",
      });

      setFlash("Dose registrada com sucesso.");
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {flash && (
        <p
          role="status"
          className="rounded-[20px] bg-success-bg px-4 py-3 text-sm text-success-text"
        >
          {flash}
        </p>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-[20px] bg-alert-bg px-4 py-3 text-sm text-alert-text"
        >
          {error}
          <button
            type="button"
            className="ml-2 font-medium underline"
            onClick={() => void loadData()}
          >
            Tentar novamente
          </button>
        </div>
      )}

      <GlassCard title="Horários de hoje">
        {loading ? (
          <p className="py-4 text-sm text-ink-soft">Carregando horários...</p>
        ) : scheduledDoses.length === 0 ? (
          <EmptyState title="Nenhum medicamento programado para hoje" />
        ) : (
          <ul className="flex flex-col gap-3">
            {scheduledDoses.map((item) => (
              <ListRow
                key={item.key}
                icon={MedicineIcon}
                title={`${item.name} — ${item.time}`}
                subtitle={item.dose}
                trailing={
                  item.taken ? (
                    <StatusBadge status="stable" label="Registrado" />
                  ) : canConfirm ? (
                    <SmallButton
                      variant="solid"
                      onClick={() =>
                        void confirmDose(item.prescriptionId, item.time)
                      }
                      label={`Confirmar ${item.name} das ${item.time}`}
                    >
                      Confirmar
                    </SmallButton>
                  ) : (
                    <StatusBadge status="info" label="Pendente" />
                  )
                }
              />
            ))}
          </ul>
        )}
      </GlassCard>

      <GlassCard
        title="Medicamentos cadastrados"
        action={
          <SmallButton variant="solid" onClick={startAdding}>
            {prescribe ? "Prescrever medicamento" : "Adicionar medicamento"}
          </SmallButton>
        }
      >
        {loading ? (
          <p className="py-4 text-sm text-ink-soft">Carregando medicamentos...</p>
        ) : !data?.medications.length ? (
          <EmptyState title="Nenhum medicamento cadastrado" />
        ) : (
          <ul className="flex flex-col gap-3">
            {data.medications.map((medication) => {
              const related = prescriptions.filter(
                (item) => item.data.medicationId === medication._id,
              );

              return (
                <ListRow
                  key={medication._id}
                  icon={MedicineIcon}
                  title={medication.data.name}
                  subtitle={
                    related.length
                      ? related
                          .map(
                            (item) =>
                              `${item.data.dose} ${item.data.unit} · ${
                                item.data.schedule?.join(", ") ?? "Sem horários"
                              }`,
                          )
                          .join(" | ")
                      : medication.data.instructions ?? "Sem prescrição ativa"
                  }
                />
              );
            })}
          </ul>
        )}
      </GlassCard>

      <Modal
        open={open}
        title={prescribe ? "Prescrever medicamento" : "Adicionar medicamento"}
        onClose={() => !saving && setOpen(false)}
      >
        <form noValidate onSubmit={handleSubmit}>
          <div className="grid gap-x-6 sm:grid-cols-2">
            <Input
              label="Medicamento"
              placeholder="Nome do medicamento"
              autoComplete="off"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={
                submitted && name.trim().length < 2
                  ? "Informe o nome do medicamento"
                  : undefined
              }
            />
            <Input
              label="Dose (quantidade)"
              placeholder="Ex.: 1"
              autoComplete="off"
              value={dose}
              onChange={(e) => setDose(e.target.value)}
              error={
                submitted &&
                (!Number.isFinite(Number(dose.replace(",", "."))) ||
                  Number(dose.replace(",", ".")) <= 0)
                  ? "Informe uma quantidade válida"
                  : undefined
              }
            />
            <Input
              label="Unidade da dose"
              placeholder="Ex.: comprimido, mg, mL"
              autoComplete="off"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              error={submitted && !unit.trim() ? "Informe a unidade" : undefined}
            />

            {prescribe && (
              <Input
                label="Via de administração"
                placeholder="Conforme prescrição médica"
                autoComplete="off"
                value={route}
                onChange={(e) => setRoute(e.target.value)}
                error={
                  submitted && !route.trim()
                    ? "Informe a via de administração"
                    : undefined
                }
              />
            )}
          </div>

          <fieldset className="mb-2 min-w-0">
            <legend className="mb-2.5 text-base text-ink">Horários</legend>

            <div className="flex flex-col gap-3">
              {times.map((time, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="time"
                    aria-label={`Horário ${index + 1}`}
                    value={time}
                    onChange={(e) =>
                      setTimes((list) =>
                        list.map((item, i) =>
                          i === index ? e.target.value : item,
                        ),
                      )
                    }
                    className="h-11 w-full rounded-full border border-brand bg-transparent px-6 text-sm text-ink focus:border-action focus:outline-none focus:ring-4 focus:ring-action/15"
                  />

                  {times.length > 1 && (
                    <button
                      type="button"
                      aria-label={`Remover horário ${index + 1}`}
                      onClick={() =>
                        setTimes((list) => list.filter((_, i) => i !== index))
                      }
                      className="flex size-11 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-mint-100 focus-visible:outline-2 focus-visible:outline-action"
                    >
                      <Icon icon={CloseIcon} size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <p aria-live="polite" className="mt-1 min-h-5 text-sm text-alert-text">
              {submitted &&
              (times.some((time) => !time) ||
                new Set(times).size !== times.length)
                ? "Preencha todos os horários sem repetir."
                : ""}
            </p>

            {times.length < 6 && (
              <button
                type="button"
                onClick={() => setTimes((list) => [...list, ""])}
                className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-action hover:text-action-hover focus-visible:outline-2 focus-visible:outline-action"
              >
                <Icon icon={PlusIcon} size={18} />
                Adicionar horário
              </button>
            )}
          </fieldset>

          <Textarea
            label="Observações (opcional)"
            placeholder="Orientações já definidas pela equipe de saúde"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          {!prescribe && (
            <p className="mb-4 rounded-[20px] bg-info-bg px-4 py-3 text-sm text-info-text">
              Registre apenas medicamentos indicados pela equipe de saúde.
              Este cadastro não cria uma prescrição médica.
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <SmallButton type="submit" variant="solid">
              {saving ? "Salvando..." : "Salvar"}
            </SmallButton>
            <SmallButton onClick={() => !saving && setOpen(false)}>
              Cancelar
            </SmallButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}