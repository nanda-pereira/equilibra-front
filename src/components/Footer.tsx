import Icon from "./ui/Icon";
import Logo from "./ui/Logo";
import { InstagramIcon, MailIcon, YoutubeIcon } from "./ui/icons";

// TODO: preencher o href quando existirem os destinos
// (e-mail: "mailto:contato@..."; YouTube e Instagram: URL do canal e do perfil)
const socials: { label: string; icon: typeof MailIcon; href?: string }[] = [
  { label: "E-mail", icon: MailIcon },
  { label: "YouTube", icon: YoutubeIcon },
  { label: "Instagram", icon: InstagramIcon },
];

const circle =
  "flex size-11 items-center justify-center rounded-full bg-mint-100 text-action";

export default function Footer() {
  return (
    <footer className="bg-page px-6 py-10 xl:flex xl:min-h-[185px] xl:items-center xl:justify-center xl:py-0">
      <div className="mx-auto flex flex-col items-center gap-5 text-center">
        <a href="#inicio" aria-label="Equilibra — voltar ao topo">
          <Logo />
        </a>

        <ul aria-label="Contato e redes sociais" className="flex items-center gap-4">
          {socials.map(({ label, icon, href }) => (
            <li key={label}>
              {href ? (
                <a
                  href={href}
                  aria-label={label}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className={`${circle} transition-colors hover:bg-mint-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action`}
                >
                  <Icon icon={icon} size={22} />
                </a>
              ) : (
                <span role="img" aria-label={`${label} (em breve)`} className={circle}>
                  <Icon icon={icon} size={22} />
                </span>
              )}
            </li>
          ))}
        </ul>

        <p className="text-sm text-ink-soft">
          © 2026 Equilibra. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}