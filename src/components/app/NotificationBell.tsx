
import { useCallback, useEffect, useState } from "react";
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
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function NotificationBell() {
  const { session } = useSession();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<
    NotificationItem[]
  >([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  async function handleToggle() {
    const nextOpen = !open;
    setOpen(nextOpen);

    if (nextOpen) {
      setLoading(true);
      await refresh();
      setLoading(false);
    }
  }

  async function handleNotificationClick(
    notification: NotificationItem,
  ) {
    if (!session?.accessToken) return;

    if (notification.status === "UNREAD") {
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
        return;
      }
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
    <div className="relative">
      <button
        type="button"
        onClick={() => void handleToggle()}
        aria-label={
          unreadCount > 0
            ? `Notificações, ${unreadCount} não lidas`
            : "Notificações"
        }
        aria-expanded={open}
        className="relative flex size-11 shrink-0 items-center justify-center rounded-full text-action transition-colors hover:bg-mint-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-[22px]"
        >
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute right-0.5 top-0.5 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-action px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Central de notificações"
          className="absolute right-0 top-full z-50 mt-3 w-[min(90vw,360px)] overflow-hidden rounded-[24px] border border-line bg-white text-ink shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <h2 className="font-semibold text-deep">
                Notificações
              </h2>
              <p className="mt-0.5 text-xs text-ink-soft">
                {unreadCount === 0
                  ? "Você está em dia"
                  : `${unreadCount} não lida${unreadCount === 1 ? "" : "s"}`}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar notificações"
              className="flex size-9 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-mint-100"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="size-5"
              >
                <path d="m18 6-12 12M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="max-h-[min(60vh,420px)] overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-ink-soft">
                Carregando notificações...
              </p>
            ) : error && notifications.length === 0 ? (
              <div className="px-5 py-6 text-center">
                <p className="text-sm text-ink-soft">{error}</p>
                <button
                  type="button"
                  onClick={() => void refresh()}
                  className="mt-3 text-sm font-semibold text-action hover:underline"
                >
                  Tentar novamente
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-5 py-9 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-mint-100 text-action">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    className="size-6"
                  >
                    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                    <path d="M10 21h4" />
                  </svg>
                </div>
                <p className="mt-3 text-sm font-medium">
                  Nenhuma notificação por enquanto
                </p>
                <p className="mt-1 text-xs text-ink-soft">
                  Quando houver novidades, elas aparecerão aqui.
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification._id}
                  type="button"
                  onClick={() =>
                    void handleNotificationClick(notification)
                  }
                  className={`flex w-full gap-3 border-b border-line px-5 py-4 text-left transition-colors last:border-b-0 hover:bg-mint-100/50 ${
                    notification.status === "UNREAD"
                      ? "bg-mint-100/30"
                      : "bg-white"
                  }`}
                >
                  <span
                    className={`mt-1 size-2 shrink-0 rounded-full ${
                      notification.status === "UNREAD"
                        ? "bg-action"
                        : "bg-transparent"
                    }`}
                  />

                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-deep">
                      {notification.title}
                    </span>
                    <span className="mt-1 block whitespace-normal break-words text-sm leading-5 text-ink-soft">
                      {notification.message}
                    </span>
                    <span className="mt-2 block text-xs text-ink-soft">
                      {formatDate(notification.createdAt)}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>

          {error && notifications.length > 0 && (
            <p role="status" className="border-t border-line px-5 py-3 text-xs text-ink-soft">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}