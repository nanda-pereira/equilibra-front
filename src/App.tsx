import "./modules/app/preferences"; // aplica texto maior, contraste e animações já na abertura
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import AppLayout from "./components/app/AppLayout";
import RequireSession from "./components/app/RequireSession";
import SessionProvider from "./modules/session/SessionProvider";
import AgendaPage from "./pages/app/AgendaPage";
import ClinicalEvolutionPage from "./pages/app/ClinicalEvolutionPage";
import DashboardPage from "./pages/app/DashboardPage";
import DoctorAgendaPage from "./pages/app/DoctorAgendaPage";
import ExercisesPage from "./pages/app/ExercisesPage";
import MedicationsPage from "./pages/app/MedicationsPage";
import PatientDetailPage from "./pages/app/PatientDetailPage";
import PatientsPage from "./pages/app/PatientsPage";
import ProfilePage from "./pages/app/ProfilePage";
import ReportsPage from "./pages/app/ReportsPage";
import SettingsPage from "./pages/app/SettingsPage";
import TreatmentPlanPage from "./pages/app/TreatmentPlanPage";
import UnderConstructionPage from "./pages/app/UnderConstructionPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import LandingPage from "./pages/landing/LandingPage";
import { useSession } from "./modules/session/session";

function AgendaRoute() {
  const { session } = useSession();
  if (!session) return null;
  return session.profile === "medico" ? <DoctorAgendaPage /> : <AgendaPage />;
}

function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/cadastro" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/app"
            element={
              <RequireSession>
                <AppLayout />
              </RequireSession>
            }
          >
            <Route index element={<Navigate to="inicio" replace />} />
            <Route path="inicio" element={<DashboardPage />} />
            <Route path="agenda" element={<AgendaRoute />} />
            <Route path="exercicios" element={<ExercisesPage />} />
            <Route path="medicamentos" element={<MedicationsPage />} />
            <Route path="plano-de-tratamento" element={<TreatmentPlanPage />} />
            <Route path="pacientes" element={<PatientsPage />} />
            <Route path="pacientes/:patientId" element={<PatientDetailPage />} />
            <Route path="evolucao-clinica" element={<ClinicalEvolutionPage />} />
            <Route path="relatorios" element={<ReportsPage />} />
            <Route path="perfil" element={<ProfilePage />} />
            <Route path="configuracoes" element={<SettingsPage />} />
            <Route path=":section" element={<UnderConstructionPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SessionProvider>
    </BrowserRouter>
  );
}

export default App;