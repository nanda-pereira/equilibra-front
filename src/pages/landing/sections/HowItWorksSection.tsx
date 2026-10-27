import Section from "../../../components/layout/Section";
import SectionEyebrow from "../../../components/ui/SectionEyebrow";
import curvaPasso12 from "../../../assets/images/curva-passo-1-2.svg";
import curvaPasso24 from "../../../assets/images/curva-passo-2-4.svg";

const steps = [
  {
    number: "1",
    title: "Coleta de dados",
    description: "O dispositivo vestível monitora os sinais motores em tempo real.",
    circle: "xl:left-[9.656%]",
    text: "xl:left-[13.977%]",
  },
  {
    number: "2",
    title: "Análise Inteligente",
    description: "A IA identifica padrões e classifica o risco.",
    circle: "xl:left-[33.423%]",
    text: "xl:left-[37%]",
  },
  {
    number: "3",
    title: "Alertas e relatórios",
    description: "Notificações são enviadas para paciente, cuidadores e médicos.",
    circle: "xl:left-[58.204%]",
    text: "xl:left-[61.78%]",
  },
  {
    number: "4",
    title: "Acompanhamento",
    description:
      "Com o histórico, a equipe médica ajusta o tratamento e as recomendações.",
    circle: "xl:left-[82.512%]",
    text: "xl:left-[86.56%]",
  },
];

export default function HowItWorksSection() {
  return (
    <Section
      id="como-funciona"
      labelledBy="how-title"
      bg="bg-[#f6fbfa]"
      className="xl:px-0"
    >
      <div className="mx-auto w-full max-w-[1481px] xl:relative xl:aspect-[1481/539]">
        <div className="flex flex-col items-center text-center">
          <SectionEyebrow
            large
            center
            headingId="how-title"
            lineWidth={200.5}
            className="xl:absolute xl:left-1/2 xl:top-[8.81%] xl:-translate-x-1/2"
          >
            Como funciona
          </SectionEyebrow>

          <p className="mt-6 max-w-[632px] font-urbanist text-[22px] font-medium leading-[26px] text-[#202020] xl:absolute xl:left-1/2 xl:top-[19.67%] xl:mt-0 xl:w-[42.67%] xl:max-w-none xl:-translate-x-1/2">
            O Equilibra trabalha com coleta de dados simples. Tudo isso visando
            o cuidado, tudo conectado.
          </p>
        </div>

        {/* Passos */}
        <ol className="mt-12 grid list-none gap-12 sm:grid-cols-2 xl:mt-0 xl:block">
          {steps.map((step) => (
            <li key={step.number} className="flex flex-col items-center text-center">
              <div
                aria-hidden="true"
                className={`h-[109px] w-[108px] shrink-0 rounded-full bg-[#D9D9D9] xl:absolute xl:top-[39.7%] xl:aspect-[108/109] xl:h-auto xl:w-[7.292%] ${step.circle}`}
              />

              <div
                className={`mt-6 w-full max-w-[235px] xl:absolute xl:top-[68.65%] xl:mt-0 xl:w-[15.87%] xl:max-w-none xl:-translate-x-1/2 ${step.text}`}
              >
                {/* número do passo */}
                <h3 className="relative inline-block font-urbanist text-[22px] font-medium leading-[26px] text-[#202020]">
                  <span
                    aria-hidden="true"
                    className="absolute right-full top-0 mr-5 text-[32px] leading-[26px] text-[#539492]"
                  >
                    {step.number}
                  </span>
                  {step.title}
                </h3>

                <p className="mt-2 font-urbanist text-base font-medium leading-[22px] text-[#202020]">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-[17.758%] top-[46.753%] hidden h-[8.534%] w-[15.361%] xl:block"
        >
          <div className="absolute inset-[-3.26%_-0.66%]">
            <img src={curvaPasso12} alt="" className="block size-full max-w-none" />
          </div>
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-[41.458%] top-[47.263%] hidden h-[9.416%] w-[40.75%] xl:block"
        >
          <div className="absolute inset-[-2.96%_-0.25%]">
            <img src={curvaPasso24} alt="" className="block size-full max-w-none" />
          </div>
        </div>
      </div>
    </Section>
  );
}