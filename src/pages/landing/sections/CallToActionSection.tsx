import Button from "../../../components/ui/Button";
import mockupApp from "../../../assets/images/mockup-app.png";
import brilhoCta from "../../../assets/images/brilho-cta.svg";

export default function CallToActionSection() {
  return (
    <section
      id="comece-ja"
      aria-labelledby="cta-title"
      className="overflow-hidden bg-[#164e4f] px-6 pt-14 md:px-12 xl:px-0 xl:pt-0"
    >
      <div className="mx-auto w-full max-w-[1481px] xl:relative xl:aspect-[1481/421]">
        <h2
          id="cta-title"
          className="text-[30px] font-semibold leading-[1.21] text-[#f5f5f5] xl:absolute xl:left-[6.955%] xl:top-[21.14%] xl:w-[42%] xl:text-[clamp(30px,2.566vw,38px)]"
        >
          Dê o primeiro passo <br className="hidden sm:block" />
          para um cuidado mais seguro.
        </h2>

        <p className="mt-5 max-w-[598px] font-urbanist text-lg font-medium leading-[1.3] text-[#f5f5f5] xl:absolute xl:left-[6.955%] xl:top-[49.64%] xl:mt-0 xl:w-[40.38%] xl:max-w-none xl:text-[clamp(16px,1.35vw,20px)]">
          Junte-se numa comunidade de usuários que já estão vivendo sua rotina
          com tranquilidade e independência com o Equilibra.
        </p>

        <div className="mt-8 xl:absolute xl:left-[6.955%] xl:top-[69.83%] xl:mt-0">
          <Button href="#" variant="cta" withArrow>
            Comece já!
          </Button>
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-[57.8%] top-[13.54%] hidden h-[94.3%] w-[26.54%] xl:block"
        >
          <div className="absolute inset-[-62.97%_-63.61%]">
            <img src={brilhoCta} alt="" className="block size-full max-w-none" />
          </div>
        </div>

        <div className="relative mx-auto mt-10 h-[300px] w-full max-w-[379px] overflow-hidden xl:absolute xl:left-[58.745%] xl:top-0 xl:mt-0 xl:aspect-[379/539] xl:h-auto xl:w-[25.59%] xl:max-w-none xl:overflow-visible">
          <img
            src={mockupApp}
            alt="Tela de boas-vindas do aplicativo Equilibra"
            className="absolute left-0 top-0 h-auto w-full max-w-none"
          />
        </div>
      </div>
    </section>
  );
}