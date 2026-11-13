import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import { useSession } from "../../modules/session/session";
import {
  createConversation,
  getConversations,
  getMessages,
  sendMessage,
  type ConversationRecord,
  type MessageRecord,
} from "../../services/api/messaging";
import {
  getAccessiblePatients,
  getMyPatientCareNetwork,
  getMyPatientProfileId,
} from "../../services/api/patients";
import GlassCard from "../../components/app/GlassCard";
import PageHeader from "../../components/app/PageHeader";

type Person = {
  id: string;
  name: string;
};

type PatientOption = {
  id: string;
  name: string;
  userId?: string;
};

type LinkOption = {
  _id?: string;
  status?: string;
  relationship?: string;
  permissions?: string[];
  userId?:
    | string
    | {
        _id?: string;
        id?: string;
        fullName?: string;
        email?: string;
      };
  patientId?:
    | string
    | {
        _id?: string;
        id?: string;
        userId?:
          | string
          | {
              _id?: string;
              id?: string;
              fullName?: string;
              email?: string;
            };
      };
};

function getId(value: unknown): string {
  if (typeof value === "string") return value;

  if (value && typeof value === "object") {
    const item = value as { _id?: string; id?: string };
    return item._id ?? item.id ?? "";
  }

  return "";
}

function getName(value: unknown, fallback = "Usuário"): string {
  if (value && typeof value === "object") {
    const item = value as {
      fullName?: string;
      name?: string;
      email?: string;
    };

    return item.fullName ?? item.name ?? item.email ?? fallback;
  }

  return fallback;
}

