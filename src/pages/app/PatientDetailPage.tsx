import { useState, type FormEvent, type ReactNode } from "react";
import { Navigate, useParams } from "react-router";
import EmptyState from "../../components/app/EmptyState";
import GlassCard from "../../components/app/GlassCard";
import ListRow from "../../components/app/ListRow";
import PageHeader from "../../components/app/PageHeader";
import SmallButton from "../../components/app/SmallButton";
import Icon from "../../components/ui/Icon";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Textarea from "../../components/ui/Textarea";
import { CalendarIcon, ChevronLeftIcon } from "../../components/ui/icons";
import { formatPhone, isValidEmail, onlyDigits } from "../../modules/auth/validation";
import { getAgendaFor, patients, shortDay } from "../../modules/demo/demoData";
import {
  STAGES,
  getPatientRecord,
  updatePatientRecord,
  type PatientEditable,
} from "../../modules/demo/patientStore";
import { useSession } from "../../modules/session/session";

type DraftErrors = Partial<Record<keyof PatientEditable, string>>;

function validateDraft(draft: PatientEditable): DraftErrors {
  const errors: DraftErrors = {};
  if (!draft.email.trim()) errors.email = "Campo obrigatório";
  else if (!isValidEmail(draft.email)) errors.email = "E-mail inválido";

  const digits = onlyDigits(draft.phone);
  if (!digits) errors.phone = "Campo obrigatório";
  else if (digits.length < 10) errors.phone = "Telefone inválido";

  if (!draft.diagnosis.trim()) errors.diagnosis = "Campo obrigatório";
  if (!draft.stage) errors.stage = "Selecione uma opção";
  return errors;
}

function Info({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-sm font-medium text-action-hover">{label}</dt>
      <dd className="mt-1 break-words text-base text-ink">{children}</dd>
    </div>
  );
}

const EMPTY_DRAFT: PatientEditable = {
  email: "",
  phone: "",
  diagnosis: "",
  stage: "",
  notes: "",
};

