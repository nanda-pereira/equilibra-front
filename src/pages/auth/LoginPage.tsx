import { useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router";
import AuthLayout from "../../components/layout/AuthLayout";
import Button from "../../components/ui/Button";
import GlassPanel from "../../components/ui/GlassPanel";
import Icon from "../../components/ui/Icon";
import Input from "../../components/ui/Input";
import PasswordInput from "../../components/ui/PasswordInput";
import { CheckIcon } from "../../components/ui/icons";
import { ApiError } from "../../modules/auth/authApi";
import { DEMO_ACCOUNTS, isDemoMode, loginUser } from "../../modules/auth/loginApi";
import { useSession } from "../../modules/session/session";

export default function LoginPage() {
  const { session, signIn } = useSession();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(false); // TODO: ainda sem efeito (sem backend)
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [recoveryNotice, setRecoveryNotice] = useState(false);

  if (session) return <Navigate to="/app" replace />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    setFormError("");
    if (!identifier.trim() || !password) return;

    setSubmitting(true);
    try {
      signIn(await loginUser(identifier, password));
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : "Não foi possível entrar agora. Tente novamente.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout background="figma">
      <GlassPanel labelledBy="login-title">
        <div className="grid items-center gap-10 md:grid-cols-[1fr_1.1fr] md:gap-14">
          <div>
            <h1
              id="login-title"
              className="text-[32px] font-medium leading-tight text-deep md:text-[40px] md:leading-[56px]"
            >
              Entrar no Equilibra
            </h1>
            <p className="mt-3 text-base text-ink-soft md:text-xl">
              Mais segurança para estar em movimento.
            </p>

            {isDemoMode && (
              <div className="mt-8">
                <p className="text-sm font-medium text-action-hover">Acessos de demonstração</p>
                <p className="mt-1 text-sm text-ink-soft">
                  Dados fictícios. Escolha um perfil para entrar sem digitar nada.
                </p>
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {DEMO_ACCOUNTS.map((account) => (
                    <button
                      key={account.email}
                      type="button"
                      onClick={() => signIn({ profile: account.profile, name: account.name })}
                      className="inline-flex h-11 items-center rounded-full border border-brand px-5 text-sm text-action transition-colors hover:bg-mint-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
                    >
                      {account.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <form noValidate onSubmit={handleSubmit} className="flex flex-col">
            <Input
              label="E-mail ou número de registro"
              placeholder="nome@email.com"
              autoComplete="username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              error={submitted && !identifier.trim() ? "Campo obrigatório" : undefined}
            />
            <PasswordInput
              label="Senha"
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={submitted && !password ? "Campo obrigatório" : undefined}
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-2.5 text-sm text-ink">
                <span className="relative flex size-[18px] shrink-0">
                  <input
                    type="checkbox"
                    checked={keepSignedIn}
                    onChange={(e) => setKeepSignedIn(e.target.checked)}
                    className="peer absolute inset-0 size-full cursor-pointer appearance-none rounded-full border border-brand bg-white checked:border-action checked:bg-action focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
                  />
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-white opacity-0 peer-checked:opacity-100">
                    <Icon icon={CheckIcon} size={12} strokeWidth={2.5} />
                  </span>
                </span>
                Manter conectado
              </label>

              <button
                type="button"
                onClick={() => setRecoveryNotice(true)}
                className="text-sm font-medium text-action underline underline-offset-4 hover:text-action-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
              >
                Esqueci a senha
              </button>
            </div>

            <p aria-live="polite" className="mt-2 min-h-5 text-sm text-ink-soft">
              {recoveryNotice ? "A recuperação de acesso ainda está em construção." : ""}
            </p>
            <p role="alert" className="min-h-5 text-sm text-alert-text">
              {formError}
            </p>

            <Button
              type="submit"
              variant="primary"
              className="mt-3 w-full bg-action! hover:bg-action-hover!"
            >
              {submitting ? "Entrando…" : "Entrar"}
            </Button>

            <p className="mt-6 text-center text-base text-ink">
              Ainda não tem conta?{" "}
              <Link
                to="/cadastro"
                className="font-semibold text-action underline underline-offset-4 hover:text-action-hover"
              >
                Criar conta
              </Link>
            </p>
          </form>
        </div>
      </GlassPanel>
    </AuthLayout>
  );
}