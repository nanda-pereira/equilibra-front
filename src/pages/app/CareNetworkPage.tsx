import { useState, type ReactNode } from "react";
import { Navigate } from "react-router";
import Avatar from "../../components/app/Avatar";
import EmptyState from "../../components/app/EmptyState";
import GlassCard from "../../components/app/GlassCard";
import Modal from "../../components/app/Modal";
import PageHeader from "../../components/app/PageHeader";
import SmallButton from "../../components/app/SmallButton";
import StatusBadge from "../../components/app/StatusBadge";
import Input from "../../components/ui/Input";
import usePatientDashboardCareNetwork, {
  relationshipLabels,
  statusLabels,
} from "../../hooks/usePatientDashboardCareNetwork";
import { useSession } from "../../modules/session/session";

const ROLE_OPTIONS = [
  {
    value: "CLINICAL_CAREGIVER",
    title: "Cuidador clínico",
    description: "Acompanha o cuidado conforme as permissões que você der. Pode ter a troca de mensagens habilitada por você.",
  },
  {
    value: "HOME_CAREGIVER",
    title: "Cuidador domiciliar",
    description: "Ajuda no dia a dia, com acesso operacional restrito e sem acesso amplo ao prontuário.",
  },
] as const;

function Callout({ children }: { children: ReactNode }) {
  return <p className="rounded-[20px] bg-info-bg px-4 py-3 text-sm text-info-text">{children}</p>;
}

