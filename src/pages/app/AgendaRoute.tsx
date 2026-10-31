import { useSession } from "../../modules/session/session";
import AgendaPage from "./AgendaPage";
import DoctorAgendaPage from "./DoctorAgendaPage";

export default function AgendaRoute() {
  const { session } = useSession();
  if (!session) return null;
  return session.profile === "medico" ? <DoctorAgendaPage /> : <AgendaPage />;
}