import { useCallback, useEffect, useRef, useState } from "react";
import logo from "../../assets/pedras-logo.svg";
import { usePreferences } from "../../modules/app/preferences";
import { useSession } from "../../modules/session/session";
import {
  getAccessiblePatients,
  getMyPatientCareNetwork,
  getMyPatientProfileId,
  type PatientCareLink,
  type PatientProfile,
} from "../../services/api/patients";
import { sendChatMessage } from "../../services/api/chatbot";
import Icon from "../ui/Icon";
import { CloseIcon } from "../ui/icons";

type PatientOption = {
  id: string;
  name: string;
};

type DisplayMessage = {
  id: string;
  role: "USER" | "ASSISTANT";
  text: string;
};

const SUGGESTIONS = [
  {
    title: "Consultas",
    text: "Há consultas futuras cadastradas?",
    description: "Consulte seus próximos atendimentos.",
  },
  {
    title: "Exercícios",
    text: "Há planos de exercícios cadastrados?",
    description: "Veja os planos registrados.",
  },
  {
    title: "Medicamentos",
    text: "Quero consultar os registros de medicamentos.",
    description: "Consulte as informações registradas.",
  },
  {
    title: "Monitoramento",
    text: "Existem eventos de monitoramento em aberto?",
    description: "Consulte os eventos registrados.",
  },
];

function getPatientId(patient: PatientProfile): string {
  return patient._id ?? patient.id ?? "";
}

function getPatientName(patient: PatientProfile): string {
  if (typeof patient.userId === "object" && patient.userId) {
    return patient.userId.fullName?.trim() || "Paciente sem nome";
  }

  return "Paciente";
}

function getLinkedPatientId(link: PatientCareLink): string {
  if (typeof link.patientId === "string") {
    return link.patientId;
  }

  return link.patientId?._id ?? link.patientId?.id ?? "";
}

function getLinkedPatientName(link: PatientCareLink): string {
  if (
    typeof link.patientId === "object" &&
    link.patientId &&
    typeof link.patientId.userId === "object" &&
    link.patientId.userId
  ) {
    return link.patientId.userId.fullName?.trim() || "Paciente";
  }

  return "Paciente";
}

