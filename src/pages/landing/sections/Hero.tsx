
export default function Hero() {
  return (
    <section
      id="inicio"
      className="relative flex min-h-[434px] items-center justify-center overflow-hidden bg-[#F4F9F8] px-6 pb-12 pt-28 text-center"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_8%_100%,rgba(78,164,160,0.20),transparent_35%),radial-gradient(ellipse_at_90%_5%,rgba(78,164,160,0.10),transparent_38%)]"
      />

      <div className="relative z-10 mx-auto max-w-[600px]">
        <h1 className="text-[32px] font-semibold leading-[1.08] tracking-[-0.035em] text-black sm:text-[40px]">
          Mais segurança para estar
          <br className="hidden sm:block" /> em movimento.
        </h1>

        <p className="mx-auto mt-6 max-w-[470px] text-sm leading-[1.3] text-[#282B2D] sm:text-base">
          O Equilibra é uma plataforma inteligente que monitora os
          sinais motores, detecta riscos de quedas e conecta
          pacientes, cuidadores e profissionais de saúde.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#acesso"
            className="rounded-full bg-[#4EA4A0] px-5 py-2 text-[10px] font-medium text-white transition-colors hover:bg-[#247477]"
          >
            Acesso à plataforma
          </a>

          <a
            href="#solucao"
            className="rounded-full border border-[#4EA4A0] px-5 py-2 text-[10px] font-medium text-[#247477] transition-colors hover:bg-[#E5F3F1]"
          >
            Saiba mais
          </a>
        </div>
      </div>
    </section>
  );
}