export default function PatientDetailPage() {
  const { session } = useSession();
  const { patientId = "" } = useParams();
  const [, setVersion] = useState(0);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<PatientEditable>(EMPTY_DRAFT);
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);

  const record = getPatientRecord(patientId);
  const summary = patients.find((item) => item.id === patientId);

  if (!session) return null;
  if (session.profile !== "medico" && session.profile !== "cuidador-clinico") {
    return <Navigate to="/app/inicio" replace />;
  }

  if (!record || !summary) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Paciente" demo />
        <GlassCard>
          <EmptyState
            title="Paciente não encontrado"
            description="Ele pode não estar vinculado a você."
          />
          <div className="mt-4 flex justify-center">
            <SmallButton to="/app/pacientes">Voltar para pacientes</SmallButton>
          </div>
        </GlassCard>
      </div>
    );
  }

  const canEdit = session.profile === "medico";
  const errors = validateDraft(draft);
  const shown = (key: keyof PatientEditable) => (submitted ? errors[key] : undefined);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const upcoming = getAgendaFor("medico")
    .filter((item) => item.patientId === patientId && item.date >= startOfToday)
    .sort((a, b) => a.date.getTime() - b.date.getTime() || a.time.localeCompare(b.time));

  function startEditing() {
    if (!record) return;
    setDraft({
      email: record.email,
      phone: record.phone,
      diagnosis: record.diagnosis,
      stage: record.stage,
      notes: record.notes,
    });
    setSubmitted(false);
    setSaved(false);
    setEditing(true);
  }

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;

    updatePatientRecord(patientId, {
      ...draft,
      email: draft.email.trim(),
      diagnosis: draft.diagnosis.trim(),
      notes: draft.notes.trim(),
    });
    setEditing(false);
    setSaved(true);
    setVersion((value) => value + 1);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <SmallButton to="/app/pacientes">
          <span className="inline-flex items-center gap-1.5">
            <Icon icon={ChevronLeftIcon} size={18} />
            Pacientes
          </span>
        </SmallButton>
      </div>

      <PageHeader
        title={record.name}
        subtitle={`${summary.age} anos · ${record.diagnosis}`}
        demo
      >
        <SmallButton
          variant="solid"
          to={`/app/mensagens?paciente=${patientId}`}
          label={`Contatar ${record.name}`}
        >
          Contatar
        </SmallButton>
        {canEdit && !editing && <SmallButton onClick={startEditing}>Editar dados</SmallButton>}
      </PageHeader>

      {saved && !editing && (
        <p
          role="status"
          className="rounded-[20px] bg-success-bg px-4 py-3 text-sm text-success-text"
        >
          Dados atualizados. Como é uma demonstração, as alterações não são gravadas em um
          servidor.
        </p>
      )}

      {editing ? (
        <GlassCard title="Editar dados do paciente">
          <form noValidate onSubmit={handleSave}>
            <p className="mb-5 text-sm text-ink-soft">
              O nome e a data de nascimento vêm do cadastro do paciente e não são editados
              aqui.
            </p>

            <div className="grid gap-x-6 sm:grid-cols-2">
              <Input
                label="E-mail"
                type="email"
                autoComplete="off"
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                error={shown("email")}
              />
              <Input
                label="Telefone"
                inputMode="numeric"
                autoComplete="off"
                maxLength={15}
                value={draft.phone}
                onChange={(e) => setDraft({ ...draft, phone: formatPhone(e.target.value) })}
                error={shown("phone")}
              />
              <Input
                label="Diagnóstico"
                autoComplete="off"
                value={draft.diagnosis}
                onChange={(e) => setDraft({ ...draft, diagnosis: e.target.value })}
                error={shown("diagnosis")}
              />
              <Select
                label="Estágio"
                options={STAGES}
                value={draft.stage}
                onChange={(e) => setDraft({ ...draft, stage: e.target.value })}
                error={shown("stage")}
              />
            </div>

            <Textarea
              label="Observações"
              placeholder="Registre informações úteis para o acompanhamento"
              value={draft.notes}
              onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
            />

            <div className="mt-2 flex flex-wrap gap-3">
              <button
                type="submit"
                className="inline-flex h-10 items-center rounded-full bg-action px-6 text-sm font-medium text-white transition-colors hover:bg-action-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
              >
                Salvar alterações
              </button>
              <SmallButton onClick={() => setEditing(false)}>Cancelar</SmallButton>
            </div>
          </form>
        </GlassCard>
      ) : (
        <>
          <div className="grid gap-6 xl:grid-cols-2">
            <GlassCard title="Dados pessoais">
              <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                <Info label="Nome completo">{record.name}</Info>
                <Info label="Data de nascimento">
                  {record.birthDate} ({summary.age} anos)
                </Info>
                <Info label="E-mail">{record.email}</Info>
                <Info label="Telefone">{record.phone}</Info>
              </dl>
            </GlassCard>

            <GlassCard title="Acompanhamento">
              <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                <Info label="Diagnóstico">{record.diagnosis}</Info>
                <Info label="Estágio">{record.stage}</Info>
                <Info label="Cuidador vinculado">{record.caregiver}</Info>
                <Info label="Medicamentos na semana">
                  {summary.medsWeek.taken} de {summary.medsWeek.total} registrados
                </Info>
              </dl>
            </GlassCard>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <GlassCard title="Observações">
              {record.notes ? (
                <p className="text-base text-ink">{record.notes}</p>
              ) : (
                <EmptyState
                  title="Nenhuma observação registrada"
                  description={
                    canEdit
                      ? "Use “Editar dados” para registrar uma observação."
                      : undefined
                  }
                />
              )}
            </GlassCard>

            <GlassCard title="Próximas consultas">
              {upcoming.length === 0 ? (
                <EmptyState title="Nenhuma consulta prevista" />
              ) : (
                <ul className="flex flex-col gap-3">
                  {upcoming.slice(0, 4).map((item) => (
                    <ListRow
                      key={item.id}
                      icon={CalendarIcon}
                      title={shortDay(item.date)}
                      subtitle={`${item.time} · ${item.detail}`}
                    />
                  ))}
                </ul>
              )}
            </GlassCard>
          </div>
        </>
      )}
    </div>
  );
}