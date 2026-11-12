
import { useEffect, useState, type FormEvent } from "react";
import GlassCard from "../../components/app/GlassCard";
import Info from "../../components/app/Info";
import PageHeader from "../../components/app/PageHeader";
import SmallButton from "../../components/app/SmallButton";
import Input from "../../components/ui/Input";
import { PROFILE_LABELS } from "../../modules/auth/types";
import {
  formatPhone,
  onlyDigits,
} from "../../modules/auth/validation";
import { useSession } from "../../modules/session/session";
import {
  getMyPatientProfile,
  getMyUserProfile,
  updateMyPatientProfile,
  updateMyUserProfile,
  type PatientProfile,
  type UserProfileData,
} from "../../services/api/patients";

type Draft = {
  name: string;
  phone: string;
  emergencyName: string;
  emergencyPhone: string;
};

type Errors = Partial<Record<keyof Draft, string>>;

function validate(draft: Draft, isPatient: boolean): Errors {
  const errors: Errors = {};

  if (draft.name.trim().split(/\s+/).length < 2) {
    errors.name = "Informe nome e sobrenome";
  }

  if (onlyDigits(draft.phone).length < 10) {
    errors.phone = "Telefone inválido";
  }

  if (
    isPatient &&
    draft.emergencyPhone &&
    onlyDigits(draft.emergencyPhone).length < 10
  ) {
    errors.emergencyPhone = "Telefone inválido";
  }

  return errors;
}


function getEmergencyContact(patient?: PatientProfile) {
  const contacts = patient?.emergencyContacts;

  const contact = Array.isArray(contacts)
    ? contacts[0]
    : contacts;

  if (!contact || typeof contact !== "object") {
    return { name: "", phone: "", relationship: "" };
  }

  return {
    name: String(contact.name ?? ""),
    phone: String(contact.phone ?? ""),
    relationship: String(contact.relationship ?? ""),
  };
}

