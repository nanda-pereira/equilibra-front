import { createContext, useContext } from "react";
import type { ProfileType } from "../auth/types";

export type Session = { profile: ProfileType; name: string };

type SessionContextValue = {
  session: Session | null;
  signIn: (session: Session) => void;
  signOut: () => void;
};

export const SessionContext = createContext<SessionContextValue | null>(null);

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession deve ser usado dentro de SessionProvider");
  return context;
}