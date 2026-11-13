
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useSession } from "../../modules/session/session";
import {
  getNotificationsWithCount,
  markNotificationAsRead,
  type NotificationItem,
} from "../../services/api/notifications";

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function BellIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      className="size-5"
    >
      <path d="m18 6-12 12M6 6l12 12" />
    </svg>
  );
}

export default function NotificationBell() {
  const { session } = useSession();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [markingAsRead, setMarkingAsRead] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!session?.accessToken) return;

    try {
      const result = await getNotificationsWithCount(
        session.accessToken,
      );

      setNotifications(result.items);
      setUnreadCount(result.total);
      setError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar as notificações.",
      );
    }
  }, [session?.accessToken]);

  useEffect(() => {
    if (!session?.accessToken) return;

    void refresh();

    const interval = window.setInterval(() => {
      void refresh();
    }, 30_000);

    return () => window.clearInterval(interval);
  }, [session?.accessToken, refresh]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !containerRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  async function handleToggle() {
    const nextOpen = !open;
    setOpen(nextOpen);

    if (nextOpen) {
      setLoading(true);

      try {
        await refresh();
      } finally {
        setLoading(false);
      }
    }
  }

  async function handleNotificationClick(
    notification: NotificationItem,
  ) {
    if (!session?.accessToken || markingAsRead) return;

    if (notification.status === "UNREAD") {
      setMarkingAsRead(notification._id);

      try {
        await markNotificationAsRead(
          session.accessToken,
          notification._id,
        );

        setNotifications((current) =>
          current.map((item) =>
            item._id === notification._id
              ? { ...item, status: "READ" }
              : item,
          ),
        );

        setUnreadCount((count) => Math.max(0, count - 1));
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível marcar a notificação como lida.",
        );
        setMarkingAsRead(null);
        return;
      }

      setMarkingAsRead(null);
    }

    setOpen(false);

    const content =
      `${notification.title} ${notification.message}`.toLowerCase();

    if (
      content.includes("mensagem") ||
      content.includes("conversa")
    ) {
      navigate("/app/mensagens");
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => void handleToggle()}
        aria-label={
          unreadCount > 0
            ? `Notificações, ${unreadCount} não lidas`
            : "Notificações"
        }
        aria-expanded={open}
        aria-haspopup="dialog"
        className="relative flex size-11 shrink-0 items-center justify-center rounded-full text-action transition-colors duration-200 hover:bg-mint-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
      >
        <BellIcon className="size-[22px]" />

        {unreadCount > 0 && (
          <span className="absolute right-0.5 top-0.5 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-action px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <section
          role="dialog"
          aria-label="Central de notificações"
          className="fixed left-1/2 top-[76px] z-50 w-[calc(100vw-24px)] max-w-[380px] -translate-x-1/2 overflow-hidden rounded-[24px] border border-line bg-white text-ink shadow-[0_20px_60px_rgba(18,63,66,0.16)] sm:top-[84px] sm:rounded-[28px] lg:absolute lg:left-auto lg:right-0 lg:top-full lg:mt-3 lg:w-[380px] lg:translate-x-0"
        >
          <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-5 sm:px-6">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold tracking-[-0.02em] text-deep">
                  Notificações
                </h2>

                {unreadCount > 0 && (
                  <span className="rounded-full bg-mint-100 px-2.5 py-1 text-xs font-semibold text-action">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm text-ink-soft">
                {unreadCount === 0
                  ? "Tudo em dia por aqui."
                  : `${unreadCount} notificação${unreadCount === 1 ? "" : "ões"} não lida${unreadCount === 1 ? "" : "s"}`}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar notificações"
              className="flex size-10 shrink-0 items-center justify-center rounded-full text-ink-soft transition-colors duration-200 hover:bg-mint-100 hover:text-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
            >
              <CloseIcon />
            </button>
          </header>

          <div
            aria-live="polite"
            aria-busy={loading && notifications.length === 0}
            className="max-h-[min(65vh,440px)] overflow-y-auto overscroll-contain"
          >
            {loading && notifications.length === 0 ? (
              <div className="space-y-5 px-5 py-6 sm:px-6">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex gap-3">
                    <div className="mt-1 size-2 shrink-0 rounded-full bg-mint-100" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="h-4 w-3/5 animate-pulse rounded-full bg-mint-100 motion-reduce:animate-none" />
                      <div className="h-3 w-full animate-pulse rounded-full bg-mint-100/70 motion-reduce:animate-none" />
                      <div className="h-3 w-2/5 animate-pulse rounded-full bg-mint-100/70 motion-reduce:animate-none" />
                    </div>
                  </div>
                ))}
                <p className="text-center text-xs text-ink-soft">
                  Carregando notificações...
                </p>
              </div>
            ) : error && notifications.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-mint-100 text-action">
                  <BellIcon className="size-6" />
                </div>

                <p className="mt-4 text-sm font-medium text-deep">
                  Não conseguimos carregar as notificações
                </p>

                <p role="alert" className="mt-2 text-sm leading-5 text-ink-soft">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setLoading(true);
                    void refresh().finally(() => setLoading(false));
                  }}
                  className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-action px-5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#1B5E60] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
                >
                  Tentar novamente
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-mint-100 text-action">
                  <BellIcon className="size-6" />
                </div>

                <h3 className="mt-4 text-sm font-semibold text-deep">
                  Nenhuma notificação por enquanto
                </h3>

                <p className="mx-auto mt-2 max-w-[240px] text-sm leading-5 text-ink-soft">
                  Quando houver novidades, elas aparecerão aqui.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {notifications.map((notification) => {
                  const unread = notification.status === "UNREAD";
                  const isMarking = markingAsRead === notification._id;

                  return (
                    <li key={notification._id}>
                      <button
                        type="button"
                        disabled={markingAsRead !== null}
                        onClick={() =>
                          void handleNotificationClick(notification)
                        }
                        className={`group flex w-full gap-3 px-5 py-4 text-left transition-colors duration-200 hover:bg-mint-100/50 focus-visible:bg-mint-100/50 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-action disabled:cursor-wait sm:px-6 ${
                          unread ? "bg-mint-100/25" : "bg-white"
                        }`}
                      >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-mint-100 text-action">
                          <BellIcon className="size-[18px]" />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="flex items-start justify-between gap-3">
                            <span
                              className={`block break-words text-sm leading-5 ${
                                unread
                                  ? "font-semibold text-deep"
                                  : "font-medium text-ink"
                              }`}
                            >
                              {notification.title}
                            </span>

                            {unread && (
                              <span
                                aria-label="Não lida"
                                className="mt-1.5 size-2 shrink-0 rounded-full bg-action"
                              />
                            )}
                          </span>

                          <span className="mt-1.5 block break-words text-sm leading-[1.55] text-ink-soft">
                            {notification.message}
                          </span>

                          <span className="mt-2.5 flex items-center justify-between gap-2 text-xs text-ink-soft">
                            <span>{formatDate(notification.createdAt)}</span>

                            {isMarking && (
                              <span className="text-action">
                                Atualizando...
                              </span>
                            )}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {error && notifications.length > 0 && (
            <div
              role="status"
              className="border-t border-line bg-mint-100/40 px-5 py-3 sm:px-6"
            >
              <p className="text-xs leading-5 text-ink-soft">{error}</p>
              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  void refresh().finally(() => setLoading(false));
                }}
                className="mt-1 min-h-9 text-xs font-semibold text-action underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-action"
              >
                Tentar atualizar novamente
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}