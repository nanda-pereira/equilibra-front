import { useState, type FormEvent } from "react";
import GlassCard from "../../components/app/GlassCard";
import Info from "../../components/app/Info";
import PageHeader from "../../components/app/PageHeader";
import SmallButton from "../../components/app/SmallButton";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import { PROFILE_LABELS } from "../../modules/auth/types";
import { CAREGIVER_ROLES, DOCTOR_SPECIALTIES } from "../../modules/auth/registerFields";
import { formatPhone, isValidEmail, onlyDigits } from "../../modules/auth/validation";
import {
  getPatientRecord,
  getProfileInfo,
  updateProfileInfo,
  useAppState,
} from "../../modules/demo/appStore";
import { useSession } from "../../modules/session/session";

type Draft = {
  name: string;
  email: string;
  phone: string;
  role: string;
  emergencyName: string;
  emergencyPhone: string;
};

type Errors = Partial<Record<keyof Draft, string>>;

function validate(draft: Draft, hasRole: boolean): Errors {
  const errors: Errors = {};
  if (draft.name.trim().split(/\s+/).length < 2) errors.name = "Informe nome e sobrenome";
  if (!draft.email.trim()) errors.email = "Campo obrigatório";
  else if (!isValidEmail(draft.email)) errors.email = "E-mail inválido";
  if (onlyDigits(draft.phone).length < 10) errors.phone = "Telefone inválido";
  if (hasRole && !draft.role) errors.role = "Selecione uma opção";
  if (draft.emergencyPhone && onlyDigits(draft.emergencyPhone).length < 10) {
    errors.emergencyPhone = "Telefone inválido";
  }
  return errors;
}

export default function ProfilePage() {
  const { session, signIn } = useSession();
  useAppState();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!session) return null;

  const { profile } = session;
  const info = getProfileInfo(profile);
  const record = profile === "paciente" ? getPatientRecord("maria") : undefined;
  const isPatient = profile === "paciente";
  const isDoctor = profile === "medico";
  const hasRole = isDoctor || profile === "cuidador-clinico";
  const roleLabel = isDoctor ? "Especialidade" : "Tipo de atuação";
  const roleOptions = isDoctor ? DOCTOR_SPECIALTIES : CAREGIVER_ROLES;
  const editing = draft !== null;
  const errors = draft ? validate(draft, hasRole) : {};
  const shown = (key: keyof Draft) => (submitted ? errors[key] : undefined);
  const set = (patch: Partial<Draft>) => setDraft((current) => (current ? { ...current, ...patch } : current));

  const startEditing = () => {
    setDraft({
      name: session.name,
      email: info.email,
      phone: info.phone,
      role: info.role,
      emergencyName: info.emergencyName,
      emergencyPhone: info.emergencyPhone,
    });
    setSubmitted(false);
    setSaved(false);
  };

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    if (!draft || Object.keys(errors).length > 0) return;
    updateProfileInfo(profile, {
      ...info,
      email: draft.email.trim(),
      phone: draft.phone,
      role: draft.role,
      emergencyName: draft.emergencyName.trim(),
      emergencyPhone: draft.emergencyPhone,
    });
    signIn({ profile, name: draft.name.trim() });
    setDraft(null);
    setSaved(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Meu perfil" subtitle={PROFILE_LABELS[profile]} demo>
        {!editing && <SmallButton onClick={startEditing}>Editar dados</SmallButton>}
      </PageHeader>

      {saved && !editing && (
        <p role="status" className="rounded-[20px] bg-success-bg px-4 py-3 text-sm text-success-text">
          Dados atualizados. Como é uma demonstração, as alterações não são enviadas a um servidor.
        </p>
      )}

      {draft ? (
        <GlassCard title="Editar dados">
          <form noValidate onSubmit={handleSave}>
            <div className="grid gap-x-6 sm:grid-cols-2">
              <Input
                label="Nome completo"
                autoComplete="name"
                value={draft.name}
                onChange={(e) => set({ name: e.target.value })}
                error={shown("name")}
              />
              <Input
                label="E-mail"
                type="email"
                autoComplete="email"
                value={draft.email}
                onChange={(e) => set({ email: e.target.value })}
                error={shown("email")}
              />
              <Input
                label="Telefone"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={15}
                value={draft.phone}
                onChange={(e) => set({ phone: formatPhone(e.target.value) })}
                error={shown("phone")}
              />
              {hasRole && (
                <Select
                  label={roleLabel}
                  options={roleOptions}
                  value={draft.role}
                  onChange={(e) => set({ role: e.target.value })}
                  error={shown("role")}
                />
              )}
              {isPatient && (
                <>
                  <Input
                    label="Contato de emergência (nome)"
                    autoComplete="off"
                    value={draft.emergencyName}
                    onChange={(e) => set({ emergencyName: e.target.value })}
                  />
                  <Input
                    label="Contato de emergência (telefone)"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={15}
                    value={draft.emergencyPhone}
                    onChange={(e) => set({ emergencyPhone: formatPhone(e.target.value) })}
                    error={shown("emergencyPhone")}
                  />
                </>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-3">
              <SmallButton type="submit" variant="solid">
                Salvar alterações
              </SmallButton>
              <SmallButton onClick={() => setDraft(null)}>Cancelar</SmallButton>
            </div>
          </form>
        </GlassCard>
      ) : (
        <GlassCard title="Meus dados">
          <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
            <Info label="Nome completo">{session.name}</Info>
            <Info label="Perfil">{PROFILE_LABELS[profile]}</Info>
            <Info label="E-mail">{info.email}</Info>
            <Info label="Telefone">{info.phone}</Info>
            {isPatient && record && <Info label="Data de nascimento">{record.birthDate}</Info>}
            {isPatient && (
              <Info label="Contato de emergência">
                {info.emergencyName
                  ? `${info.emergencyName}${info.emergencyPhone ? ` · ${info.emergencyPhone}` : ""}`
                  : "Não informado"}
              </Info>
            )}
            {isDoctor && <Info label="CRM">{info.registry}</Info>}
            {hasRole && <Info label={roleLabel}>{info.role}</Info>}
          </dl>
        </GlassCard>
      )}

      <GlassCard title="Segurança">
        <p className="text-base text-ink-soft">
          A alteração de senha ficará disponível quando o login estiver integrado ao servidor.
        </p>
        <div className="mt-4">
          <SmallButton to="/app/configuracoes">Ir para configurações</SmallButton>
        </div>
      </GlassCard>
    </div>
  );
}