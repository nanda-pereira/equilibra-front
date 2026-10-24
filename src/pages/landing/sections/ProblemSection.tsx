import Section from "../../../components/layout/Section";
import ArrowRightIcon from "../../../components/ui/ArrowRightIcon";
import SectionEyebrow from "../../../components/ui/SectionEyebrow";
import FeatureCard from "../../../components/ui/FeatureCard";

const problems = [
  {
    title: (
      <>
        Monitoramento
        <br />
        contínuo
      </>
    ),
    description:
      "Consultas esporádicas não capturam as variações do quadro motor entre um intervalo de tempo.",
  },
  {
    title: (
      <>
        Insegurança e falta
        <br />
        de dados
      </>
    ),
    description:
      "Pacientes e famílias convivem com o medo de quedas e a ausência de dados confiáveis sobre a evolução da doença.",
  },
  {
    title: (
      <>
        Envelhecimento
        <br />
        da população
      </>
    ),
    description:
      "O aumento da expectativa de vida reforça a necessidade de soluções preventivas especializadas e acessíveis.",
  },
];

export default function ProblemSection() {
  return (
    <Section
      id="problema"
      labelledBy="problem-title"
      className="xl:pl-[72px] xl:pr-[61px]"
    >
      <div className="mx-auto grid w-full max-w-[1348px] gap-12 xl:grid-cols-[460fr_878fr] xl:items-center xl:gap-x-[10px] xl:gap-y-0">
        <div className="flex flex-col">
          <SectionEyebrow lineWidth={140}>O Problema</SectionEyebrow>
          <h2
            id="problem-title"
            className="mt-[15px] max-w-[460px] text-[32px] font-medium leading-[41px] text-deep"
          >
            O que torna o Parkinson ainda mais desafiador?
          </h2>

          {/* Texto provisório do Figma (lorem ipsum). Substituir pelo texto real. */}
          <p className="mt-7 max-w-[460px] text-lg leading-[27px] text-ink">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa
            mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien
            fringilla, mattis ligula consectetur, ultrices mauris. Maecenas
            vitae mattis tellus.
          </p>

          <a
            href="#solucao"
            className="mt-10 inline-flex items-center gap-[11px] self-start text-lg leading-[27px] text-action transition-colors hover:text-action-hover"
          >
            Entenda mais sobre o problema
            <ArrowRightIcon />
          </a>
        </div>

        <ul className="grid gap-[19px] md:grid-cols-3">
          {problems.map((problem, index) => (
            <FeatureCard
              key={index}
              title={problem.title}
              description={problem.description}
            />
          ))}
        </ul>
      </div>
    </Section>
  );
}