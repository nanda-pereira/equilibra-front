
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { SessionContext, type Session } from "./session";
import { refreshSessionTokens } from "../auth/sessionApi";

const STORAGE_KEY = "equilibra:demo-session";

function loadSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function persistSession(next: Session | null) {
  try {
    if (next) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // O estado em memória continua funcionando.
  }
}

function getTokenExpiration(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(normalized);
    const claims = JSON.parse(decoded) as { exp?: number };

    return typeof claims.exp === "number" ? claims.exp * 1000 : null;
  } catch {
    return null;
  }
}

export default function SessionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [session, setSession] = useState<Session | null>(loadSession);

  useEffect(() => {
    if (!session?.accessToken || !session.refreshToken) return;

    let cancelled = false;

    const expiration = getTokenExpiration(session.accessToken);
    const refreshDelay = expiration
      ? Math.max(0, expiration - Date.now() - 60_000)
      : 12 * 60 * 1000;

    const refresh = async () => {
      try {
        const tokens = await refreshSessionTokens(session.refreshToken!);

        if (cancelled) return;

        const updatedSession: Session = {
          ...session,
          ...tokens,
        };

        persistSession(updatedSession);
        setSession(updatedSession);
      } catch {
        if (cancelled) return;

        // Se a renovação falhar, não mantém uma sessão possivelmente inválida.
        persistSession(null);
        setSession(null);
      }
    };

    const timeoutId = setTimeout(() => {
      void refresh();
    }, refreshDelay);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [session]);

  const value = useMemo(
    () => ({
      session,
      signIn: (next: Session) => {
        persistSession(next);
        setSession(next);
      },
      signOut: () => {
        persistSession(null);
        setSession(null);
      },
    }),
    [session],
  );

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}