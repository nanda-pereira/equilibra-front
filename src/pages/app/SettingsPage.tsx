import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import GlassCard from "../../components/app/GlassCard";
import PageHeader from "../../components/app/PageHeader";
import SmallButton from "../../components/app/SmallButton";
import Switch from "../../components/app/Switch";
import {
  resetPreferences,
  setPreference,
  usePreferences,
  type TextSize,
} from "../../modules/app/preferences";
import { PROFILE_LABELS } from "../../modules/auth/types";
import { useSession } from "../../modules/session/session";

const SIZES: { id: TextSize; label: string }[] = [
  { id: "normal", label: "Padrão" },
  { id: "large", label: "Grande" },
  { id: "xlarge", label: "Muito grande" },
];

export default function SettingsPage() {
  const { session, signOut } = useSession();
  const prefs = usePreferences();
  const navigate = useNavigate();

  const [notice, setNotice] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const handlePasswordChange = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (changingPassword) return;

    setPasswordError("");
    setPasswordSuccess("");

    const activeSession = session;

    if (!activeSession?.accessToken) {
      setPasswordError(
        "Sua sessão expirou. Entre novamente para alterar a senha.",
      );
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Preencha todos os campos.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError(
        "A nova senha deve ter pelo menos 8 caracteres.",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        "A confirmação não corresponde à nova senha.",
      );
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError(
        "A nova senha deve ser diferente da atual.",
      );
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL;

    if (!apiUrl) {
      setPasswordError(
        "A API não está configurada. Não foi possível alterar a senha.",
      );
      return;
    }

    setChangingPassword(true);

    try {
      const response = await fetch(`${apiUrl}/auth/password`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${activeSession.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        const message = result?.error?.message ?? result?.message;

        throw new Error(
          Array.isArray(message)
            ? message.join(" ")
            : typeof message === "string"
              ? message
              : "Não foi possível alterar a senha. Confira a senha atual e tente novamente.",
        );
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess("Senha alterada com sucesso.");
    } catch (error) {
      setPasswordError(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao alterar a senha.",
      );
    } finally {
      setChangingPassword(false);
    }
  };

  if (!session) return null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Configurações"
        subtitle="Preferências do aplicativo"
      />

      <GlassCard title="Aparência e leitura">
        <p
          id="text-size-label"
          className="text-base font-medium text-ink"
        >
          Tamanho do texto
        </p>

        <div
          role="group"
          aria-labelledby="text-size-label"
          className="mt-3 flex flex-wrap gap-2.5"
        >
          {SIZES.map((size) => {
            const active = prefs.textSize === size.id;

            return (
              <button
                key={size.id}
                type="button"
                aria-pressed={active}
                onClick={() => setPreference("textSize", size.id)}
                className={`inline-flex h-11 items-center rounded-full px-5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action ${
                  active
                    ? "bg-action text-white shadow-[0_8px_20px_rgba(36,116,119,0.25)]"
                    : "border border-brand text-action hover:bg-mint-100"
                }`}
              >
                {size.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4 border-t border-line pt-2">
          <Switch
            label="Mais contraste"
            description="Deixa textos secundários e bordas mais escuros."
            checked={prefs.highContrast}
            onChange={(value) =>
              setPreference("highContrast", value)
            }
          />

          <Switch
            label="Reduzir animações"
            description="Diminui transições e movimentos na tela."
            checked={prefs.reduceMotion}
            onChange={(value) =>
              setPreference("reduceMotion", value)
            }
          />
        </div>
      </GlassCard>

      <GlassCard title="Assistente e lembretes">
        <Switch
          label="Mostrar o botão do assistente"
          description="Botão flutuante com um resumo do seu dia."
          checked={prefs.showAssistant}
          onChange={(value) =>
            setPreference("showAssistant", value)
          }
        />

        <Switch
          label="Lembretes de medicamentos"
          description="Inclui os medicamentos do dia no resumo do assistente."
          checked={prefs.medReminders}
          onChange={(value) =>
            setPreference("medReminders", value)
          }
        />

        <Switch
          label="Lembretes de consultas"
          description="Inclui as consultas no resumo do assistente."
          checked={prefs.apptReminders}
          onChange={(value) =>
            setPreference("apptReminders", value)
          }
        />
      </GlassCard>

      <GlassCard
        title="Preferências"
        description="Restaure as configurações de aparência, acessibilidade e lembretes para os valores padrão."
      >
        <SmallButton
          onClick={() => {
            resetPreferences();
            setNotice("Preferências restauradas.");
          }}
        >
          Restaurar preferências
        </SmallButton>

        <p
          role="status"
          className="mt-3 min-h-5 text-sm text-success-text"
        >
          {notice}
        </p>
      </GlassCard>


      <GlassCard title="Segurança da conta">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#EAF5F2] text-[#247477]">
              <svg
                viewBox="0 0 24 24"
                width="21"
                height="21"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="4" y="10" width="16" height="11" rx="2.5" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                <path d="M12 14v3" />
              </svg>
            </div>

            <div className="min-w-0">
              <h3 className="font-medium text-ink">
                Senha da conta
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                Mantenha seus dados protegidos. Você pode atualizar sua senha
                quando precisar.
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <SmallButton
              variant="solid"
              onClick={() => {
                setPasswordError("");
                setPasswordSuccess("");
                setIsPasswordModalOpen(true);
              }}
            >
              Trocar senha
            </SmallButton>
          </div>
        </div>
      </GlassCard>

      {isPasswordModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#123F42]/35 px-4 py-6 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !changingPassword
            ) {
              setIsPasswordModalOpen(false);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape" && !changingPassword) {
              setIsPasswordModalOpen(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="change-password-title"
            className="my-auto w-full max-w-[520px] overflow-hidden rounded-[28px] border border-[#DCECE8] bg-[#F4F9F8] shadow-[0_24px_70px_rgba(18,63,66,0.22)]"
          >
            <header className="flex items-start justify-between gap-4 border-b border-[#E0ECE8] bg-white px-5 py-5 sm:px-7">
              <div>
                <h2
                  id="change-password-title"
                  className="text-lg font-semibold tracking-tight text-[#123F42]"
                >
                  Trocar senha
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-[#586463]">
                  Confirme sua senha atual e escolha uma nova.
                </p>
              </div>

              <button
                type="button"
                aria-label="Fechar janela de troca de senha"
                disabled={changingPassword}
                onClick={() => setIsPasswordModalOpen(false)}
                className="flex size-10 shrink-0 items-center justify-center rounded-full text-[#586463] transition-colors hover:bg-[#F0F6F4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#247477] disabled:opacity-50"
              >
                <span aria-hidden="true" className="text-2xl leading-none">
                  ×
                </span>
              </button>
            </header>

            <form
              className="flex flex-col gap-4 px-5 py-6 sm:px-7"
              onSubmit={handlePasswordChange}
            >
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="current-password"
                  className="text-sm font-medium text-ink"
                >
                  Senha atual
                </label>

                <input
                  id="current-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={currentPassword}
                  onChange={(event) =>
                    setCurrentPassword(event.target.value)
                  }
                  className="h-14 w-full rounded-full border border-line bg-white px-5 text-base text-ink outline-none transition focus:border-action focus:ring-2 focus:ring-action/20"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="new-password"
                  className="text-sm font-medium text-ink"
                >
                  Nova senha
                </label>

                <input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={newPassword}
                  onChange={(event) =>
                    setNewPassword(event.target.value)
                  }
                  className="h-14 w-full rounded-full border border-line bg-white px-5 text-base text-ink outline-none transition focus:border-action focus:ring-2 focus:ring-action/20"
                />
                <p className="pl-4 text-xs text-ink-soft">
                  Utilize pelo menos 8 caracteres.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="confirm-password"
                  className="text-sm font-medium text-ink"
                >
                  Confirmar nova senha
                </label>

                <input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  className="h-14 w-full rounded-full border border-line bg-white px-5 text-base text-ink outline-none transition focus:border-action focus:ring-2 focus:ring-action/20"
                />
              </div>

              {passwordError && (
                <p
                  role="alert"
                  className="rounded-[20px] bg-error-bg px-4 py-3 text-sm text-error-text"
                >
                  {passwordError}
                </p>
              )}

              {passwordSuccess && (
                <p
                  role="status"
                  className="rounded-[20px] bg-success-bg px-4 py-3 text-sm text-success-text"
                >
                  {passwordSuccess}
                </p>
              )}

              <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <SmallButton
                  onClick={() => setIsPasswordModalOpen(false)}
                >
                  {passwordSuccess ? "Concluir" : "Cancelar"}
                </SmallButton>

                {!passwordSuccess && (
                  <SmallButton type="submit" variant="solid">
                    {changingPassword
                      ? "Alterando senha..."
                      : "Alterar senha"}
                  </SmallButton>
                )}
              </div>
            </form>
          </section>
        </div>
      )}

      <GlassCard title="Conta">
        <p className="text-base text-ink">
          {session.name} · {
            session.profile === "admin"
              ? "Administrador"
              : PROFILE_LABELS[session.profile]
          }
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <SmallButton to="/app/perfil">
            Meu perfil
          </SmallButton>

          <SmallButton
            onClick={() => {
              signOut();
              navigate("/login");
            }}
          >
            Sair
          </SmallButton>
        </div>
      </GlassCard>
    </div>
  );
}