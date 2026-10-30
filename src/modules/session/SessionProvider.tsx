import { useMemo, useState, type ReactNode } from "react";
import { SessionContext, type Session } from "./session";

const STORAGE_KEY = "equilibra:demo-session"; // TODO: trocar quando houver JWT real

function loadSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export default function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(loadSession);

  const value = useMemo(
    () => ({
      session,
      signIn: (next: Session) => {
        try {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          /* armazenamento indisponível: segue só em memória */
        }
        setSession(next);
      },
      signOut: () => {
        try {
          sessionStorage.removeItem(STORAGE_KEY);
        } catch {
          /* ignora */
        }
        setSession(null);
      },
    }),
    [session],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}