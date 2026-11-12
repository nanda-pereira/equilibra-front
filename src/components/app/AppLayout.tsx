import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router";
import logo from "../../assets/pedras-logo.svg";
import { NAV_BY_PROFILE, type NavItem } from "../../modules/app/navigation";
import { useSession } from "../../modules/session/session";
import Icon from "../ui/Icon";
import { CloseIcon, LogoutIcon, MenuIcon } from "../ui/icons";
import AssistantWidget from "./AssistantWidget";
import { logoutBackendSession } from "../../modules/auth/sessionApi";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex min-h-12 items-center gap-3 rounded-full px-4 text-base transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action ${
    isActive
      ? "bg-mint-100 font-semibold text-action"
      : "text-ink-soft hover:bg-mint-100/60 hover:text-action"
  }`;

type MenuLinksProps = {
  main: NavItem[];
  bottom: NavItem[];
  onSignOut: () => void;
  onNavigate?: () => void;
};

function MenuLinks({ main, bottom, onSignOut, onNavigate }: MenuLinksProps) {
  const renderLink = (item: NavItem) => (
    <NavLink key={item.path} to={`/app/${item.path}`} onClick={onNavigate} className={linkClass}>
      <Icon icon={item.icon} size={22} />
      {item.label}
    </NavLink>
  );

  return (
    <>
      <nav aria-label="Navegação principal" className="mt-4 flex flex-1 flex-col gap-1.5 overflow-y-auto">
        {main.map(renderLink)}
      </nav>
      <div className="flex flex-col gap-1.5 border-t border-line pt-4">
        {bottom.map(renderLink)}
        <button
          type="button"
          onClick={onSignOut}
          className="flex min-h-12 items-center gap-3 rounded-full px-4 text-base text-ink-soft transition-colors hover:bg-mint-100/60 hover:text-action focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
        >
          <Icon icon={LogoutIcon} size={22} />
          Sair
        </button>
      </div>
    </>
  );
}

function Brand({ small = false }: { small?: boolean }) {
  return (
    <>
      <img src={logo} alt="" className={small ? "h-8 w-auto" : "h-10 w-auto"} />
      <span
        className={`font-semibold text-deep ${
          small ? "text-sm tracking-[0.28em]" : "text-base tracking-[0.32em]"
        }`}
      >
        EQUILIBRA
      </span>
    </>
  );
}

export default function AppLayout() {
  const { session, signOut } = useSession();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const drawerRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = drawerRef.current;
    if (!dialog) return;
    if (menuOpen && !dialog.open) dialog.showModal();
    if (!menuOpen && dialog.open) dialog.close();
  }, [menuOpen]);

  if (!session) return null;

  const nav = NAV_BY_PROFILE[session.profile];

  async function handleSignOut() {
    setMenuOpen(false);

    const refreshToken = session?.refreshToken;

    try {
      if (refreshToken) {
        await logoutBackendSession(refreshToken);
      }
    } catch (error) {
      console.error("Não foi possível revogar a sessão no servidor:", error);
    } finally {
      signOut();
      navigate("/login");
    }
  }

  return (
    <div className="relative isolate min-h-svh bg-page">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-[140px] -top-[100px] size-[520px] rounded-full bg-mint-200/60 blur-[100px]" />
        <div className="absolute -bottom-[220px] -right-[180px] size-[560px] rounded-full bg-brand/15 blur-[110px]" />
      </div>

      {/* Menu lateral (desktop) */}
      <aside className="glass-card fixed inset-y-4 left-4 z-30 hidden w-64 flex-col rounded-[32px] p-4 lg:flex">
        <Link to="/app/inicio" aria-label="Equilibra — início" className="flex items-center gap-1.5 px-3 py-3">
          <Brand />
        </Link>
        <MenuLinks main={nav.main} bottom={nav.bottom} onSignOut={handleSignOut} />
      </aside>

      {/* Barra superior (celular e tablet) */}
      <header className="glass-card sticky top-3 z-20 mx-3 mt-3 flex h-14 items-center justify-between rounded-full pl-4 pr-2 lg:hidden">
        <Link to="/app/inicio" aria-label="Equilibra — início" className="flex items-center gap-1.5">
          <Brand small />
        </Link>
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menu"
          className="flex size-11 items-center justify-center rounded-full text-action transition-colors hover:bg-mint-100 focus-visible:outline-2 focus-visible:outline-action"
        >
          <Icon icon={MenuIcon} size={24} />
        </button>
      </header>

      {/* Menu deslizante (celular e tablet) */}
      <dialog
        ref={drawerRef}
        aria-label="Menu"
        onClose={() => setMenuOpen(false)}
        onClick={(event) => {
          if (event.target === drawerRef.current) setMenuOpen(false);
        }}
        className="m-0 h-svh max-h-none w-[min(86vw,320px)] rounded-r-[32px] border-0 bg-white p-4 text-ink backdrop:bg-deep/40 backdrop:backdrop-blur-sm lg:hidden"
      >
        {menuOpen && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between">
              <Link
                to="/app/inicio"
                onClick={() => setMenuOpen(false)}
                aria-label="Equilibra — início"
                className="flex items-center gap-1.5 px-2"
              >
                <Brand />
              </Link>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Fechar menu"
                className="flex size-11 items-center justify-center rounded-full text-ink-soft hover:bg-mint-100 focus-visible:outline-2 focus-visible:outline-action"
              >
                <Icon icon={CloseIcon} size={22} />
              </button>
            </div>
            <MenuLinks
              main={nav.main}
              bottom={nav.bottom}
              onSignOut={handleSignOut}
              onNavigate={() => setMenuOpen(false)}
            />
          </div>
        )}
      </dialog>

      <div className="lg:pl-[18rem]">
        <main className="mx-auto w-full max-w-[1200px] px-4 pb-10 pt-6 sm:px-6 lg:px-8 lg:pt-8">
          <Outlet />
        </main>
      </div>
      <AssistantWidget />
    </div>
  );
}