export default function CareNetworkPage() {
  const { session } = useSession();
  const {
    loading,
    error,
    email,
    setEmail,
    caregiverRole,
    setCaregiverRole,
    foundUser,
    setFoundUser,
    searching,
    sending,
    feedback,
    setFeedback,
    activePeople,
    pendingPeople,
    loadCareNetwork,
    handleSearch,
    handleInvite,
    enablingCommunicationId,
    handleEnableCommunication,
    removingCaregiverId,
    handleRevokeCaregiver,
  } = usePatientDashboardCareNetwork(session?.accessToken, session?.userId);

  const [confirmId, setConfirmId] = useState("");

  const [removeConfirmId, setRemoveConfirmId] = useState("");
  const [removeConfirmName, setRemoveConfirmName] = useState("");

  if (!session) return null;
  if (session.profile !== "paciente") return <Navigate to="/app/inicio" replace />;

  const confirming = activePeople.find((person) => person.linkId === confirmId);

  async function confirmEnable() {
    if (!confirming) return;
    await handleEnableCommunication(confirming.linkId);
    setConfirmId("");
  }

  async function confirmRemoveCaregiver() {
    if (!removeConfirmId || removingCaregiverId) return;

    const removed = await handleRevokeCaregiver(removeConfirmId);

    if (removed) {
      setRemoveConfirmId("");
      setRemoveConfirmName("");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Minha rede de cuidado"
        subtitle="Convide cuidadores e escolha com quem conversar"
      />

      {feedback && (
        <div
          role={feedback.type === "error" ? "alert" : "status"}
          className={`flex flex-wrap items-center justify-between gap-3 rounded-[20px] px-4 py-3 text-sm ${
            feedback.type === "success"
              ? "bg-success-bg text-success-text"
              : "bg-alert-bg text-alert-text"
          }`}
        >
          <p>{feedback.message}</p>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="min-h-11 rounded-full px-3 font-medium underline underline-offset-4"
          >
            Dispensar
          </button>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        {/* ----- rede e convites ----- */}
        <div className="flex flex-col gap-6">
          <GlassCard
            title="Sua rede"
            description="Pessoas com vínculo ativo. O vínculo não libera as mensagens automaticamente."
            action={
              <span className="rounded-full bg-mint-100 px-3 py-1 text-sm text-action-hover">
                {activePeople.length}
              </span>
            }
          >
            {loading ? (
              <p className="py-3 text-sm text-ink-soft">Carregando sua rede de cuidado…</p>
            ) : error ? (
              <div className="flex flex-col items-start gap-3">
                <p role="alert" className="text-sm text-alert-text">
                  {error}
                </p>
                <SmallButton onClick={() => void loadCareNetwork()}>Tentar novamente</SmallButton>
              </div>
            ) : activePeople.length === 0 ? (
              <EmptyState
                title="Sua rede ainda está vazia"
                description="Convide um cuidador pelo e-mail. Ele aparece aqui quando aceitar o convite."
              />
            ) : (
              <ul className="flex flex-col gap-4">
                {activePeople.map((person) => {
                  const clinical = person.relationship === "CLINICAL_CAREGIVER";
                  
                  return (
                    <li key={person.id} className="flex flex-col gap-3 rounded-[20px] bg-mint-100/70 p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Avatar name={person.name} tone="soft" className="bg-white!" />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-medium text-ink">
                        {person.name}
                      </p>

                      <span
                        className={`mt-1 inline-flex rounded-full px-3 py-0.5 text-xs font-medium ${
                          clinical
                            ? "bg-info-bg text-info-text"
                            : "bg-white text-action-hover"
                        }`}
                      >
                        {person.role}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusBadge
                        status="stable"
                        label={statusLabels[person.status] ?? "Vínculo ativo"}
                      />

                      <button
                        type="button"
                        title={`Remover ${person.name} da rede de cuidado`}
                        aria-label={`Remover ${person.name} da rede de cuidado`}
                        onClick={() => {
                          setRemoveConfirmId(person.linkId);
                          setRemoveConfirmName(person.name);
                        }}
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M3 6h18" />
                          <path d="M8 6V4h8v2" />
                          <path d="m19 6-1 14H6L5 6" />
                          <path d="M10 11v5" />
                          <path d="M14 11v5" />
                        </svg>
                      </button>
                    </div>
                  </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </GlassCard>

          <GlassCard
            title="Convites enviados"
            action={
              <span className="rounded-full bg-mint-100 px-3 py-1 text-sm text-action-hover">
                {pendingPeople.length}
              </span>
            }
          >
            {loading ? (
              <p className="py-3 text-sm text-ink-soft">Carregando convites…</p>
            ) : pendingPeople.length === 0 ? (
              <EmptyState title="Nenhum convite pendente" />
            ) : (
              <ul className="flex flex-col gap-3">
                {pendingPeople.map((person) => (
                  <li key={person.id} className="flex flex-wrap items-center gap-4 rounded-[20px] bg-mint-100/70 px-4 py-3">
                    <Avatar name={person.name} tone="soft" className="bg-white!" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-medium text-ink">{person.name}</p>
                      <p className="text-sm text-ink-soft">{person.role}</p>
                    </div>
                    <StatusBadge status="info" label="Aguardando resposta" />
                  </li>
                ))}
              </ul>
            )}
          </GlassCard>
        </div>

        {/* ----- convidar (no celular aparece primeiro) ----- */}
        <div className="order-first xl:order-last">
          <GlassCard
            title="Convidar um cuidador"
            description="Ele precisa ter conta no Equilibra e aceitar o convite para entrar na sua rede."
          >
            <form onSubmit={handleSearch} noValidate className="flex flex-col">
              <fieldset className="mb-4 min-w-0">
                <legend className="mb-2.5 text-base text-ink">Tipo de cuidador</legend>
                <div className="grid gap-3">
                  {ROLE_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className="flex cursor-pointer flex-col gap-1 rounded-[20px] border border-mint-200 bg-white/60 px-4 py-3 transition-shadow hover:shadow-[0_8px_32px_rgba(36,116,119,0.12)] has-[:checked]:shadow-[0_12px_40px_rgba(36,116,119,0.32)] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-action"
                    >
                      <input
                        type="radio"
                        name="caregiver-role"
                        value={option.value}
                        checked={caregiverRole === option.value}
                        onChange={() => {
                          setCaregiverRole(option.value as typeof caregiverRole);
                          setFoundUser(null);
                          setFeedback(null);
                        }}
                        className="sr-only"
                      />
                      <span className="text-base font-medium text-ink">{option.title}</span>
                      <span className="text-sm text-ink-soft">{option.description}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <Input
                label="E-mail do cuidador"
                type="email"
                placeholder="nome@exemplo.com"
                autoComplete="off"
                required
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setFoundUser(null);
                  setFeedback(null);
                }}
              />

              <SmallButton type="submit" variant="solid">
                {searching ? "Buscando…" : "Buscar cuidador"}
              </SmallButton>
            </form>

            {foundUser && (
              <div className="mt-5 flex flex-col gap-4 rounded-[20px] bg-mint-100/70 p-4">
                <div className="flex items-center gap-3">
                  <Avatar name={foundUser.fullName ?? foundUser.email ?? "Cuidador"} tone="soft" className="bg-white!" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-medium text-ink">
                      {foundUser.fullName ?? "Conta encontrada"}
                    </p>
                    <p className="break-all text-sm text-ink-soft">{foundUser.email}</p>
                    <p className="mt-1 text-xs text-ink-soft">
                      {relationshipLabels[foundUser.role] ?? foundUser.role}
                    </p>
                  </div>
                </div>
                <SmallButton variant="solid" onClick={handleInvite}>
                  {sending ? "Enviando convite…" : "Enviar convite"}
                </SmallButton>
                <p className="text-sm text-ink-soft">
                  O convite fica pendente até a pessoa aceitar.
                </p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      <Callout>
        A comunicação por mensagens depende do seu consentimento: ela só é liberada para um cuidador
        clínico depois que você habilita aqui.
      </Callout>

      <Modal open={Boolean(confirming)} title="Habilitar comunicação?" onClose={() => setConfirmId("")}>
        {confirming && (
          <div className="flex flex-col gap-5">
            <p className="text-base text-ink">
              Ao habilitar, <strong>{confirming.name}</strong> poderá ler e enviar mensagens na sua conversa
              dentro do Equilibra.
            </p>
            <div className="flex flex-wrap gap-3">
              <SmallButton variant="solid" onClick={() => void confirmEnable()}>
                {enablingCommunicationId === confirming.linkId ? "Habilitando…" : "Habilitar"}
              </SmallButton>
              <SmallButton onClick={() => setConfirmId("")}>Cancelar</SmallButton>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={Boolean(removeConfirmId)}
        title="Remover cuidador da sua rede?"
        onClose={() => {
          if (removingCaregiverId) return;
          setRemoveConfirmId("");
          setRemoveConfirmName("");
        }}
      >
        <div className="flex flex-col gap-5">
          <p className="text-base text-ink">
            Tem certeza de que deseja remover{" "}
            <strong>{removeConfirmName}</strong> da sua rede de cuidado?
            Essa pessoa perderá o acesso concedido por esse vínculo.
            A conta e o histórico não serão apagados.
          </p>

          <div className="flex flex-wrap gap-3">
            <SmallButton
              variant="solid"
              onClick={() => void confirmRemoveCaregiver()}
              disabled={removingCaregiverId === removeConfirmId}
            >
              {removingCaregiverId === removeConfirmId
                ? "Removendo…"
                : "Confirmar remoção"}
            </SmallButton>

            <SmallButton
              disabled={removingCaregiverId === removeConfirmId}
              onClick={() => {
                setRemoveConfirmId("");
                setRemoveConfirmName("");
              }}
            >
              Cancelar
            </SmallButton>
          </div>
        </div>
      </Modal>
    </div>
  );
}