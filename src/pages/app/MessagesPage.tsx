import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import Avatar from "../../components/app/Avatar";
import EmptyState from "../../components/app/EmptyState";
import GlassCard from "../../components/app/GlassCard";
import Modal from "../../components/app/Modal";
import PageHeader from "../../components/app/PageHeader";
import SmallButton from "../../components/app/SmallButton";
import Icon from "../../components/ui/Icon";
import { ChevronLeftIcon, MessageIcon, PlusIcon } from "../../components/ui/icons";
import { usePreferences } from "../../modules/app/preferences";
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

type Person = { id: string; name: string; role?: string };
type PatientOption = { id: string; name: string; userId?: string };

type LinkOption = {
  _id?: string;
  status?: string;
  relationship?: string;
  permissions?: string[];
  userId?: string | { _id?: string; id?: string; fullName?: string; email?: string };
  patientId?:
    | string
    | {
        _id?: string;
        id?: string;
        userId?: string | { _id?: string; id?: string; fullName?: string; email?: string };
      };
};

type Row =
  | { kind: "day"; key: string; label: string }
  | { kind: "message"; key: string; message: MessageRecord; mine: boolean; first: boolean; time: string };

const COMM_READ = "patient.communication.read";
const COMM_SEND = "patient.communication.send";

const ROLE_LABELS: Record<string, string> = {
  CLINICAL_CAREGIVER: "Cuidador clínico",
  HOME_CAREGIVER: "Cuidador domiciliar",
  PROFESSIONAL: "Profissional de saúde",
  NEUROLOGIST: "Neurologista",
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
    const item = value as { fullName?: string; name?: string; email?: string };
    return item.fullName ?? item.name ?? item.email ?? fallback;
  }
  return fallback;
}

function participantIds(conversation: ConversationRecord): string[] {
  const raw = (conversation.data as { participantIds?: unknown }).participantIds;
  return Array.isArray(raw) ? raw.map(getId).filter(Boolean) : [];
}

function toDate(value?: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatTime(value?: string) {
  const date = toDate(value);
  return date
    ? new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(date)
    : "";
}

function formatShort(value?: string) {
  const date = toDate(value);
  if (!date) return "";
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(date, now)) return formatTime(value);
  if (sameDay(date, yesterday)) return "Ontem";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(date);
}

function dayLabel(date: Date) {
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(date, now)) return "Hoje";
  if (sameDay(date, yesterday)) return "Ontem";
  const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" };
  if (date.getFullYear() !== now.getFullYear()) options.year = "numeric";
  return new Intl.DateTimeFormat("pt-BR", options).format(date);
}

function ListSkeleton() {
  return (
    <ul aria-hidden="true" className="flex flex-col gap-2 p-3">
      {[0, 1, 2].map((item) => (
        <li key={item} className="flex items-center gap-3 rounded-2xl px-3 py-3 motion-safe:animate-pulse">
          <span className="size-10 shrink-0 rounded-full bg-mint-200/70" />
          <span className="flex-1 space-y-2">
            <span className="block h-3.5 w-2/3 rounded-full bg-mint-200/70" />
            <span className="block h-3 w-1/3 rounded-full bg-mint-100" />
          </span>
        </li>
      ))}
    </ul>
  );
}

function ThreadSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-3 motion-safe:animate-pulse">
      <span className="h-12 w-3/5 rounded-2xl rounded-bl-md bg-mint-100" />
      <span className="ml-auto h-12 w-1/2 rounded-2xl rounded-br-md bg-mint-200/70" />
      <span className="h-12 w-2/5 rounded-2xl rounded-bl-md bg-mint-100" />
    </div>
  );
}

