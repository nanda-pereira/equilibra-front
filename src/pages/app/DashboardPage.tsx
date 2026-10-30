import type { ComponentType } from "react";
import type { ProfileType } from "../../modules/auth/types";
import { useSession } from "../../modules/session/session";
import ClinicalCaregiverDashboard from "./dashboards/ClinicalCaregiverDashboard";
import DoctorDashboard from "./dashboards/DoctorDashboard";
import HomeCaregiverDashboard from "./dashboards/HomeCaregiverDashboard";
import PatientDashboard from "./dashboards/PatientDashboard";

const DASHBOARDS: Record<ProfileType, ComponentType> = {
  paciente: PatientDashboard,
  medico: DoctorDashboard,
  "cuidador-clinico": ClinicalCaregiverDashboard,
  "cuidador-domiciliar": HomeCaregiverDashboard,
};

export default function DashboardPage() {
  const { session } = useSession();
  if (!session) return null;

  const Dashboard = DASHBOARDS[session.profile];
  return <Dashboard />;
}