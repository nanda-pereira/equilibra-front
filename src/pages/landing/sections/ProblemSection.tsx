import Section from "../../../components/layout/Section";
import ArrowRightIcon from "../../../components/ui/ArrowRightIcon";
import SectionEyebrow from "../../../components/ui/SectionEyebrow";
import FeatureCard from "../../../components/ui/FeatureCard";
import Reveal from "../../../components/ui/Reveal";
import { ActivityIcon, AlertIcon, PatientsIcon } from "../../../components/ui/icons";

const problems = [
  {
    icon: ActivityIcon,
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
    icon: AlertIcon,
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
    icon: PatientsIcon,
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
        <Reveal className="flex flex-col">
          <SectionEyebrow lineWidth={140}>O Problema</SectionEyebrow>
          <h2
            id="problem-title"
            className="mt-[15px] max-w-[460px] text-[28px] font-medium leading-[36px] text-deep sm:text-[32px] sm:leading-[41px]"
          >
            O que torna o Parkinson ainda mais desafiador?
          </h2>

          {/* Texto provisório do Figma (lorem ipsum). Substituir pelo texto real. */}
          <p className="mt-7 max-w-[460px] text-base leading-[26px] text-ink sm:text-lg sm:leading-[27px]">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa
            mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien
            fringilla, mattis ligula consectetur, ultrices mauris. Maecenas
            vitae mattis tellus.
          </p>

          <a
            href="#solucao"
            className="mt-10 inline-flex min-h-11 items-center gap-[11px] self-start text-lg leading-[27px] text-action transition-colors hover:text-action-hover"
          >
            Entenda mais sobre o problema
            <ArrowRightIcon />
          </a>
        </Reveal>

        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:gap-[19px]">
          {problems.map((problem, index) => (
            <FeatureCard
              key={index}
              icon={problem.icon}
              title={problem.title}
              description={problem.description}
              delay={index * 120}
              className={index === 2 ? "sm:col-span-2 lg:col-span-1" : ""}
            />
          ))}
        </ul>
      </div>
    </Section>
  );
}