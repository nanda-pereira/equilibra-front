import Button from "../../../components/ui/Button";

export default function Hero() {
  return (
    <section
      id="inicio"
      className="hero-screen relative flex items-start justify-center overflow-hidden bg-page px-6 pb-14 pt-36 text-center xl:pb-[60px] xl:pt-[clamp(160px,14.5vw,220px)]"    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_8%_100%,rgba(78,164,160,0.20),transparent_35%),radial-gradient(ellipse_at_90%_5%,rgba(78,164,160,0.10),transparent_38%)]"
      />

      <div className="relative z-10 mx-auto w-full max-w-[761px]">
        <h1 className="text-[clamp(34px,3.8vw,56px)] font-semibold leading-[1.16] tracking-[-0.035em] text-black">
          Mais segurança para estar
          <br className="hidden sm:block" /> em movimento.
        </h1>

        <p className="mx-auto mt-10 max-w-[737px] text-[clamp(16px,1.5vw,22px)] leading-[1.5] text-ink">
          O Equilibra é uma plataforma inteligente que monitora os sinais
          motores, detecta riscos de quedas e conecta pacientes, cuidadores e
          profissionais de saúde.
        </p>

        <div className="mt-14 flex flex-wrap items-center justify-center gap-3 sm:gap-[25px]">
          <Button href="#">Acesso à plataforma</Button>
          <Button href="#problema" variant="outline">
            Saiba mais
          </Button>
        </div>
      </div>
    </section>
  );
}