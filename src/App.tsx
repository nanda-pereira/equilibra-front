import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import AppLayout from "./components/app/AppLayout";
import RequireSession from "./components/app/RequireSession";
import SessionProvider from "./modules/session/SessionProvider";
import DashboardPage from "./pages/app/DashboardPage";
import UnderConstructionPage from "./pages/app/UnderConstructionPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import LandingPage from "./pages/landing/LandingPage";

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
            <Route path=":section" element={<UnderConstructionPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SessionProvider>
    </BrowserRouter>
  );
}

export default App;