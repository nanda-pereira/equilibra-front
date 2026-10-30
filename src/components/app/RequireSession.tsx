import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { useSession } from "../../modules/session/session";

export default function RequireSession({ children }: { children: ReactNode }) {
  const { session } = useSession();

  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}