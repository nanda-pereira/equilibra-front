import Section from "../../../components/layout/Section";
import SectionEyebrow from "../../../components/ui/SectionEyebrow";

const audiences = [
  {
    title: "Pacientes",
    description: "Mais segurança, independência e qualidade de vida.",
  },
  {
    title: "Famílias e cuidadores",
    description: "Acompanhamento em tempo real, tranquilidade para o dia a dia.",
  },
  {
    title: "Profissionais da saúde",
    description: "Dados precisos ajudam a serem tomadas melhores decisões clínicas.",
  },
  {
    title: "Clínicas e hospitais",
    description: "Mais eficiência no acompanhamento e na gestão dos casos.",
  },
];

export default function ForWhoSection() {
  return (
    <Section
      id="para-quem"
      labelledBy="for-who-title"
      bg="bg-white"
      // Figma (1481px): 97px à esquerda e 68px à direita
      className="xl:pl-[6.5vw] xl:pr-[4.6vw]"
    >
      <div className="mx-auto w-full max-w-[1316px]">
        <SectionEyebrow lineWidth={124}>Para Quem</SectionEyebrow>
        <h2
          id="for-who-title"
          className="mt-[14px] text-[26px] font-medium leading-8 text-deep"
        >
          Para quem é o Equilibra?
        </h2>
        <p className="mt-[10px] text-lg leading-7 text-ink">
          Um ecossistema de cuidado que conecta todos os lados e frentes.
        </p>

        {/* 4 colunas de 290px com 52px entre elas em 1481px; escala em telas menores */}
        <ul className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4 xl:gap-[min(52px,3.5vw)]">
          {audiences.map((audience) => (
            <li
              key={audience.title}
              className="overflow-hidden rounded-3xl bg-white shadow-[0_8px_32px_rgba(36,116,119,0.08)] xl:min-h-[338px]"
            >
              <div className="relative h-[169px] bg-[#AFAFAF]">
                <div
                  aria-hidden="true"
                  className="absolute -bottom-[19px] left-[25px] h-16 w-16 rounded-full bg-[#E9E9E9]"
                />
              </div>

              <div className="px-[25px] pb-8 pt-8">
                <h3 className="text-xl font-normal leading-7 text-ink">
                  {audience.title}
                </h3>
                <p className="mt-3 text-sm leading-[22px] text-ink-soft">
                  {audience.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}