import { useEffect, useRef, useState } from "react";
import logo from "../assets/pedras-logo.svg";
import Button from "./ui/Button";
import Icon from "./ui/Icon";
import { CloseIcon, MenuIcon } from "./ui/icons";

const navigationItems = [
  { label: "Início", href: "#inicio" },
  { label: "Sobre", href: "#problema" },
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Para quem", href: "#para-quem" },
  { label: "Benefícios", href: "#solucao" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return undefined;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <div className="mx-auto flex w-full max-w-[1481px] items-center justify-between gap-4 px-6 pt-6 md:px-10 xl:px-[6.4vw] xl:pt-[43px]">
        <a
          href="#inicio"
          aria-label="Equilibra — página inicial"
          className="flex shrink-0 items-center gap-1.5"
        >
          <img src={logo} alt="" className="h-10 w-auto md:h-[53px]" />
          <span className="text-sm font-semibold tracking-[0.3em] text-deep sm:text-base sm:tracking-[0.32em] xl:text-[22px]">
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

        <div className="flex items-center gap-2">
          <div className="hidden sm:block">
            <Button size="sm" href="/login">
              Acesso à plataforma
            </Button>
          </div>

          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            className="flex size-11 items-center justify-center rounded-full text-action transition-colors hover:bg-mint-100 focus-visible:outline-2 focus-visible:outline-action lg:hidden"
          >
            <Icon icon={open ? CloseIcon : MenuIcon} size={24} />
          </button>
        </div>
      </div>

      {open && (
        <div
          id="mobile-menu"
          className="glass-card mx-4 mt-3 rounded-3xl p-3 md:mx-8 lg:hidden"
        >
          <nav aria-label="Menu" className="flex flex-col">
            {navigationItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-center rounded-full px-4 text-base text-ink transition-colors hover:bg-mint-100 hover:text-action focus-visible:outline-2 focus-visible:outline-action"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <Button href="/login" className="mt-2 w-full justify-center sm:hidden">
            Acesso à plataforma
          </Button>
        </div>
      )}
    </header>
  );
}