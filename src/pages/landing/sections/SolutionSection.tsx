import Button from "../../../components/ui/Button";
import SectionEyebrow from "../../../components/ui/SectionEyebrow";
import senhoraImg from "../../../assets/images/senhora.png";
import Section from "../../../components/layout/Section";
import FeatureCard from "../../../components/ui/FeatureCard";

const features = [
  {
    title: "App para Smartwatch + IA",
    description: "Coleta e analisa dados motores em tempo real.",
  },
  {
    title: "Detecção precoce",
    description:
      "Identifica padrões e gera alertas antes que um risco se concretize.",
  },
  {
    title: "Apoio e contato clínico",
    description:
      "Aproxima os dados do paciente da equipe médica, com histórico real e preciso.",
  },
];

export default function SolutionSection() {
  return (
    <Section
      id="solucao"
      labelledBy="solution-title"
      bg="bg-mint-100"
      className="xl:pl-[2.6vw] xl:pr-[5.7vw]"
    >
      <div className="mx-auto grid w-full max-w-[1358px] gap-12 xl:grid-cols-[412fr_460fr_394fr] xl:items-start xl:gap-0">
        <div className="relative mx-auto aspect-[412/456] w-full max-w-[412px] xl:mx-0 xl:max-w-none">
          <div
            aria-hidden="true"
            className="absolute left-0 top-[12.94%] h-[87.06%] w-[95.39%] rounded-full bg-[radial-gradient(circle_at_50%_70%,#bfe3df_0%,rgba(191,227,223,0)_70%)]"
          />
          <img
            src={senhoraImg}
            alt="Mulher idosa de perfil, com expressão serena"
            className="absolute left-[8.25%] top-0 h-[91.89%] w-[91.75%] object-contain"
          />
        </div>

        <div className="mx-auto flex w-full max-w-[460px] flex-col xl:mx-0 xl:mt-3 xl:max-w-none xl:pl-[min(55px,3.9vw)]">
          <SectionEyebrow lineWidth={124}>A Solução</SectionEyebrow>

          <h2
            id="solution-title"
            className="mt-[18px] text-[28px] font-medium leading-[34px] text-deep"
          >
            E se existir uma plataforma completa, que une tecnologia, dados e
            cuidado?
          </h2>

          <p className="mt-7 text-lg leading-[26px] text-ink">
            O Equilibra combina um dispositivo vestível, inteligência artificial
            e uma rede de profissionais de saúde para oferecer monitoramento
            contínuo, detecção precoce de riscos e mais segurança no dia a dia.
          </p>

          <Button
            href="#como-funciona"
            variant="outline"
            withArrow
            className="mt-10 self-start"
          >
            Saiba como funciona
          </Button>
        </div>

        <ul className="mx-auto flex w-full max-w-[394px] flex-col gap-[30px] xl:mx-0 xl:mt-[19px] xl:max-w-none xl:pl-[min(37px,2.6vw)]">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              variant="inline"
              title={feature.title}
              description={feature.description}
            />
          ))}
        </ul>
      </div>
    </Section>
  );
}