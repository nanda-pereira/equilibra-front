import { useState, type FormEvent } from "react";
import { Navigate } from "react-router";
import EmptyState from "../../components/app/EmptyState";
import GlassCard from "../../components/app/GlassCard";
import ListRow from "../../components/app/ListRow";
import Modal from "../../components/app/Modal";
import PageHeader from "../../components/app/PageHeader";
import PatientFilter from "../../components/app/PatientFilter";
import SmallButton from "../../components/app/SmallButton";
import Select from "../../components/ui/Select";
import Textarea from "../../components/ui/Textarea";
import { MessageIcon } from "../../components/ui/icons";
import { PROFILE_LABELS } from "../../modules/auth/types";
import { addRecord, recordsAll, useAppState } from "../../modules/demo/appStore";
import { PATIENTS_BASE } from "../../modules/demo/demoData";
import { useSession } from "../../modules/session/session";

export default function ClinicalEvolutionPage() {
  const { session } = useSession();
  useAppState();
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [patient, setPatient] = useState("");
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [flash, setFlash] = useState("");

  if (!session) return null;
  if (session.profile !== "medico") return <Navigate to="/app/inicio" replace />;

  const author = `${session.name} (${PROFILE_LABELS[session.profile].toLowerCase()})`;
  const records = recordsAll().filter((item) => filter === "all" || item.patientId === filter);
  const errors = {
    patient: patient ? undefined : "Selecione uma opção",
    text: text.trim().length < 5 ? "Escreva ao menos algumas palavras" : undefined,
  };

  const startNew = () => {
    setPatient("");
    setText("");
    setSubmitted(false);
    setFlash("");
    setOpen(true);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    const target = PATIENTS_BASE.find((item) => item.name === patient);
    if (errors.patient || errors.text || !target) return;
    addRecord({ patientId: target.id, author, text: text.trim() });
    setOpen(false);
    setFlash("Registro adicionado.");
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Evolução clínica" subtitle="Registros de acompanhamento" demo>
        <SmallButton variant="solid" onClick={startNew}>
          Novo registro
        </SmallButton>
      </PageHeader>

      {flash && (
        <p role="status" className="rounded-[20px] bg-success-bg px-4 py-3 text-sm text-success-text">
          {flash} Como é uma demonstração, os dados não são enviados a um servidor.
        </p>
      )}

      <GlassCard title="Filtrar por paciente">
        <PatientFilter value={filter} onChange={setFilter} includeAll />
      </GlassCard>

      <GlassCard title="Registros">
        {records.length === 0 ? (
          <EmptyState title="Nenhum registro encontrado" />
        ) : (
          <ul className="flex flex-col gap-3">
            {records.map((item) => (
              <ListRow
                key={item.id}
                icon={MessageIcon}
                title={`${item.patientName} · ${item.text}`}
                subtitle={`${item.author} · ${item.when}`}
              />
            ))}
          </ul>
        )}
      </GlassCard>

      <Modal open={open} title="Novo registro" onClose={() => setOpen(false)}>
        <form noValidate onSubmit={handleSubmit}>
          <Select
            label="Paciente"
            options={PATIENTS_BASE.map((item) => item.name)}
            value={patient}
            onChange={(e) => setPatient(e.target.value)}
            error={submitted ? errors.patient : undefined}
          />
          <Textarea
            label="Registro"
            placeholder="Descreva o acompanhamento"
            value={text}
            onChange={(e) => setText(e.target.value)}
            error={submitted ? errors.text : undefined}
          />
          <div className="flex flex-wrap gap-3">
            <SmallButton type="submit" variant="solid">
              Salvar registro
            </SmallButton>
            <SmallButton onClick={() => setOpen(false)}>Cancelar</SmallButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}