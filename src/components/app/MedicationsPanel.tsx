import { useState, type FormEvent } from "react";
import {
  addMedication,
  confirmDose,
  dosesToday,
  medicationsFor,
  useAppState,
} from "../../modules/demo/appStore";
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

type MedicationsPanelProps = {
  patientId: string;
  canConfirm: boolean;
  /** true para o médico: o medicamento fica como "prescrito" */
  prescribe: boolean;
  authorName: string;
};

export default function MedicationsPanel({
  patientId,
  canConfirm,
  prescribe,
  authorName,
}: MedicationsPanelProps) {
  useAppState();
  const [open, setOpen] = useState(false);
  const [flash, setFlash] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [dose, setDose] = useState("");
  const [times, setTimes] = useState([""]);
  const [notes, setNotes] = useState("");

  const doses = dosesToday(patientId);
  const meds = medicationsFor(patientId);
  const addLabel = prescribe ? "Prescrever medicamento" : "Adicionar medicamento";

  const errors = {
    name: name.trim().length < 2 ? "Informe o nome do medicamento" : undefined,
    dose: dose.trim() ? undefined : "Campo obrigatório",
    times: times.some((time) => !time)
      ? "Informe todos os horários"
      : new Set(times).size !== times.length
        ? "Há horários repetidos"
        : undefined,
  };

  function startAdding() {
    setName("");
    setDose("");
    setTimes([""]);
    setNotes("");
    setSubmitted(false);
    setFlash("");
    setOpen(true);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    if (errors.name || errors.dose || errors.times) return;

    addMedication({
      patientId,
      name: name.trim(),
      dose: dose.trim(),
      times: [...times].sort(),
      notes: notes.trim(),
      addedBy: authorName,
      source: prescribe ? "prescricao" : "informado",
    });
    setOpen(false);
    setFlash("Medicamento adicionado.");
  }

  return (
    <div className="flex flex-col gap-6">
      {flash && (
        <p role="status" className="rounded-[20px] bg-success-bg px-4 py-3 text-sm text-success-text">
          {flash} Como é uma demonstração, os dados não são enviados a um servidor.
        </p>
      )}

      <GlassCard title="Horários de hoje">
        {doses.length === 0 ? (
          <EmptyState title="Nenhum medicamento programado para hoje" />
        ) : (
          <ul className="flex flex-col gap-3">
            {doses.map((item) => (
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
                      onClick={() => confirmDose(item.medId, item.time)}
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
        title="Medicamentos em uso"
        action={
          <SmallButton variant="solid" onClick={startAdding}>
            {addLabel}
          </SmallButton>
        }
      >
        {meds.length === 0 ? (
          <EmptyState title="Nenhum medicamento cadastrado" />
        ) : (
          <ul className="flex flex-col gap-3">
            {meds.map((med) => (
              <ListRow
                key={med.id}
                icon={MedicineIcon}
                title={med.name}
                subtitle={`${med.dose} · ${med.times.join(", ")} · ${
                  med.source === "prescricao" ? "Prescrito por" : "Informado por"
                } ${med.addedBy}${med.notes ? ` · ${med.notes}` : ""}`}
              />
            ))}
          </ul>
        )}
      </GlassCard>

      <Modal open={open} title={addLabel} onClose={() => setOpen(false)}>
        <form noValidate onSubmit={handleSubmit}>
          <div className="grid gap-x-6 sm:grid-cols-2">
            <Input
              label="Medicamento"
              placeholder="Levodopa"
              autoComplete="off"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={submitted ? errors.name : undefined}
            />
            <Input
              label="Dose"
              placeholder="1 comprimido"
              autoComplete="off"
              value={dose}
              onChange={(e) => setDose(e.target.value)}
              error={submitted ? errors.dose : undefined}
            />
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
                      setTimes((list) => list.map((item, i) => (i === index ? e.target.value : item)))
                    }
                    className="h-11 w-full rounded-full border border-brand bg-transparent px-6 text-sm text-ink focus:border-action focus:outline-none focus:ring-4 focus:ring-action/15"
                  />
                  {times.length > 1 && (
                    <button
                      type="button"
                      aria-label={`Remover horário ${index + 1}`}
                      onClick={() => setTimes((list) => list.filter((_, i) => i !== index))}
                      className="flex size-11 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-mint-100 focus-visible:outline-2 focus-visible:outline-action"
                    >
                      <Icon icon={CloseIcon} size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p aria-live="polite" className="mt-1 min-h-5 text-sm text-alert-text">
              {submitted ? errors.times : ""}
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
            placeholder="Ex.: tomar após as refeições"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          {!prescribe && (
            <p className="mb-4 rounded-[20px] bg-info-bg px-4 py-3 text-sm text-info-text">
              Registre apenas medicamentos indicados pela equipe de saúde. A prescrição é
              responsabilidade do médico.
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <SmallButton type="submit" variant="solid">
              Salvar
            </SmallButton>
            <SmallButton onClick={() => setOpen(false)}>Cancelar</SmallButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}