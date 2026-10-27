import Logo from "./ui/Logo";

export default function Footer() {
  return (
    <footer className="bg-page px-6 py-10 xl:flex xl:min-h-[185px] xl:items-center xl:justify-center xl:py-0">
      <div className="mx-auto flex flex-col items-center gap-5 text-center">
        <a href="#inicio" aria-label="Equilibra — voltar ao topo">
          <Logo />
        </a>

        <ul aria-label="Redes sociais" className="flex items-center gap-5">
          {[0, 1, 2].map((item) => (
            <li
              key={item}
              aria-hidden="true"
              className="h-[19px] w-[19px] rounded-full bg-[#D9D9D9]"
            />
          ))}
        </ul>

        <p className="text-sm text-ink-soft">
          © 2026 Equilibra. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}