function AssistantAvatar({ small = false }: { small?: boolean }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full border border-[#DCECE8] bg-white ${
        small ? "size-7" : "size-9"
      }`}
    >
      <img
        src={logo}
        alt=""
        className={small ? "h-4 w-auto" : "h-5 w-auto"}
      />
    </span>
  );
}

function BotBubble({ text }: { text: string }) {
  return (
    <div className="flex items-end gap-2.5">
      <AssistantAvatar small />

      <div className="max-w-[84%] rounded-[20px] rounded-bl-[6px] border border-[#E4EFEC] bg-white px-4 py-3 shadow-[0_2px_8px_rgba(18,63,66,0.03)]">
        <p className="whitespace-pre-wrap break-words text-[14px] leading-[1.75] text-[#282B2D]">
          {text}
        </p>
      </div>
    </div>
  );
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <p className="max-w-[84%] whitespace-pre-wrap break-words rounded-[20px] rounded-br-[6px] bg-[#247477] px-4 py-3 text-[14px] leading-[1.75] text-white shadow-[0_3px_10px_rgba(36,116,119,0.12)]">
        {text}
      </p>
    </div>
  );
}

function AssistantPanel({ onClose }: { onClose: () => void }) {
  const { session } = useSession();
  const prefs = usePreferences();

  const headingRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [patientId, setPatientId] = useState("");
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [patientError, setPatientError] = useState("");

  const [conversationId, setConversationId] = useState("");
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [draft, setDraft] = useState("");

  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const [disclaimer, setDisclaimer] = useState(
    "Respostas informativas, não diagnósticas. Confirme decisões clínicas com a equipe de saúde.",
  );

  const isPatient = session?.profile === "paciente";
  const hasMessages = messages.length > 0;

  const messageIdCounter = useRef(0);

  const createMessageId = (prefix: string) => {
    messageIdCounter.current += 1;
    return `${prefix}-${messageIdCounter.current}`;
  };

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  // Carrega os perfis clínicos disponíveis para a conta.
  useEffect(() => {
    let cancelled = false;

    async function loadPatients() {
      if (!session?.accessToken) {
        setPatientsLoading(false);
        setPatientError("Sua sessão não possui um token de acesso válido.");
        return;
      }

      setPatientsLoading(true);
      setPatientError("");
      setPatients([]);
      setPatientId("");
      setConversationId("");
      setMessages([]);

      try {
        let options: PatientOption[] = [];

        if (isPatient) {
          if (!session.userId) {
            throw new Error(
              "Não foi possível identificar a conta do paciente.",
            );
          }

          const id = await getMyPatientProfileId(
            session.accessToken,
            session.userId,
          );

          options = [{ id, name: session.name || "Meu perfil" }];
        } else if (session.profile === "medico") {
          const accessible = await getAccessiblePatients(
            session.accessToken,
          );

          options = accessible
            .map((patient) => ({
              id: getPatientId(patient),
              name: getPatientName(patient),
            }))
            .filter((patient) => Boolean(patient.id));
        } else {
          const [links, accessible] = await Promise.all([
            getMyPatientCareNetwork(session.accessToken),
            getAccessiblePatients(session.accessToken),
          ]);

          const accessibleById = new Map(
            accessible
              .map((patient) => [
                getPatientId(patient),
                getPatientName(patient),
              ] as const)
              .filter(([id]) => Boolean(id)),
          );

          const activeLinks = links.filter(
            (link) => link.status === "ACTIVE",
          );

          const seen = new Set<string>();

          options = activeLinks.flatMap((link) => {
            const id = getLinkedPatientId(link);

            if (!id || seen.has(id)) return [];

            seen.add(id);

            return [
              {
                id,
                name:
                  accessibleById.get(id) ||
                  getLinkedPatientName(link),
              },
            ];
          });
        }

        if (!cancelled) {
          setPatients(options);
          setPatientId(options.length === 1 ? options[0].id : "");

          if (options.length === 0) {
            setPatientError(
              "Nenhum paciente disponível para o assistente foi encontrado.",
            );
          }
        }
      } catch (cause) {
        if (!cancelled) {
          setPatientError(
            cause instanceof Error
              ? cause.message
              : "Não foi possível carregar os pacientes.",
          );
        }
      } finally {
        if (!cancelled) setPatientsLoading(false);
      }
    }

    void loadPatients();

    return () => {
      cancelled = true;
    };
  }, [
    session?.accessToken,
    session?.userId,
    session?.name,
    session?.profile,
    isPatient,
  ]);

  // Mantém as mensagens recentes visíveis.
  useEffect(() => {
    const body = bodyRef.current;

    if (body) {
      body.scrollTo({
        top: body.scrollHeight,
        behavior: prefs.reduceMotion ? "auto" : "smooth",
      });
    }
  }, [messages, sending, prefs.reduceMotion]);

  const startNewConversation = useCallback(() => {
    if (sending) return;

    setConversationId("");
    setMessages([]);
    setDraft("");
    setError("");
    inputRef.current?.focus();
  }, [sending]);

  async function sendMessage(text = draft) {
    const message = text.trim();

    if (!session?.accessToken || !patientId || !message || sending) {
      return;
    }

    if (message.length > 1200) {
      setError("A mensagem deve ter no máximo 1.200 caracteres.");
      return;
    }

    const previousDraft = draft;
    const pendingId = createMessageId("pending");

    setDraft("");
    setError("");
    setSending(true);

    setMessages((current) => [
      ...current,
      {
        id: pendingId,
        role: "USER",
        text: message,
      },
    ]);

    try {
      const result = await sendChatMessage(session.accessToken, {
        patientId,
        message,
        ...(conversationId ? { conversationId } : {}),
      });

      setConversationId(result.conversationId);
      setDisclaimer(result.disclaimer);

      setMessages((current) => [
        ...current,
        {
          id: createMessageId("answer"),
          role: "ASSISTANT",
          text: result.message,
        },
      ]);
    } catch (cause) {
      setDraft(previousDraft || message);

      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível enviar a mensagem.",
      );

      setMessages((current) =>
        current.filter((item) => item.id !== pendingId),
      );
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  if (!session) return null;

  return (
    <section
      id="assistant-panel"
      role="dialog"
      aria-modal="false"
      aria-labelledby="assistant-title"
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
      }}
      className="fixed bottom-24 right-4 z-40 flex h-[min(720px,calc(100svh-7.5rem))] w-[min(calc(100vw-2rem),440px)] flex-col overflow-hidden rounded-[28px] border border-[#DCECE8] bg-[#F4F9F8] shadow-[0_24px_70px_rgba(18,63,66,0.22)] sm:right-6"
    >
      {/* Cabeçalho */}
      <header className="relative shrink-0 overflow-hidden bg-white px-5 pb-4 pt-5">
        <div className="pointer-events-none absolute -right-10 -top-16 size-36 rounded-full bg-[#E5F3F0] opacity-80 blur-2xl" />

        <div className="relative flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-[17px] bg-[#EAF5F2]">
            <img src={logo} alt="" className="h-7 w-auto" />
          </div>

          <div className="min-w-0 flex-1">
            <h2
              id="assistant-title"
              ref={headingRef}
              tabIndex={-1}
              className="text-[16px] font-semibold tracking-[-0.3px] text-[#123F42] focus:outline-none"
            >
              Assistente Equilibra
            </h2>

            <div className="mt-1 flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-[#4E9B84]" />
              <p className="text-[12px] text-[#586463]">
                Informações para apoiar seu cuidado
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar assistente"
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-[#586463] transition-colors hover:bg-[#F0F6F4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#247477]"
          >
            <Icon icon={CloseIcon} size={21} />
          </button>
        </div>

        <div className="relative mt-4">
          {isPatient ? (
            <div className="flex items-center gap-2 rounded-2xl border border-[#E2EEEA] bg-[#F8FBFA] px-3.5 py-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#E5F2EF] text-[12px] font-semibold text-[#247477]">
                {(session.name || "P").charAt(0).toUpperCase()}
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-[#788685]">
                  Conversando sobre
                </p>
                <p className="truncate text-[13px] font-medium text-[#282B2D]">
                  {session.name || "Meu perfil"}
                </p>
              </div>

              <span className="rounded-full bg-[#E7F2EF] px-2.5 py-1 text-[11px] font-medium text-[#247477]">
                Meu perfil
              </span>
            </div>
          ) : (
            <label className="flex items-center gap-3 rounded-2xl border border-[#E2EEEA] bg-[#F8FBFA] px-3.5 py-2">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#E5F2EF] text-[#247477]">
                <svg
                  viewBox="0 0 24 24"
                  width="17"
                  height="17"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  aria-hidden="true"
                >
                  <circle cx="9" cy="8" r="3.2" />
                  <path d="M3.5 19c.4-3.1 2.4-5 5.5-5s5.1 1.9 5.5 5" />
                  <path d="M16 7.5a3 3 0 0 1 0 5.8M17 15c2.1.5 3.3 1.8 3.6 4" />
                </svg>
              </span>

              <span className="min-w-0 flex-1">
                <span className="block text-[11px] text-[#788685]">
                  Conversando sobre
                </span>
                <select
                  value={patientId}
                  onChange={(event) => {
                    setPatientId(event.target.value);
                    setConversationId("");
                    setMessages([]);
                    setDraft("");
                    setError("");
                  }}
                  disabled={patientsLoading || sending}
                  aria-label="Selecionar paciente"
                  className="mt-0.5 w-full cursor-pointer appearance-none bg-transparent pr-2 text-[13px] font-medium text-[#282B2D] outline-none disabled:opacity-60"
                >
                  <option value="">
                    {patientsLoading
                      ? "Carregando pacientes..."
                      : "Selecione um paciente"}
                  </option>

                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name}
                    </option>
                  ))}
                </select>
              </span>

              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
                className="shrink-0 text-[#788685]"
              >
                <path d="m7 10 5 5 5-5" />
              </svg>
            </label>
          )}
        </div>

        {patientError && (
          <p
            role="alert"
            className="mt-2 text-[12px] leading-relaxed text-red-700"
          >
            {patientError}
          </p>
        )}
      </header>

      {/* Ação para iniciar uma nova conversa, sem lista de histórico */}
      {hasMessages && (
        <div className="flex shrink-0 justify-end border-y border-[#E2EEEA] bg-white/70 px-5 py-2">
          <button
            type="button"
            onClick={startNewConversation}
            disabled={!patientId || sending}
            className="flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-2 text-[12px] font-medium text-[#247477] transition-colors hover:bg-[#EAF5F2] disabled:opacity-40"
          >
            <svg
              viewBox="0 0 24 24"
              width="15"
              height="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Nova conversa
          </button>
        </div>
      )}

      {/* Área de mensagens */}
      <div
        ref={bodyRef}
        aria-live="polite"
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-5 sm:px-5"
      >
        {!patientId && !patientsLoading && !patientError && (
          <div className="flex flex-1 flex-col items-center justify-center px-5 py-10 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-[24px] bg-white shadow-sm">
              <img src={logo} alt="" className="h-9 w-auto" />
            </div>

            <h3 className="text-[15px] font-medium text-[#123F42]">
              Vamos começar?
            </h3>

            <p className="mt-2 max-w-[250px] text-[13px] leading-relaxed text-[#586463]">
              Selecione um paciente para consultar as informações registradas
              no Equilibra.
            </p>
          </div>
        )}

        {patientId && !hasMessages && (
          <div className="flex flex-1 flex-col">
            <div className="mb-5 mt-1 flex flex-col items-center text-center">
              <div className="mb-3 flex size-[60px] items-center justify-center rounded-[22px] border border-[#E1EEEA] bg-white shadow-[0_5px_18px_rgba(18,63,66,0.04)]">
                <img src={logo} alt="" className="h-9 w-auto" />
              </div>

              <p className="text-[11px] font-medium uppercase tracking-[1.6px] text-[#4E8D87]">
                Seu espaço de cuidado
              </p>

              <h3 className="mt-2 text-[18px] font-medium tracking-[-0.4px] text-[#123F42]">
                Como posso ajudar?
              </h3>

              <p className="mt-2 max-w-[270px] text-[13px] leading-[1.7] text-[#586463]">
                Consulte informações já registradas sobre sua rotina de
                cuidados.
              </p>
            </div>

            <p className="mb-2 ml-1 text-[11px] font-medium text-[#788685]">
              SUGESTÕES PARA VOCÊ
            </p>

            <div className="grid grid-cols-2 gap-2">
              {SUGGESTIONS.map((suggestion, index) => (
                <button
                  key={suggestion.title}
                  type="button"
                  onClick={() => void sendMessage(suggestion.text)}
                  disabled={sending}
                  className="group flex min-h-[100px] flex-col items-start rounded-[18px] border border-[#E0ECE8] bg-white p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#9CC9C0] hover:shadow-[0_5px_16px_rgba(18,63,66,0.06)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#247477] disabled:opacity-50"
                >
                  <span className="mb-2.5 flex size-8 items-center justify-center rounded-xl bg-[#EAF5F2] text-[#247477] transition-colors group-hover:bg-[#DDEFEA]">
                    {index === 0 && (
                      <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                        <rect x="4" y="6" width="16" height="14" rx="2.5" />
                        <path d="M8 4v4M16 4v4M4 10h16M8 14h3" />
                      </svg>
                    )}

                    {index === 1 && (
                      <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                        <path d="M12 20s-7-4.2-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.8-7 10-7 10Z" />
                        <path d="M9 12h6M12 9v6" />
                      </svg>
                    )}

                    {index === 2 && (
                      <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                        <rect x="6" y="4" width="12" height="16" rx="3" />
                        <path d="M9 4.5V3h6v1.5M9 9h6M9 13h4" />
                      </svg>
                    )}

                    {index === 3 && (
                      <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                        <path d="M3 12h3l2.2-6 4.1 12 2.2-6H21" />
                      </svg>
                    )}
                  </span>

                  <span className="text-[12px] font-medium text-[#123F42]">
                    {suggestion.title}
                  </span>

                  <span className="mt-1 text-[11px] leading-relaxed text-[#788685]">
                    {suggestion.description}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) =>
          message.role === "USER" ? (
            <UserBubble key={message.id} text={message.text} />
          ) : (
            <BotBubble key={message.id} text={message.text} />
          ),
        )}

        {sending && (
          <div className="flex items-end gap-2.5" role="status">
            <AssistantAvatar small />

            <div className="flex items-center gap-1.5 rounded-[18px] rounded-bl-[6px] border border-[#E4EFEC] bg-white px-4 py-4">
              <span className="size-1.5 animate-bounce rounded-full bg-[#78AAA1]" />
              <span className="size-1.5 animate-bounce rounded-full bg-[#78AAA1] [animation-delay:120ms]" />
              <span className="size-1.5 animate-bounce rounded-full bg-[#78AAA1] [animation-delay:240ms]" />

              <span className="ml-1 text-[11px] text-[#788685]">
                Consultando registros
              </span>
            </div>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-[#F0D7D5] bg-[#FFF7F6] px-3.5 py-3 text-[12px] leading-relaxed text-[#9A3D37]"
          >
            {error}
          </div>
        )}
      </div>

      {/* Campo de mensagem */}
      <footer className="shrink-0 border-t border-[#E0ECE8] bg-white px-4 pb-3 pt-3 sm:px-5">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void sendMessage();
          }}
        >
          <div className="flex items-end gap-2 rounded-[23px] border border-[#DCE9E5] bg-[#F8FBFA] p-1.5 pl-3.5 transition-colors focus-within:border-[#8CBDB3] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#247477]/10">
            <label htmlFor="assistant-message" className="sr-only">
              Digite sua mensagem
            </label>

            <textarea
              id="assistant-message"
              ref={inputRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault();
                  void sendMessage();
                }
              }}
              rows={1}
              maxLength={1200}
              placeholder="Escreva sua pergunta..."
              disabled={!patientId || sending}
              className="max-h-28 min-h-10 min-w-0 flex-1 resize-y border-0 bg-transparent py-2.5 text-[13px] leading-relaxed text-[#282B2D] outline-none placeholder:text-[#899895] focus:ring-0 disabled:opacity-50"
            />

            <button
              type="submit"
              aria-label="Enviar mensagem"
              disabled={!patientId || !draft.trim() || sending}
              className="flex size-10 shrink-0 items-center justify-center rounded-[16px] bg-[#247477] text-white transition-colors hover:bg-[#1B5E60] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#247477] disabled:cursor-not-allowed disabled:bg-[#DCE9E5] disabled:text-[#91A5A0]"
            >
              <svg
                viewBox="0 0 24 24"
                width="19"
                height="19"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 19V5M6 11l6-6 6 6" />
              </svg>
            </button>
          </div>

          <div className="mt-2 flex items-center justify-between gap-3 px-1">
            <span className="text-[10px] text-[#899895]">
              Enter para enviar · Shift + Enter para pular linha
            </span>

            <span
              className={`shrink-0 text-[10px] ${
                draft.length > 1100 ? "text-[#9A3D37]" : "text-[#899895]"
              }`}
            >
              {draft.length}/1200
            </span>
          </div>
        </form>

        <div className="mt-3 flex items-start gap-2 border-t border-[#EDF2F0] pt-3">
          <svg
            viewBox="0 0 24 24"
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-[#7A9B92]"
          >
            <path d="M12 3 20 6v5c0 5-3.4 8.2-8 10-4.6-1.8-8-5-8-10V6l8-3Z" />
            <path d="m9 12 2 2 4-4" />
          </svg>

          <p className="text-[10px] leading-[1.6] text-[#788685]">
            {disclaimer}
          </p>
        </div>
      </footer>
    </section>
  );
}

export default function AssistantWidget() {
  const { session } = useSession();
  const prefs = usePreferences();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  if (!session || !prefs.showAssistant) return null;

  const close = () => {
    setOpen(false);
    buttonRef.current?.focus();
  };

  return (
    <>
      {open && <AssistantPanel onClose={close} />}

      <button
        ref={buttonRef}
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-label={
          open ? "Fechar assistente" : "Abrir assistente do Equilibra"
        }
        aria-expanded={open}
        aria-controls="assistant-panel"
        className="fixed bottom-4 right-4 z-40 flex size-14 items-center justify-center rounded-[21px] border border-[#DCECE8] bg-white shadow-[0_10px_30px_rgba(18,63,66,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(18,63,66,0.23)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#247477] sm:bottom-6 sm:right-6"
      >
        {open ? (
          <Icon icon={CloseIcon} size={24} className="text-[#247477]" />
        ) : (
          <img src={logo} alt="" className="h-8 w-auto" />
        )}
      </button>
    </>
  );
}