import {
  ActivityIcon,
  AlertIcon,
  CalendarIcon,
  MedicineIcon,
  MessageIcon,
  NavHomeIcon,
  PatientsIcon,
  ProfileIcon,
  ReportIcon,
  SettingsIcon,
} from "../../components/ui/icons";
import type { ProfileType } from "../auth/types";

export type NavItem = { path: string; label: string; icon: typeof NavHomeIcon };
type NavConfig = { main: NavItem[]; bottom: NavItem[] };

const home: NavItem = { path: "inicio", label: "Início", icon: NavHomeIcon };
const monitoring: NavItem = { path: "monitoramento", label: "Monitoramento", icon: ActivityIcon };
const medications: NavItem = { path: "medicamentos", label: "Medicamentos", icon: MedicineIcon };
const agenda: NavItem = { path: "agenda", label: "Agenda", icon: CalendarIcon };
const messages: NavItem = { path: "mensagens", label: "Mensagens", icon: MessageIcon };
const patients: NavItem = { path: "pacientes", label: "Pacientes", icon: PatientsIcon };
const reports: NavItem = { path: "relatorios", label: "Relatórios", icon: ReportIcon };
const events: NavItem = { path: "eventos", label: "Eventos", icon: AlertIcon };
const evolution: NavItem = { path: "evolucao-clinica", label: "Evolução clínica", icon: ActivityIcon };
const myProfile: NavItem = { path: "perfil", label: "Meu perfil", icon: ProfileIcon };
const settings: NavItem = { path: "configuracoes", label: "Configurações", icon: SettingsIcon };

export const NAV_BY_PROFILE: Record<ProfileType, NavConfig> = {
  paciente: { main: [home, monitoring, medications, agenda, messages], bottom: [myProfile] },
  medico: { main: [home, patients, agenda, evolution, reports, messages], bottom: [settings] },
  "cuidador-clinico": { main: [home, patients, monitoring, medications, agenda, reports], bottom: [myProfile] },
  "cuidador-domiciliar": { main: [home, medications, agenda, events], bottom: [myProfile] },
};

export function findNavLabel(profile: ProfileType, path: string) {
  const { main, bottom } = NAV_BY_PROFILE[profile];
  const found = [...main, ...bottom].find((item) => item.path === path);
  if (found) return found.label;
  const text = path.replace(/-/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}