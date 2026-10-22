
import logo from "../assets/pedras-logo.svg";

const navigationItems = [
  { label: "Início", href: "#inicio" },
  { label: "Sobre", href: "#problema" },
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Para quem", href: "#para-quem" },
  { label: "Benefícios", href: "#solucao" },
];

export default function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <div className="mx-auto flex min-h-16 max-w-[1440px] items-center justify-between gap-6 px-6 py-4 lg:px-14">
        <a
          href="#inicio"
          aria-label="Equilibra — página inicial"
          className="flex shrink-0 items-center gap-2"
        >
          <img src={logo} alt="" className="h-9 w-auto" />
          <span className="text-xs font-semibold tracking-[0.3em] text-[#123F42]">
            EQUILIBRA
          </span>
        </a>

        <nav
          aria-label="Navegação principal"
          className="hidden items-center gap-6 md:flex lg:gap-8"
        >
          {navigationItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-[11px] text-[#282B2D] transition-colors hover:text-[#247477]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a
          href="#acesso"
          className="shrink-0 rounded-full bg-[#247477] px-4 py-2 text-[10px] font-medium text-white transition-colors hover:bg-[#123F42]"
        >
          Acesso à plataforma
        </a>
      </div>
    </header>
  );
}