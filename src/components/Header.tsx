import logo from "../assets/pedras-logo.svg";
import Button from "./ui/Button";

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
      <div className="mx-auto flex w-full max-w-[1481px] items-center justify-between gap-6 px-6 pt-6 md:px-10 xl:px-[6.4vw] xl:pt-[43px]">
        <a
          href="#inicio"
          aria-label="Equilibra — página inicial"
          className="flex shrink-0 items-center gap-1.5"
        >
          <img src={logo} alt="" className="h-10 w-auto md:h-[53px]" />
          <span className="text-base font-semibold tracking-[0.32em] text-deep xl:text-[22px]">
            EQUILIBRA
          </span>
        </a>

        <nav
          aria-label="Navegação principal"
          className="hidden items-center gap-5 lg:flex xl:gap-11"
        >
          {navigationItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-[15px] text-ink transition-colors hover:text-action xl:text-base"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <Button size="sm" href="#">
          Acesso à plataforma
        </Button>
      </div>
    </header>
  );
}