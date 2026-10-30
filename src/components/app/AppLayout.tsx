import { Link, NavLink, Outlet, useNavigate } from "react-router";
import logo from "../../assets/pedras-logo.svg";
import { NAV_BY_PROFILE, type NavItem } from "../../modules/app/navigation";
import { useSession } from "../../modules/session/session";
import Icon from "../ui/Icon";
import { LogoutIcon } from "../ui/icons";

function SidebarLink({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={`/app/${item.path}`}
      className={({ isActive }) =>
        `flex h-12 items-center gap-3 rounded-full px-4 text-base transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action ${
          isActive
            ? "bg-mint-100 font-semibold text-action"
            : "text-ink-soft hover:bg-mint-100/60 hover:text-action"
        }`
      }
    >
      <Icon icon={item.icon} size={22} />
      {item.label}
    </NavLink>
  );
}

function BottomLink({ item }: { item: NavItem }) {
  return (
    <NavLink
      to={`/app/${item.path}`}
      className={({ isActive }) =>
        `flex min-w-[84px] flex-col items-center gap-1 rounded-2xl px-2 py-2 text-sm ${
          isActive ? "bg-mint-100 font-semibold text-action" : "text-ink-soft"
        }`
      }
    >
      <Icon icon={item.icon} size={22} />
      <span className="whitespace-nowrap">{item.label}</span>
    </NavLink>
  );
}

export default function AppLayout() {
  const { session, signOut } = useSession();
  const navigate = useNavigate();

  if (!session) return null; // RequireSession já protege a rota

  const nav = NAV_BY_PROFILE[session.profile];

  function handleSignOut() {
    signOut();
    navigate("/login");
  }

  return (
    <div className="relative isolate min-h-svh bg-page">
      {/* Fundo decorativo (mesmas manchas do cadastro) */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-[140px] -top-[100px] size-[520px] rounded-full bg-mint-200/60 blur-[100px]" />
        <div className="absolute -bottom-[220px] -right-[180px] size-[560px] rounded-full bg-brand/15 blur-[110px]" />
      </div>

      {/* Menu lateral (desktop) */}
      <aside className="glass-card fixed inset-y-4 left-4 z-30 hidden w-64 flex-col rounded-[32px] p-4 lg:flex">
        <Link to="/app/inicio" aria-label="Equilibra — início" className="flex items-center gap-1.5 px-3 py-3">
          <img src={logo} alt="" className="h-10 w-auto" />
          <span className="text-base font-semibold tracking-[0.32em] text-deep">EQUILIBRA</span>
        </Link>

        <nav aria-label="Navegação principal" className="mt-4 flex flex-1 flex-col gap-1.5">
          {nav.main.map((item) => (
            <SidebarLink key={item.path} item={item} />
          ))}
        </nav>

        <div className="flex flex-col gap-1.5 border-t border-line pt-4">
          {nav.bottom.map((item) => (
            <SidebarLink key={item.path} item={item} />
          ))}
          <button
            type="button"
            onClick={handleSignOut}
            className="flex h-12 items-center gap-3 rounded-full px-4 text-base text-ink-soft transition-colors hover:bg-mint-100/60 hover:text-action focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
          >
            <Icon icon={LogoutIcon} size={22} />
            Sair
          </button>
        </div>
      </aside>

      <div className="lg:pl-[18rem]">
        <main className="mx-auto w-full max-w-[1200px] px-5 pb-28 pt-8 lg:px-8 lg:pb-10">
          <Outlet />
        </main>
      </div>

      {/* Barra inferior (abaixo de lg) */}
      <nav
        aria-label="Navegação principal"
        className="glass-card fixed inset-x-3 bottom-3 z-30 flex gap-1 overflow-x-auto rounded-[28px] p-2 lg:hidden"
      >
        {[...nav.main, ...nav.bottom].map((item) => (
          <BottomLink key={item.path} item={item} />
        ))}
        <button
          type="button"
          onClick={handleSignOut}
          className="flex min-w-[84px] flex-col items-center gap-1 rounded-2xl px-2 py-2 text-sm text-ink-soft"
        >
          <Icon icon={LogoutIcon} size={22} />
          <span>Sair</span>
        </button>
      </nav>
    </div>
  );
}