export default function ProfilePage() {
  const { session, signIn } = useSession();

  const [user, setUser] = useState<UserProfileData | null>(null);
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [patientId, setPatientId] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const isPatient = session?.profile === "paciente";
  const editing = draft !== null;
  const errors = draft ? validate(draft, Boolean(isPatient)) : {};

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      if (!session?.accessToken) {
        setError("Sua sessão não possui um token de acesso. Entre novamente.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const userData = await getMyUserProfile(session.accessToken);

        let patientData: PatientProfile | null = null;
        let id = "";

        if (session.profile === "paciente") {
          patientData = await getMyPatientProfile(session.accessToken, session?.userId ?? "");
          id = String(patientData.id ?? patientData._id ?? "");
        }

        if (cancelled) return;

        setUser(userData);
        setPatient(patientData);
        setPatientId(id);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Não foi possível carregar seu perfil.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [session?.accessToken, session?.profile, session?.userId]);

  if (!session) return null;

  const emergency = getEmergencyContact(patient ?? undefined);

  const set = (patch: Partial<Draft>) => {
    setDraft((current) =>
      current ? { ...current, ...patch } : current,
    );
  };

  const startEditing = () => {
    if (!user) return;

    setDraft({
      name: user.fullName ?? session.name,
      phone: formatPhone(user.phone ?? ""),
      emergencyName: emergency.name,
      emergencyPhone: formatPhone(emergency.phone),
    });

    setSubmitted(false);
    setSaved(false);
    setError("");
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);

    if (!draft || Object.keys(errors).length > 0 || !user) return;

    if (!session.accessToken) {
      setError("Sua sessão expirou. Entre novamente.");
      return;
    }

    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const updatedUser = await updateMyUserProfile(
        session.accessToken,
        {
          fullName: draft.name.trim(),
          phone: onlyDigits(draft.phone),
        },
      );

      let updatedPatient = patient;

      if (isPatient) {
        if (!patientId) {
          throw new Error("Não foi possível identificar seu perfil de paciente.");
        }

        updatedPatient = await updateMyPatientProfile(
          session.accessToken,
          patientId,
          {
            emergencyContacts: {
              name: draft.emergencyName.trim(),
              phone: onlyDigits(draft.emergencyPhone),
              relationship: emergency.relationship,
            },
          },
        );

        setPatient(updatedPatient);
      }

      setUser(updatedUser);

      signIn({
        ...session,
        name: updatedUser.fullName,
        email: updatedUser.email,
      });

      setDraft(null);
      setSaved(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível salvar as alterações.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Meu perfil"
        subtitle={PROFILE_LABELS[session.profile]}
      >
        {!editing && user && (
          <SmallButton onClick={startEditing}>
            Editar dados
          </SmallButton>
        )}
      </PageHeader>

      {loading && (
        <GlassCard title="Carregando perfil">
          <p className="text-base text-ink-soft">
            Buscando seus dados no servidor...
          </p>
        </GlassCard>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-[20px] bg-error-bg px-4 py-3 text-sm text-error-text"
        >
          {error}
        </p>
      )}

      {saved && !editing && (
        <p
          role="status"
          className="rounded-[20px] bg-success-bg px-4 py-3 text-sm text-success-text"
        >
          Alterações salvas com sucesso.
        </p>
      )}

      {!loading && user && (
        <>
          {editing && draft ? (
            <GlassCard title="Editar dados">
              <form noValidate onSubmit={handleSave}>
                <div className="grid gap-x-6 sm:grid-cols-2">
                  <Input
                    label="Nome completo"
                    autoComplete="name"
                    value={draft.name}
                    onChange={(e) => set({ name: e.target.value })}
                    error={submitted ? errors.name : undefined}
                  />

                  <Input
                    label="E-mail"
                    type="email"
                    autoComplete="email"
                    value={user.email ?? ""}
                    disabled
                  />

                  <Input
                    label="Telefone"
                    inputMode="numeric"
                    autoComplete="tel"
                    maxLength={15}
                    value={draft.phone}
                    onChange={(e) =>
                      set({ phone: formatPhone(e.target.value) })
                    }
                    error={submitted ? errors.phone : undefined}
                  />

                  {isPatient && (
                    <>
                      <Input
                        label="Contato de emergência (nome)"
                        autoComplete="off"
                        value={draft.emergencyName}
                        onChange={(e) =>
                          set({ emergencyName: e.target.value })
                        }
                      />

                      <Input
                        label="Contato de emergência (telefone)"
                        inputMode="numeric"
                        autoComplete="off"
                        maxLength={15}
                        value={draft.emergencyPhone}
                        onChange={(e) =>
                          set({
                            emergencyPhone: formatPhone(e.target.value),
                          })
                        }
                        error={
                          submitted ? errors.emergencyPhone : undefined
                        }
                      />
                    </>
                  )}
                </div>

                <p className="mt-2 text-sm text-ink-soft">
                  O e-mail não pode ser alterado nesta tela.
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                  <SmallButton type="submit" variant="solid">
                    {saving ? "Salvando..." : "Salvar alterações"}
                  </SmallButton>

                  <SmallButton
                    onClick={() => {
                      setDraft(null);
                      setSubmitted(false);
                      setError("");
                    }}
                  >
                    Cancelar
                  </SmallButton>
                </div>
              </form>
            </GlassCard>
          ) : (
            <GlassCard title="Meus dados">
              <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                <Info label="Nome completo">
                  {user.fullName || "Não informado"}
                </Info>

                <Info label="Perfil">
                  {PROFILE_LABELS[session.profile]}
                </Info>

                <Info label="E-mail">
                  {user.email || "Não informado"}
                </Info>

                <Info label="Telefone">
                  {user.phone || "Não informado"}
                </Info>

                {isPatient && (
                  <Info label="Contato de emergência">
                    {emergency.name
                      ? `${emergency.name}${
                          emergency.phone
                            ? ` · ${formatPhone(emergency.phone)}`
                            : ""
                        }`
                      : "Não informado"}
                  </Info>
                )}
              </dl>
            </GlassCard>
          )}
        </>
      )}

      <GlassCard title="Segurança">
        <p className="text-base text-ink-soft">
          Para alterar sua senha, utilize o fluxo de segurança disponível
          na aplicação, caso esteja habilitado.
        </p>

        <div className="mt-4">
          <SmallButton to="/app/configuracoes">
            Ir para configurações
          </SmallButton>
        </div>
      </GlassCard>
    </div>
  );
}