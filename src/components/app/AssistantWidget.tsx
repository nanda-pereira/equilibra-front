import { useEffect, useRef, useState } from "react";
import logo from "../../assets/pedras-logo.svg";
import { buildAssistant, type QuickReply } from "../../modules/app/assistant";
import { usePreferences } from "../../modules/app/preferences";
import { useAppState } from "../../modules/demo/appStore";
import { useSession } from "../../modules/session/session";
import Icon from "../ui/Icon";
import { CloseIcon } from "../ui/icons";
import SmallButton from "./SmallButton";

type Bubble = { from: "bot" | "user"; text: string };

function BotBubble({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-mint-100">
        <img src={logo} alt="" className="h-5 w-auto" />
      </span>
      <p className="max-w-[88%] rounded-2xl rounded-tl-md bg-mint-100/80 px-4 py-2.5 text-base text-ink">
        {text}
      </p>
    </div>
  );
}

function AssistantPanel({ onClose }: { onClose: () => void }) {
  const { session } = useSession();
  const prefs = usePreferences();
  useAppState(); // atualiza o resumo quando os dados mudam
  const headingRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(1);
  const [thread, setThread] = useState<Bubble[]>([]);

  const data = session
    ? buildAssistant({
        profile: session.profile,
        name: session.name,
        medReminders: prefs.medReminders,
        apptReminders: prefs.apptReminders,
      })
    : null;
  const total = data?.overview.length ?? 0;

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  // Mensagens aparecem uma a uma (ou de uma vez, se o movimento estiver reduzido)
  useEffect(() => {
    const calm =
      prefs.reduceMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (calm) {
      setVisible(total);
      return undefined;
    }
    setVisible(1);
    const timers = Array.from({ length: Math.max(total - 1, 0) }, (_, i) =>
      window.setTimeout(() => setVisible(i + 2), (i + 1) * 700),
    );
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [total, prefs.reduceMotion]);

  useEffect(() => {
    const body = bodyRef.current;
    if (body) body.scrollTo({ top: body.scrollHeight, behavior: "smooth" });
  }, [visible, thread]);

  if (!data) return null;

  const ask = (reply: QuickReply) =>
    setThread((current): Bubble[] => [
      ...current,
      { from: "user", text: reply.label },
      ...reply.answer.map((text): Bubble => ({ from: "bot", text })),
    ]);

  return (
    <section
      id="assistant-panel"
      role="dialog"
      aria-modal="false"
      aria-labelledby="assistant-title"
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
      }}
      className="fixed bottom-24 right-4 z-40 flex max-h-[min(72svh,580px)] w-[min(calc(100vw-2rem),392px)] flex-col overflow-hidden rounded-[28px] border border-white bg-white shadow-[0_24px_64px_rgba(36,116,119,0.28)] sm:right-6"
    >
      <header className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
        <div className="min-w-0">
          <h2
            id="assistant-title"
            ref={headingRef}
            tabIndex={-1}
            className="text-lg font-medium text-deep focus:outline-none"
          >
            Assistente do Equilibra
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Resumo automático com base nos seus dados. Não usa inteligência artificial e não
            substitui a sua equipe de saúde.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar assistente"
          className="-mr-2 flex size-11 shrink-0 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-mint-100 focus-visible:outline-2 focus-visible:outline-action"
        >
          <Icon icon={CloseIcon} size={22} />
        </button>
      </header>

      <div ref={bodyRef} aria-live="polite" className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-4">
        {data.overview.slice(0, visible).map((text, index) => (
          <BotBubble key={`${index}-${text}`} text={text} />
        ))}
        {thread.map((bubble, index) =>
          bubble.from === "user" ? (
            <p
              key={index}
              className="ml-auto max-w-[85%] rounded-2xl rounded-tr-md bg-action px-4 py-2.5 text-base text-white"
            >
              {bubble.text}
            </p>
          ) : (
            <BotBubble key={index} text={bubble.text} />
          ),
        )}
      </div>

      <div className="flex flex-wrap gap-2.5 border-t border-line px-5 py-4">
        {data.replies.map((reply) => (
          <SmallButton key={reply.id} onClick={() => ask(reply)}>
            {reply.label}
          </SmallButton>
        ))}
      </div>
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
        aria-label={open ? "Fechar assistente" : "Abrir assistente do Equilibra"}
        aria-expanded={open}
        aria-controls="assistant-panel"
        className="fixed bottom-4 right-4 z-40 flex size-14 items-center justify-center rounded-full border border-white bg-white shadow-[0_12px_32px_rgba(36,116,119,0.35)] ring-1 ring-brand/40 transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-action sm:bottom-6 sm:right-6"
      >
        {open ? (
          <Icon icon={CloseIcon} size={24} className="text-action" />
        ) : (
          <img src={logo} alt="" className="h-8 w-auto" />
        )}
      </button>
    </>
  );
}