export default function MessagesPage() {
  const { session } = useSession();
  const { reduceMotion } = usePreferences();
  const [searchParams] = useSearchParams();

  const requestedPatientId = searchParams.get("paciente") ?? "";
  const isPatient = session?.profile === "paciente";
  const isClinicalCaregiver = session?.profile === "cuidador-clinico";

  const [patientId, setPatientId] = useState("");
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [contacts, setContacts] = useState<Person[]>([]);
  const [awaitingEnable, setAwaitingEnable] = useState(0);
  const [conversations, setConversations] = useState<ConversationRecord[]>([]);
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "thread">("list");
  const [draft, setDraft] = useState("");
  const [initializing, setInitializing] = useState(true);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [creatingId, setCreatingId] = useState("");
  const [newOpen, setNewOpen] = useState(false);
  const [setupError, setSetupError] = useState("");
  const [listError, setListError] = useState("");
  const [threadError, setThreadError] = useState("");
  const [sendError, setSendError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [hasNew, setHasNew] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);

  /* ---------- carregamento inicial (mesma lógica de antes) ---------- */
  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      if (!session?.accessToken || !session.userId) {
        setInitializing(false);
        setSetupError("Sua sessão não possui as informações necessárias para acessar as mensagens.");
        return;
      }

      setInitializing(true);
      setSetupError("");

      try {
        if (isPatient) {
          const ownPatientId = await getMyPatientProfileId(session.accessToken, session.userId);
          if (!ownPatientId) throw new Error("Não encontramos seu cadastro de paciente.");

          const links = (await getMyPatientCareNetwork(session.accessToken)) as LinkOption[];

          const allowed: Person[] = links
            .filter((link) => {
              const permissions = link.permissions ?? [];
              return (
                link.status === "ACTIVE" &&
                permissions.includes(COMM_READ) &&
                permissions.includes(COMM_SEND) &&
                Boolean(getId(link.userId)) &&
                getId(link.userId) !== session.userId
              );
            })
            .map((link) => ({
              id: getId(link.userId),
              name: getName(link.userId, "Contato da equipe de cuidado"),
              role: ROLE_LABELS[link.relationship ?? ""] ?? "Equipe de cuidado",
            }));

          // cuidadores clínicos com vínculo ativo, mas sem comunicação habilitada
          const blocked = links.filter((link) => {
            const permissions = link.permissions ?? [];
            return (
              link.status === "ACTIVE" &&
              link.relationship === "CLINICAL_CAREGIVER" &&
              !(permissions.includes(COMM_READ) && permissions.includes(COMM_SEND))
            );
          }).length;

          if (cancelled) return;

          setPatientId(ownPatientId);
          setPatients([]);
          setAwaitingEnable(blocked);
          setContacts(
            allowed.filter((contact, index, list) => list.findIndex((item) => item.id === contact.id) === index),
          );
        } else if (isClinicalCaregiver) {
          const links = (await getMyPatientCareNetwork(session.accessToken)) as LinkOption[];

          const options: PatientOption[] = links
            .filter((link) => {
              const permissions = link.permissions ?? [];
              return (
                link.status === "ACTIVE" &&
                link.relationship === "CLINICAL_CAREGIVER" &&
                permissions.includes(COMM_READ) &&
                permissions.includes(COMM_SEND)
              );
            })
            .map((link) => {
              const linkedPatient = link.patientId;
              const patientUser =
                linkedPatient && typeof linkedPatient === "object" ? linkedPatient.userId : undefined;
              return {
                id: getId(linkedPatient),
                name: getName(patientUser, "Paciente"),
                userId: getId(patientUser),
              };
            })
            .filter((patient) => Boolean(patient.id && patient.userId))
            .filter((patient, index, list) => list.findIndex((item) => item.id === patient.id) === index);

          if (cancelled) return;
          setPatients(options);

          const selected = options.find((item) => item.id === requestedPatientId) ?? options[0];
          if (!selected) {
            throw new Error(
              "Você não possui pacientes com vínculo ativo e permissão para trocar mensagens.",
            );
          }

          setPatientId(selected.id);
          setContacts([{ id: selected.userId!, name: selected.name, role: "Paciente" }]);
        } else {
          const accessiblePatients = await getAccessiblePatients(session.accessToken);

          const options: PatientOption[] = accessiblePatients
            .map((patient) => ({
              id: patient._id ?? patient.id ?? "",
              name: getName(patient.userId, "Paciente"),
              userId: getId(patient.userId),
            }))
            .filter((patient) => Boolean(patient.id));

          if (cancelled) return;
          setPatients(options);

          const selected = options.find((item) => item.id === requestedPatientId) ?? options[0];
          if (!selected) throw new Error("Você ainda não possui pacientes disponíveis para consultar.");

          setPatientId(selected.id);
          setContacts(
            selected.userId && selected.userId !== session.userId
              ? [{ id: selected.userId, name: selected.name, role: "Paciente" }]
              : [],
          );
        }
      } catch (cause) {
        if (!cancelled) {
          setSetupError(
            cause instanceof Error ? cause.message : "Não foi possível carregar os dados de mensagens.",
          );
        }
      } finally {
        if (!cancelled) setInitializing(false);
      }
    }

    void initialize();
    return () => {
      cancelled = true;
    };
  }, [session?.accessToken, session?.userId, isPatient, isClinicalCaregiver, requestedPatientId]);

  /* ---------- conversas do paciente selecionado ---------- */
  useEffect(() => {
    let cancelled = false;

    async function loadConversations() {
      if (!session?.accessToken || !patientId) {
        setConversations([]);
        setSelectedConversationId("");
        return;
      }

      setLoadingList(true);
      setListError("");

      try {
        const result = await getConversations(session.accessToken, patientId);
        if (cancelled) return;

        const ordered = [...result].sort(
          (a, b) =>
            (toDate(b.updatedAt ?? b.createdAt)?.getTime() ?? 0) -
            (toDate(a.updatedAt ?? a.createdAt)?.getTime() ?? 0),
        );

        setConversations(ordered);
        setSelectedConversationId((current) =>
          current && ordered.some((item) => item._id === current) ? current : (ordered[0]?._id ?? ""),
        );
      } catch (cause) {
        if (!cancelled) {
          setListError(cause instanceof Error ? cause.message : "Não foi possível carregar as conversas.");
          setConversations([]);
          setSelectedConversationId("");
        }
      } finally {
        if (!cancelled) setLoadingList(false);
      }
    }

    void loadConversations();
    return () => {
      cancelled = true;
    };
  }, [session?.accessToken, patientId, reloadKey]);

  /* ---------- mensagens da conversa aberta ---------- */
  useEffect(() => {
    let cancelled = false;

    async function loadMessages() {
      if (!session?.accessToken || !patientId || !selectedConversationId) {
        setMessages([]);
        return;
      }

      setLoadingMessages(true);
      setThreadError("");

      try {
        const result = await getMessages(session.accessToken, patientId, selectedConversationId);
        if (!cancelled) setMessages(result);
      } catch (cause) {
        if (!cancelled) {
          setMessages([]);
          setThreadError(cause instanceof Error ? cause.message : "Não foi possível carregar o histórico.");
        }
      } finally {
        if (!cancelled) setLoadingMessages(false);
      }
    }

    void loadMessages();
    return () => {
      cancelled = true;
    };
  }, [session?.accessToken, patientId, selectedConversationId, reloadKey]);

  /* ---------- atualização periódica (o backend ainda não tem tempo real) ---------- */
  useEffect(() => {
    if (!session?.accessToken || !patientId || !selectedConversationId) return undefined;
    const token = session.accessToken;

    const timer = window.setInterval(async () => {
      if (document.hidden) return;
      try {
        const result = await getMessages(token, patientId, selectedConversationId);
        setMessages((current) => {
          const sameSize = current.length === result.length;
          const sameLast = current[current.length - 1]?._id === result[result.length - 1]?._id;
          return sameSize && sameLast ? current : result;
        });
      } catch {
        /* falha silenciosa: a próxima tentativa corrige */
      }
    }, 15000);

    return () => window.clearInterval(timer);
  }, [session?.accessToken, patientId, selectedConversationId]);

  /* ---------- dados derivados ---------- */
  const people = useMemo(() => {
    const map = new Map<string, Person>();
    contacts.forEach((contact) => map.set(contact.id, contact));
    patients.forEach((patient) => {
      if (patient.userId) map.set(patient.userId, { id: patient.userId, name: patient.name, role: "Paciente" });
    });
    return map;
  }, [contacts, patients]);

  function otherPerson(conversation: ConversationRecord): Person | null {
    for (const id of participantIds(conversation)) {
      if (id === session?.userId) continue;
      const person = people.get(id);
      if (person) return person;
    }
    return null;
  }

  const conversationName = (conversation: ConversationRecord) =>
    otherPerson(conversation)?.name || conversation.data.title?.trim() || "Conversa";

  const selectedConversation = conversations.find((item) => item._id === selectedConversationId);

  const sortedMessages = useMemo(
    () =>
      [...messages].sort(
        (a, b) =>
          (toDate(a.data.sentAt ?? a.createdAt)?.getTime() ?? 0) -
          (toDate(b.data.sentAt ?? b.createdAt)?.getTime() ?? 0),
      ),
    [messages],
  );

  const rows = useMemo<Row[]>(() => {
    const result: Row[] = [];
    let previous: MessageRecord | null = null;
    let previousDate: Date | null = null;

    for (const message of sortedMessages) {
      const stamp = message.data.sentAt ?? message.createdAt;
      const date = toDate(stamp);

      if (date && (!previousDate || !sameDay(date, previousDate))) {
        result.push({ kind: "day", key: `day-${message._id}`, label: dayLabel(date) });
      }

      const grouped = Boolean(
        previous &&
          previousDate &&
          date &&
          previous.data.senderId === message.data.senderId &&
          sameDay(date, previousDate) &&
          date.getTime() - previousDate.getTime() < 5 * 60 * 1000,
      );

      result.push({
        kind: "message",
        key: message._id,
        message,
        mine: Boolean(session?.userId) && message.data.senderId === session?.userId,
        first: !grouped,
        time: formatTime(stamp),
      });

      previous = message;
      previousDate = date;
    }

    return result;
  }, [sortedMessages, session?.userId]);

  /* ---------- rolagem ---------- */
  const lastMessage = sortedMessages[sortedMessages.length - 1];

  useEffect(() => {
    if (loadingMessages) return;
    const element = scrollRef.current;
    if (!element || !lastMessage) return;

    const mine = Boolean(session?.userId) && lastMessage.data.senderId === session?.userId;

    if (stickToBottom.current || mine) {
      element.scrollTo({ top: element.scrollHeight, behavior: reduceMotion ? "auto" : "smooth" });
      setHasNew(false);
    } else {
      setHasNew(true);
    }
  }, [lastMessage?._id, loadingMessages, session?.userId, reduceMotion]);

  function handleScroll() {
    const element = scrollRef.current;
    if (!element) return;
    const near = element.scrollHeight - element.scrollTop - element.clientHeight < 80;
    stickToBottom.current = near;
    if (near) setHasNew(false);
  }

  function jumpToLatest() {
    const element = scrollRef.current;
    if (!element) return;
    element.scrollTo({ top: element.scrollHeight, behavior: reduceMotion ? "auto" : "smooth" });
    stickToBottom.current = true;
    setHasNew(false);
  }

  /* ---------- ações ---------- */
  function openConversation(id: string) {
    stickToBottom.current = true;
    if (id !== selectedConversationId) setMessages([]);
    setSelectedConversationId(id);
    setSendError("");
    setMobileView("thread");
  }

  function changePatient(nextPatientId: string) {
    const patient = patients.find((item) => item.id === nextPatientId);
    setPatientId(nextPatientId);
    setContacts(patient?.userId ? [{ id: patient.userId, name: patient.name, role: "Paciente" }] : []);
    setConversations([]);
    setMessages([]);
    setSelectedConversationId("");
    setMobileView("list");
  }

  async function handleOpenContact(contact: Person) {
    const existing = conversations.find((item) => participantIds(item).includes(contact.id));
    if (existing) {
      openConversation(existing._id);
      setNewOpen(false);
      return;
    }

    if (!session?.accessToken || !session.userId || !patientId) return;

    setCreatingId(contact.id);
    setListError("");

    try {
      const conversation = await createConversation(session.accessToken, patientId, contact.name, [
        session.userId,
        contact.id,
      ]);
      setConversations((current) => [conversation, ...current.filter((item) => item._id !== conversation._id)]);
      openConversation(conversation._id);
      setMessages([]);
      setNewOpen(false);
    } catch (cause) {
      setListError(cause instanceof Error ? cause.message : "Não foi possível iniciar a conversa.");
      setNewOpen(false);
    } finally {
      setCreatingId("");
    }
  }

  async function handleSendMessage() {
    const text = draft.trim();
    if (!session?.accessToken || !patientId || !selectedConversationId || !text || sending) return;

    setSending(true);
    setSendError("");

    try {
      const message = await sendMessage(session.accessToken, patientId, selectedConversationId, text);
      stickToBottom.current = true;
      setMessages((current) => [...current.filter((item) => item._id !== message._id), message]);
      setDraft("");
    } catch (cause) {
      setSendError(
        cause instanceof Error
          ? `${cause.message} Sua mensagem foi mantida para você tentar de novo.`
          : "Não foi possível enviar. Sua mensagem foi mantida para você tentar de novo.",
      );
    } finally {
      setSending(false);
    }
  }

  /* ---------- perfis sem acesso ---------- */
  if (!session || !["paciente", "medico", "cuidador-clinico"].includes(session.profile)) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Mensagens" subtitle="Comunicação entre o paciente e sua equipe de cuidado." />
        <GlassCard>
          <EmptyState title="Área indisponível para este perfil" />
        </GlassCard>
      </div>
    );
  }

  if (!initializing && setupError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Mensagens" subtitle="Comunicação entre o paciente e sua equipe de cuidado." />
        <GlassCard>
          <EmptyState
            title="Mensagens indisponíveis por enquanto"
            description={
              isClinicalCaregiver
                ? `${setupError} O paciente precisa habilitar a comunicação com você na tela "Minha rede" dele.`
                : setupError
            }
          />
          {isPatient && (
            <div className="mt-4 flex justify-center">
              <SmallButton to="/app/rede-de-cuidado">Ir para Minha rede</SmallButton>
            </div>
          )}
        </GlassCard>
      </div>
    );
  }

  const listBusy = initializing || loadingList;
  const nearLimit = draft.length > 4500;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Mensagens"
        subtitle="Converse com as pessoas autorizadas a acompanhar o cuidado."
      />

      {!isPatient && patients.length > 1 && (
        <GlassCard title="Paciente">
          <div role="group" aria-label="Escolher paciente" className="flex flex-wrap gap-2.5">
            {patients.map((patient) => {
              const active = patient.id === patientId;
              return (
                <button
                  key={patient.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => changePatient(patient.id)}
                  className={`inline-flex h-11 items-center rounded-full px-5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action ${
                    active
                      ? "bg-action text-white shadow-[0_8px_20px_rgba(36,116,119,0.25)]"
                      : "border border-brand text-action hover:bg-mint-100"
                  }`}
                >
                  {patient.name}
                </button>
              );
            })}
          </div>
        </GlassCard>
      )}

      {isPatient && awaitingEnable > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] bg-info-bg px-4 py-3 text-sm text-info-text">
          <p>
            {awaitingEnable === 1
              ? "Você tem 1 cuidador clínico com vínculo ativo, mas sem comunicação habilitada."
              : `Você tem ${awaitingEnable} cuidadores clínicos com vínculo ativo, mas sem comunicação habilitada.`}
          </p>
          <SmallButton to="/app/rede-de-cuidado">Habilitar em Minha rede</SmallButton>
        </div>
      )}

      {listError && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-[20px] bg-alert-bg px-4 py-3 text-sm text-alert-text"
        >
          <p>{listError}</p>
          <button
            type="button"
            onClick={() => setReloadKey((value) => value + 1)}
            className="min-h-11 rounded-full px-4 font-medium underline underline-offset-4"
          >
            Tentar novamente
          </button>
        </div>
      )}

      <div className="glass-card flex h-[min(720px,calc(100svh-14rem))] min-h-[520px] overflow-hidden rounded-3xl">
        {/* ----- lista de conversas ----- */}
        <aside
          aria-label="Conversas"
          className={`${mobileView === "thread" ? "hidden" : "flex"} w-full flex-col border-line lg:flex lg:w-[340px] lg:shrink-0 lg:border-r`}
        >
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <div>
              <h2 className="text-lg font-medium text-deep">Conversas</h2>
              <p className="text-sm text-ink-soft">
                {listBusy ? "Carregando…" : `${conversations.length} ${conversations.length === 1 ? "conversa" : "conversas"}`}
              </p>
            </div>
            <SmallButton variant="solid" onClick={() => setNewOpen(true)} label="Iniciar nova conversa">
              <span className="inline-flex items-center gap-1.5">
                <Icon icon={PlusIcon} size={18} />
                Nova
              </span>
            </SmallButton>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {listBusy ? (
              <ListSkeleton />
            ) : conversations.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-8 text-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-mint-100 text-action">
                  <Icon icon={MessageIcon} size={28} />
                </span>
                <p className="text-base font-medium text-ink">Nenhuma conversa ainda</p>
                <p className="text-sm text-ink-soft">
                  {contacts.length > 0
                    ? "Use “Nova” para começar uma conversa com uma pessoa autorizada."
                    : isPatient
                      ? "Para conversar, é preciso ter um cuidador clínico com a comunicação habilitada."
                      : "Não encontramos um contato com conta associada para iniciar a conversa."}
                </p>
                {isPatient && contacts.length === 0 && (
                  <SmallButton to="/app/rede-de-cuidado">Ir para Minha rede</SmallButton>
                )}
              </div>
            ) : (
              <ul className="flex flex-col gap-1 p-3">
                {conversations.map((conversation) => {
                  const active = conversation._id === selectedConversationId;
                  const name = conversationName(conversation);
                  return (
                    <li key={conversation._id}>
                      <button
                        type="button"
                        aria-current={active ? "true" : undefined}
                        onClick={() => openConversation(conversation._id)}
                        className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-action ${
                          active ? "bg-mint-100" : "hover:bg-mint-100/60"
                        }`}
                      >
                        <Avatar name={name} tone="soft" className="bg-white!" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-base font-medium text-ink">{name}</span>
                          <span className="block truncate text-sm text-ink-soft">
                            {otherPerson(conversation)?.role ?? "Conversa"}
                          </span>
                        </span>
                        <span className="shrink-0 text-xs text-ink-soft">
                          {formatShort(conversation.updatedAt ?? conversation.createdAt)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        {/* ----- conversa ----- */}
        <section
          aria-label="Conversa aberta"
          className={`${mobileView === "list" ? "hidden" : "flex"} min-w-0 flex-1 flex-col lg:flex`}
        >
          {!selectedConversation ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
              <span className="flex size-16 items-center justify-center rounded-full bg-mint-100 text-action">
                <Icon icon={MessageIcon} size={32} />
              </span>
              <p className="text-lg font-medium text-deep">Suas mensagens aparecem aqui</p>
              <p className="max-w-sm text-sm text-ink-soft">
                Escolha uma conversa na lista ou inicie uma nova com uma pessoa autorizada.
              </p>
            </div>
          ) : (
            <>
              <header className="flex items-center gap-3 border-b border-line px-4 py-3 sm:px-5">
                <button
                  type="button"
                  onClick={() => setMobileView("list")}
                  aria-label="Voltar para a lista de conversas"
                  className="flex size-11 shrink-0 items-center justify-center rounded-full text-action hover:bg-mint-100 focus-visible:outline-2 focus-visible:outline-action lg:hidden"
                >
                  <Icon icon={ChevronLeftIcon} size={22} />
                </button>
                <Avatar name={conversationName(selectedConversation)} tone="soft" />
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-medium text-deep">
                    {conversationName(selectedConversation)}
                  </h2>
                  <p className="truncate text-sm text-ink-soft">
                    {otherPerson(selectedConversation)?.role ?? "Conversa"}
                  </p>
                </div>
              </header>

              <div className="relative min-h-0 flex-1">
                <div
                  ref={scrollRef}
                  onScroll={handleScroll}
                  role="log"
                  aria-live="polite"
                  aria-relevant="additions"
                  aria-label="Mensagens"
                  className="flex h-full flex-col overflow-y-auto px-4 py-4 sm:px-6"
                >
                  {loadingMessages ? (
                    <ThreadSkeleton />
                  ) : threadError ? (
                    <div className="m-auto flex flex-col items-center gap-3 text-center">
                      <p role="alert" className="max-w-sm text-sm text-alert-text">
                        {threadError}
                      </p>
                      <SmallButton onClick={() => setReloadKey((value) => value + 1)}>
                        Tentar novamente
                      </SmallButton>
                    </div>
                  ) : rows.length === 0 ? (
                    <div className="m-auto max-w-xs text-center">
                      <p className="text-base font-medium text-ink">Nenhuma mensagem ainda</p>
                      <p className="mt-1 text-sm text-ink-soft">
                        Envie a primeira mensagem para começar a conversa.
                      </p>
                    </div>
                  ) : (
                    rows.map((row) =>
                      row.kind === "day" ? (
                        <div key={row.key} className="my-4 flex justify-center">
                          <span className="rounded-full bg-mint-100 px-3 py-1 text-xs font-medium text-action-hover">
                            {row.label}
                          </span>
                        </div>
                      ) : (
                        <div
                          key={row.key}
                          className={`flex flex-col ${row.mine ? "items-end" : "items-start"} ${
                            row.first ? "mt-3" : "mt-1"
                          }`}
                        >
                          <div
                            className={`max-w-[88%] rounded-2xl px-4 py-2.5 sm:max-w-[75%] ${
                              row.mine
                                ? "rounded-br-md bg-action text-white"
                                : "rounded-bl-md border border-line bg-white text-ink"
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words text-base leading-6">
                              {row.message.data.text}
                            </p>
                            <p
                              className={`mt-1 text-right text-xs ${
                                row.mine ? "text-white/80" : "text-ink-soft"
                              }`}
                            >
                              {row.time}
                            </p>
                          </div>
                        </div>
                      ),
                    )
                  )}
                </div>

                {hasNew && (
                  <button
                    type="button"
                    onClick={jumpToLatest}
                    className="absolute bottom-3 left-1/2 inline-flex min-h-11 -translate-x-1/2 items-center rounded-full bg-action px-5 text-sm font-medium text-white shadow-[0_8px_20px_rgba(36,116,119,0.3)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
                  >
                    Nova mensagem ↓
                  </button>
                )}
              </div>

              <form
                className="border-t border-line px-4 py-3 sm:px-5"
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleSendMessage();
                }}
              >
                {sendError && (
                  <p role="alert" className="mb-2 rounded-2xl bg-alert-bg px-3 py-2 text-sm text-alert-text">
                    {sendError}
                  </p>
                )}
                <div className="flex items-end gap-3">
                  <label htmlFor="message-draft" className="sr-only">
                    Escreva sua mensagem
                  </label>
                  <textarea
                    id="message-draft"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                        event.preventDefault();
                        void handleSendMessage();
                      }
                    }}
                    maxLength={5000}
                    rows={2}
                    placeholder="Escreva sua mensagem"
                    className="min-h-12 flex-1 resize-none rounded-3xl border border-brand bg-white/70 px-5 py-3 text-sm text-ink placeholder:text-placeholder focus:border-action focus:outline-none focus:ring-4 focus:ring-action/15"
                  />
                  <button
                    type="submit"
                    disabled={sending || !draft.trim()}
                    className="inline-flex h-12 shrink-0 items-center rounded-full bg-action px-6 text-sm font-medium text-white transition-colors hover:bg-action-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {sending ? "Enviando…" : "Enviar"}
                  </button>
                </div>
                <div className="mt-1.5 flex items-center justify-between gap-3 text-xs text-ink-soft">
                  <span>Enter envia · Shift+Enter quebra a linha</span>
                  <span className={nearLimit ? "font-medium text-alert-text" : ""}>{draft.length}/5000</span>
                </div>
              </form>
            </>
          )}
        </section>
      </div>

      <Modal open={newOpen} title="Nova conversa" onClose={() => setNewOpen(false)}>
        {contacts.length === 0 ? (
          <div>
            <EmptyState
              title="Nenhum contato disponível"
              description={
                isPatient
                  ? "Só é possível conversar com cuidadores clínicos que tenham vínculo ativo e a comunicação habilitada."
                  : "Não encontramos uma conta associada a este paciente para iniciar a conversa."
              }
            />
            {isPatient && (
              <div className="mt-4 flex justify-center">
                <SmallButton to="/app/rede-de-cuidado">Ir para Minha rede</SmallButton>
              </div>
            )}
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {contacts.map((contact) => {
              const existing = conversations.some((item) => participantIds(item).includes(contact.id));
              return (
                <li key={contact.id}>
                  <button
                    type="button"
                    disabled={Boolean(creatingId)}
                    onClick={() => void handleOpenContact(contact)}
                    className="flex w-full items-center gap-3 rounded-2xl bg-mint-100/70 px-4 py-3 text-left transition-colors hover:bg-mint-100 focus-visible:outline-2 focus-visible:outline-action disabled:opacity-60"
                  >
                    <Avatar name={contact.name} tone="soft" className="bg-white!" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-base font-medium text-ink">{contact.name}</span>
                      <span className="block truncate text-sm text-ink-soft">{contact.role ?? "Contato"}</span>
                    </span>
                    <span className="shrink-0 text-sm font-medium text-action">
                      {creatingId === contact.id ? "Criando…" : existing ? "Abrir conversa" : "Iniciar"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Modal>
    </div>
  );
}