function formatDate(value?: string) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function MessagesPage() {
  const { session } = useSession();
  const [searchParams] = useSearchParams();

  const requestedPatientId = searchParams.get("paciente") ?? "";
  const isPatient = session?.profile === "paciente";
  const isClinicalCaregiver =
    session?.profile === "cuidador-clinico";

  const [patientId, setPatientId] = useState("");
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [contacts, setContacts] = useState<Person[]>([]);
  const [conversations, setConversations] = useState<ConversationRecord[]>([]);
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState("");
  const [selectedContactId, setSelectedContactId] = useState("");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const selectedConversation = useMemo(
    () => conversations.find((item) => item._id === selectedConversationId),
    [conversations, selectedConversationId],
  );

  const selectedContact = useMemo(
    () => contacts.find((item) => item.id === selectedContactId),
    [contacts, selectedContactId],
  );

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      if (!session?.accessToken || !session.userId) {
        setLoading(false);
        setError(
          "Sua sessão não possui as informações necessárias para acessar as mensagens.",
        );
        return;
      }

      setLoading(true);
      setError("");

      try {
        if (isPatient) {
          // Fluxo do paciente: carrega o próprio cadastro e sua rede de cuidado.
          const ownPatientId = await getMyPatientProfileId(
            session.accessToken,
            session.userId,
          );

          if (!ownPatientId) {
            throw new Error("Não encontramos seu cadastro de paciente.");
          }

          const links = (await getMyPatientCareNetwork(
            session.accessToken,
          )) as LinkOption[];

          const allowedContacts: Person[] = links
            .filter((link) => {
              const permissions = link.permissions ?? [];

              return (
                link.status === "ACTIVE" &&
                permissions.includes("patient.communication.read") &&
                permissions.includes("patient.communication.send") &&
                Boolean(getId(link.userId)) &&
                getId(link.userId) !== session.userId
              );
            })
            .map((link) => ({
              id: getId(link.userId),
              name: getName(link.userId, "Contato da equipe de cuidado"),
            }));

          if (cancelled) return;

          setPatientId(ownPatientId);
          setPatients([]);
          setContacts(
            allowedContacts.filter(
              (contact, index, list) =>
                list.findIndex((item) => item.id === contact.id) === index,
            ),
          );
          setSelectedContactId("");
        } else if (isClinicalCaregiver) {
          // Fluxo do cuidador clínico: usa apenas os vínculos do próprio usuário.
          const links = (await getMyPatientCareNetwork(
            session.accessToken,
          )) as LinkOption[];

          const options: PatientOption[] = links
            .filter((link) => {
              const permissions = link.permissions ?? [];

              return (
                link.status === "ACTIVE" &&
                link.relationship === "CLINICAL_CAREGIVER" &&
                permissions.includes("patient.communication.read") &&
                permissions.includes("patient.communication.send")
              );
            })
            .map((link) => {
              const linkedPatient = link.patientId;

              const patientUser =
                linkedPatient && typeof linkedPatient === "object"
                  ? linkedPatient.userId
                  : undefined;

              return {
                id: getId(linkedPatient),
                name: getName(patientUser, "Paciente"),
                userId: getId(patientUser),
              };
            })
            .filter((patient) => Boolean(patient.id && patient.userId))
            .filter(
              (patient, index, list) =>
                list.findIndex((item) => item.id === patient.id) === index,
            );

          if (cancelled) return;

          setPatients(options);

          const selected =
            options.find((item) => item.id === requestedPatientId) ??
            options[0];

          if (!selected) {
            throw new Error(
              "Você não possui pacientes com vínculo ativo e permissão para trocar mensagens.",
            );
          }

          setPatientId(selected.id);

          setContacts([
            {
              id: selected.userId!,
              name: selected.name,
            },
          ]);

          setSelectedContactId("");
        } else {
          // Fluxo original dos profissionais, incluindo médicos.
          const accessiblePatients = await getAccessiblePatients(
            session.accessToken,
          );

          const options: PatientOption[] = accessiblePatients
            .map((patient) => {
              const ownerId = getId(patient.userId);

              return {
                id: patient._id ?? patient.id ?? "",
                name: getName(patient.userId, "Paciente"),
                userId: ownerId,
              };
            })
            .filter((patient) => Boolean(patient.id));

          if (cancelled) return;

          setPatients(options);

          const selected =
            options.find((item) => item.id === requestedPatientId) ??
            options[0];

          if (!selected) {
            throw new Error(
              "Você ainda não possui pacientes disponíveis para consultar.",
            );
          }

          setPatientId(selected.id);

          if (selected.userId && selected.userId !== session.userId) {
            setContacts([
              {
                id: selected.userId,
                name: selected.name,
              },
            ]);
          } else {
            setContacts([]);
          }

          setSelectedContactId("");
        }
      } catch (cause) {
        if (!cancelled) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Não foi possível carregar os dados de mensagens.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void initialize();

    return () => {
      cancelled = true;
    };
  }, [
    session?.accessToken,
    session?.userId,
    isPatient,
    isClinicalCaregiver,
    requestedPatientId,
  ]);

  useEffect(() => {
    let cancelled = false;

    async function loadConversations() {
      if (!session?.accessToken || !patientId) {
        setConversations([]);
        setSelectedConversationId("");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const result = await getConversations(
          session.accessToken,
          patientId,
        );

        if (cancelled) return;

        setConversations(result);

        setSelectedConversationId((current) => {
          if (current && result.some((item) => item._id === current)) {
            return current;
          }

          return result[0]?._id ?? "";
        });
      } catch (cause) {
        if (!cancelled) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Não foi possível carregar as conversas.",
          );
          setConversations([]);
          setSelectedConversationId("");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadConversations();

    return () => {
      cancelled = true;
    };
  }, [session?.accessToken, patientId]);

  useEffect(() => {
    let cancelled = false;

    async function loadMessages() {
      if (
        !session?.accessToken ||
        !patientId ||
        !selectedConversationId
      ) {
        setMessages([]);
        return;
      }

      setLoadingMessages(true);

      try {
        const result = await getMessages(
          session.accessToken,
          patientId,
          selectedConversationId,
        );

        if (!cancelled) setMessages(result);
      } catch (cause) {
        if (!cancelled) {
          setMessages([]);
          setError(
            cause instanceof Error
              ? cause.message
              : "Não foi possível carregar o histórico.",
          );
        }
      } finally {
        if (!cancelled) setLoadingMessages(false);
      }
    }

    void loadMessages();

    return () => {
      cancelled = true;
    };
  }, [session?.accessToken, patientId, selectedConversationId]);

  async function handleCreateConversation() {
    if (
      !session?.accessToken ||
      !session.userId ||
      !patientId ||
      !selectedContact
    ) {
      setError("Selecione um contato autorizado para iniciar a conversa.");
      return;
    }

    setCreating(true);
    setError("");

    try {
      const conversation = await createConversation(
        session.accessToken,
        patientId,
        selectedContact.name,
        [session.userId, selectedContact.id],
      );

      setConversations((current) => [
        conversation,
        ...current.filter((item) => item._id !== conversation._id),
      ]);

      setSelectedConversationId(conversation._id);
      setMessages([]);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível iniciar a conversa.",
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleSendMessage() {
    if (
      !session?.accessToken ||
      !patientId ||
      !selectedConversationId ||
      !draft.trim()
    ) {
      return;
    }

    setSending(true);
    setError("");

    try {
      const message = await sendMessage(
        session.accessToken,
        patientId,
        selectedConversationId,
        draft,
      );

      setMessages((current) => [
        ...current.filter((item) => item._id !== message._id),
        message,
      ]);

      setDraft("");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível enviar a mensagem.",
      );
    } finally {
      setSending(false);
    }
  }

  const conversationTitle = (conversation: ConversationRecord) => {
    if (isClinicalCaregiver) {
      return (
        patients.find((patient) => patient.id === patientId)?.name ||
        conversation.data.title?.trim() ||
        "Conversa"
      );
    }

    return conversation.data.title?.trim() || "Conversa";
  };

  if (
    !session ||
    !["paciente", "medico", "cuidador-clinico"].includes(session.profile)
  ) {
    return (
      <main className="space-y-5">
        <PageHeader
          title="Mensagens"
          subtitle="Comunicação entre o paciente e sua equipe de cuidado."
        />
        <GlassCard>
          <p className="text-sm text-ink-soft">
            Esta área está disponível para os perfis autorizados.
          </p>
        </GlassCard>
      </main>
    );
  }

  return (
    <main className="space-y-5">
      <PageHeader
        title="Mensagens"
        subtitle="Um espaço de comunicação entre pacientes e profissionais de cuidado."
      />

      {error && (
        <div
          role="alert"
          className="rounded-[20px] bg-alert-bg px-4 py-3 text-sm text-alert-text"
        >
          {error}
        </div>
      )}

      {!isPatient && patients.length > 0 && (
        <GlassCard title="Paciente">
          <label
            htmlFor="messages-patient"
            className="mb-2 block text-sm font-medium text-ink"
          >
            Selecione o paciente
          </label>
          <select
            id="messages-patient"
            value={patientId}
            onChange={(event) => {
              const nextPatientId = event.target.value;
              const patient = patients.find(
                (item) => item.id === nextPatientId,
              );

              setPatientId(nextPatientId);
              setContacts(
                patient?.userId
                  ? [{ id: patient.userId, name: patient.name }]
                  : [],
              );
              setSelectedContactId("");
              setConversations([]);
              setMessages([]);
              setSelectedConversationId("");
            }}
            className="min-h-12 w-full rounded-2xl border border-field-border bg-white px-4 text-sm text-ink outline-none focus:border-action"
          >
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name}
              </option>
            ))}
          </select>
        </GlassCard>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.5fr)]">
        <GlassCard
          title="Suas conversas"
          description="Conversas disponíveis para sua conta."
        >
          {loading ? (
            <p className="py-6 text-sm text-ink-soft">
              Carregando conversas...
            </p>
          ) : conversations.length === 0 ? (
            <div className="space-y-4">
              <p className="text-sm leading-6 text-ink-soft">
                Nenhuma conversa encontrada para este paciente.
              </p>

              {contacts.length > 0 ? (
                <>
                  <label
                    htmlFor="messages-contact"
                    className="block text-sm font-medium text-ink"
                  >
                    Iniciar conversa com
                  </label>
                  <select
                    id="messages-contact"
                    value={selectedContactId}
                    onChange={(event) =>
                      setSelectedContactId(event.target.value)
                    }
                    className="min-h-12 w-full rounded-2xl border border-field-border bg-white px-4 text-sm text-ink outline-none focus:border-action"
                  >
                    <option value="">Selecione um contato</option>
                    {contacts.map((contact) => (
                      <option key={contact.id} value={contact.id}>
                        {contact.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => void handleCreateConversation()}
                    disabled={!selectedContactId || creating}
                    className="min-h-12 w-full rounded-full bg-action px-5 text-sm font-medium text-white transition hover:bg-action-hover disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {creating ? "Criando conversa..." : "Nova conversa"}
                  </button>
                </>
              ) : (
                <p className="text-sm text-ink-soft">
                  {isPatient
                    ? "Para conversar, é necessário ter um vínculo ativo com permissão de comunicação."
                    : "Não encontramos um paciente com um usuário associado para iniciar a conversa."}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <button
                  key={conversation._id}
                  type="button"
                  onClick={() => setSelectedConversationId(conversation._id)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    selectedConversationId === conversation._id
                      ? "border-mint-200 bg-mint-100"
                      : "border-transparent bg-white/60 hover:bg-white"
                  }`}
                >
                  <span className="block font-medium text-deep">
                    {conversationTitle(conversation)}
                  </span>
                  <span className="mt-1 block text-xs text-ink-soft">
                    {formatDate(
                      conversation.updatedAt ?? conversation.createdAt,
                    )}
                  </span>
                </button>
              ))}

              {contacts.length > 0 && (
                <div className="border-t border-line pt-4">
                  <label
                    htmlFor="messages-new-contact"
                    className="mb-2 block text-sm font-medium text-ink"
                  >
                    Novo contato
                  </label>
                  <select
                    id="messages-new-contact"
                    value={selectedContactId}
                    onChange={(event) =>
                      setSelectedContactId(event.target.value)
                    }
                    className="min-h-12 w-full rounded-2xl border border-field-border bg-white px-4 text-sm text-ink outline-none focus:border-action"
                  >
                    <option value="">Selecione um contato</option>
                    {contacts.map((contact) => (
                      <option key={contact.id} value={contact.id}>
                        {contact.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => void handleCreateConversation()}
                    disabled={!selectedContactId || creating}
                    className="mt-3 min-h-11 w-full rounded-full border border-action px-4 text-sm font-medium text-action transition hover:bg-mint-100 disabled:opacity-50"
                  >
                    {creating ? "Criando..." : "Iniciar nova conversa"}
                  </button>
                </div>
              )}
            </div>
          )}
        </GlassCard>

        <GlassCard
          title={
            selectedConversation
              ? conversationTitle(selectedConversation)
              : "Conversa"
          }
          description="Mensagens enviadas e recebidas."
        >
          {!selectedConversationId ? (
            <div className="flex min-h-64 items-center justify-center rounded-2xl bg-white/50 p-6 text-center">
              <p className="max-w-sm text-sm leading-6 text-ink-soft">
                Selecione uma conversa para visualizar as mensagens ou inicie
                uma nova com um contato autorizado.
              </p>
            </div>
          ) : (
            <>
              <div
                aria-live="polite"
                className="flex min-h-64 max-h-[55vh] flex-col gap-3 overflow-y-auto rounded-2xl bg-white/45 p-3 sm:p-5"
              >
                {loadingMessages ? (
                  <p className="m-auto text-sm text-ink-soft">
                    Carregando mensagens...
                  </p>
                ) : messages.length === 0 ? (
                  <p className="m-auto text-center text-sm text-ink-soft">
                    Esta conversa ainda não possui mensagens. Você pode enviar
                    a primeira.
                  </p>
                ) : (
                  messages.map((message) => {
                    const isMine =
                      Boolean(session.userId) &&
                      message.data.senderId === session.userId;

                    return (
                      <div
                        key={message._id}
                        className={`max-w-[90%] rounded-2xl px-4 py-3 sm:max-w-[80%] ${
                          isMine
                            ? "self-end rounded-br-md bg-action text-white"
                            : "self-start rounded-bl-md border border-line bg-white text-ink"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words text-sm leading-6">
                          {message.data.text}
                        </p>
                        <p
                          className={`mt-2 text-right text-[11px] ${
                            isMine ? "text-white/75" : "text-ink-soft"
                          }`}
                        >
                          {formatDate(
                            message.data.sentAt ?? message.createdAt,
                          )}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>

              <form
                className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleSendMessage();
                }}
              >
                <label htmlFor="message-draft" className="sr-only">
                  Escreva sua mensagem
                </label>
                <textarea
                  id="message-draft"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  maxLength={5000}
                  rows={2}
                  placeholder="Escreva sua mensagem..."
                  className="min-h-12 flex-1 resize-y rounded-2xl border border-field-border bg-white px-4 py-3 text-sm text-ink outline-none placeholder:text-placeholder focus:border-action"
                />
                <button
                  type="submit"
                  disabled={sending || !draft.trim()}
                  className="min-h-12 rounded-full bg-action px-6 text-sm font-medium text-white transition hover:bg-action-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sending ? "Enviando..." : "Enviar"}
                </button>
              </form>
              <p className="mt-2 text-right text-xs text-ink-soft">
                {draft.length}/5000 caracteres
              </p>
            </>
          )}
        </GlassCard>
      </div>
    </main>
  );
}