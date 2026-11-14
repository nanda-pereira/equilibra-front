
import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router";
import { useSession } from "../../modules/session/session";
import logo from "../../assets/pedras-logo.svg";

const API_URL: string | undefined = import.meta.env.VITE_API_URL;

type Professional = {
  _id: string;
  fullName: string;
  email: string;
  role: "PROFESSIONAL" | "NEUROLOGIST";
  createdAt: string;
};

type PendingResponse = {
  success?: boolean;
  data?: Professional[];
  message?: string | string[];
  error?: { message?: string | string[] };
};

function getMessage(result: PendingResponse | null): string | undefined {
  const message = result?.error?.message ?? result?.message;
  return Array.isArray(message) ? message.join(" ") : message;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data indisponível";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getRoleLabel(role: Professional["role"]) {
  return role === "NEUROLOGIST"
    ? "Neurologista"
    : "Profissional de saúde";
}

export default function AdminPage() {
  const { session, signOut } = useSession();

  const [selectedProfessional, setSelectedProfessional] =
    useState<Professional | null>(null);

  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const loadPendingProfessionals = useCallback(async () => {
    if (!API_URL) {
      setError(
        "A API não está configurada. Verifique a variável VITE_API_URL.",
      );
      setLoading(false);
      return;
    }

    if (!session?.accessToken) {
      setError(
        "Sua sessão não possui um token de acesso. Entre novamente.",
      );
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL.replace(/\/$/, "")}/admin/professionals/pending`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        },
      );

      const result = (await response.json().catch(() => null)) as
        | PendingResponse
        | null;

      if (!response.ok || !result?.success || !Array.isArray(result.data)) {
        throw new Error(
          getMessage(result) ??
            "Não foi possível carregar os profissionais pendentes.",
        );
      }

      setProfessionals(result.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocorreu um erro ao carregar os profissionais.",
      );
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken]);

  useEffect(() => {
    void loadPendingProfessionals();
  }, [loadPendingProfessionals]);

  async function handleApprove(professional: Professional) {
    if (!API_URL || !session?.accessToken) {
      setError("Não foi possível validar sua sessão. Entre novamente.");
      return;
    }

    setApprovingId(professional._id);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `${API_URL.replace(/\/$/, "")}/admin/professionals/${encodeURIComponent(
          professional._id,
        )}/verify`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        },
      );

      const result = (await response.json().catch(() => null)) as
        | PendingResponse
        | null;

      if (!response.ok || result?.success === false) {
        throw new Error(
          getMessage(result) ??
            "Não foi possível aprovar este profissional.",
        );
      }

      setSelectedProfessional(null);
      setNotice(`${professional.fullName} foi aprovado com sucesso.`);
      await loadPendingProfessionals();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocorreu um erro ao aprovar o profissional.",
      );
    } finally {
      setApprovingId(null);
    }
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (session.profile !== "admin") {
    return <Navigate to="/app" replace />;
  }

  return (
    <main className="relative isolate min-h-svh overflow-hidden bg-page px-5 py-8 sm:px-8 lg:px-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-32 -z-10 size-96 rounded-full bg-mint-200/60 blur-[100px]"
      />

      <div className="mx-auto w-full max-w-[1200px]">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo do Equilibra" className="h-10 w-auto" />
            <span className="font-semibold tracking-[0.25em] text-deep">
              EQUILIBRA
            </span>
          </div>

          <button
            type="button"
            onClick={signOut}
            className="min-h-12 rounded-full border border-line bg-white/70 px-6 text-sm font-medium text-action transition-colors hover:bg-mint-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
          >
            Sair
          </button>
        </header>

        <section className="mt-12">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-action">
            Administração
          </p>

          <h1 className="mt-3 text-3xl font-medium leading-tight text-deep sm:text-4xl">
            Painel administrativo
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-soft">
            Gerencie as solicitações de aprovação dos profissionais que
            desejam fazer parte do Equilibra.
          </p>
        </section>

        <section
          aria-labelledby="approval-title"
          className="glass-card mt-8 rounded-[32px] p-6 sm:p-8"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 id="approval-title" className="text-xl font-medium text-deep">
                Aprovação de profissionais
              </h2>
              <p className="mt-2 text-base leading-relaxed text-ink-soft">
                Confira os cadastros antes de liberar o acesso à plataforma.
              </p>
            </div>

            <span className="rounded-full border border-line bg-white/80 px-4 py-2 text-sm font-medium text-deep">
              {professionals.length}{" "}
              {professionals.length === 1 ? "pendente" : "pendentes"}
            </span>
          </div>

          {notice && (
            <p
              role="status"
              className="mt-6 rounded-2xl border border-[#C5E3E0] bg-white/80 p-4 text-base text-deep"
            >
              {notice}
            </p>
          )}

          {error && (
            <div
              role="alert"
              className="mt-6 rounded-2xl border border-red-200 bg-white/80 p-4"
            >
              <p className="text-sm leading-relaxed text-alert-text">
                {error}
              </p>
              <button
                type="button"
                onClick={() => void loadPendingProfessionals()}
                className="mt-3 min-h-11 rounded-full border border-line px-5 text-sm font-medium text-action hover:bg-mint-100"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {loading ? (
            <div
              role="status"
              className="mt-8 rounded-2xl bg-white/60 px-5 py-10 text-center"
            >
              <p className="text-base text-ink-soft">
                Carregando solicitações...
              </p>
            </div>
          ) : !error && professionals.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-line bg-white/60 px-5 py-10 text-center">
              <h3 className="text-lg font-medium text-deep">
                Tudo em dia por aqui
              </h3>
              <p className="mt-2 text-base leading-relaxed text-ink-soft">
                Não há profissionais aguardando aprovação neste momento.
              </p>
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              {professionals.map((professional) => (
                <article
                  key={professional._id}
                  className="rounded-3xl border border-line bg-white/75 p-5 sm:p-6"
                >
                  <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                    <div className="min-w-0">
                      <span className="inline-flex rounded-full bg-mint-100 px-3 py-1.5 text-sm font-medium text-deep">
                        {getRoleLabel(professional.role)}
                      </span>

                      <h3 className="mt-3 break-words text-lg font-medium text-deep">
                        {professional.fullName}
                      </h3>

                      <p className="mt-1 break-all text-base text-ink-soft">
                        {professional.email}
                      </p>

                      <p className="mt-2 text-sm text-ink-soft">
                        Cadastro em {formatDate(professional.createdAt)}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={approvingId !== null}
                      onClick={() => setSelectedProfessional(professional)}
                      className="min-h-12 shrink-0 rounded-full bg-action px-6 text-sm font-medium text-white transition-colors hover:bg-action-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {approvingId === professional._id
                        ? "Aprovando..."
                        : "Aprovar profissional"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {!loading && (
            <button
              type="button"
              onClick={() => void loadPendingProfessionals()}
              className="mt-6 min-h-12 rounded-full border border-line bg-white/70 px-6 text-sm font-medium text-action transition-colors hover:bg-mint-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
            >
              Atualizar lista
            </button>
          )}
        </section>
      </div>

      {selectedProfessional && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#123F42]/40 p-4 backdrop-blur-sm"
          onClick={() => {
            if (approvingId === null) {
              setSelectedProfessional(null);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="approval-modal-title"
            className="w-full max-w-md rounded-[28px] border border-white/70 bg-[#F4F9F8] p-7 shadow-2xl sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-[#E1F0ED] text-[#247477]">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="size-6"
              >
                <path
                  d="m5 12 4 4L19 6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h2
              id="approval-modal-title"
              className="text-xl font-semibold text-[#123F42]"
            >
              Aprovar profissional?
            </h2>

            <p className="mt-3 text-base leading-relaxed text-[#586463]">
              Confirma a aprovação do cadastro de{" "}
              <strong className="font-semibold text-[#282B2D]">
                {selectedProfessional.fullName}
              </strong>
              ? O profissional poderá acessar os recursos liberados para sua
              conta.
            </p>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={approvingId !== null}
                onClick={() => setSelectedProfessional(null)}
                className="min-h-12 rounded-full border border-[#788685] bg-white px-5 font-medium text-[#282B2D] transition hover:bg-[#EAF2F0] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={approvingId !== null}
                onClick={() => {
                  if (selectedProfessional) {
                    void handleApprove(selectedProfessional);
                  }
                }}
                className="min-h-12 rounded-full bg-[#247477] px-5 font-medium text-white transition hover:bg-[#1B5E60] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {approvingId === selectedProfessional._id
                  ? "Aprovando..."
                  : "Confirmar aprovação"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}