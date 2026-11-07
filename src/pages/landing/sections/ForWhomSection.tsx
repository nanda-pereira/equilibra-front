import Section from "../../../components/layout/Section";
import IconBadge from "../../../components/ui/IconBadge";
import Reveal from "../../../components/ui/Reveal";
import SectionEyebrow from "../../../components/ui/SectionEyebrow";
import {
  ClinicalCaregiverIcon,
  DoctorIcon,
  HospitalIcon,
  PatientIcon,
} from "../../../components/ui/icons";
import pacienteImg from "../../../assets/images/paciente.png";
import familiaresImg from "../../../assets/images/familiares-apoio.png";
import redeClinicaImg from "../../../assets/images/rede-clinica.png";
import hospitaisImg from "../../../assets/images/hospitais-clinicas.png";

const audiences = [
  {
    title: "Pacientes",
    description: "Mais segurança, independência e qualidade de vida.",
    icon: PatientIcon,
    image: pacienteImg,
    alt: "Mulher idosa sorrindo, sentada em uma cozinha iluminada",
    position: "object-[50%_30%]",
  },
  {
    title: "Famílias e cuidadores",
    description: "Acompanhamento em tempo real, tranquilidade para o dia a dia.",
    icon: ClinicalCaregiverIcon,
    image: familiaresImg,
    alt: "Idosa sorrindo ao conversar com uma mulher mais jovem, que segura a sua mão",
    position: "object-[50%_30%]",
  },
  {
    title: "Profissionais da saúde",
    description: "Dados precisos ajudam a serem tomadas melhores decisões clínicas.",
    icon: DoctorIcon,
    image: redeClinicaImg,
    alt: "Médica conversando com um paciente idoso em um consultório",
    position: "object-[40%_25%]",
  },
  {
    title: "Clínicas e hospitais",
    description: "Mais eficiência no acompanhamento e na gestão dos casos.",
    icon: HospitalIcon,
    image: hospitaisImg,
    alt: "Recepção clara de uma clínica, com cadeiras azuis e balcão de atendimento",
    position: "object-[50%_60%]",
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
        <Reveal>
          <SectionEyebrow lineWidth={124}>Para Quem</SectionEyebrow>
          <h2
            id="for-who-title"
            className="mt-[14px] text-[26px] font-medium leading-8 text-deep"
          >
            Para quem é o Equilibra?
          </h2>
          <p className="mt-[10px] text-base leading-7 text-ink sm:text-lg">
            Um ecossistema de cuidado que conecta todos os lados e frentes.
          </p>
        </Reveal>

        {/* 4 colunas de 290px com 52px entre elas em 1481px; 1 coluna no celular, 2 no tablet */}
        <ul className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4 xl:gap-[min(52px,3.5vw)]">
          {audiences.map((audience, index) => (
            <Reveal
              as="li"
              key={audience.title}
              delay={index * 120}
              className="overflow-hidden rounded-3xl bg-white shadow-[0_8px_32px_rgba(36,116,119,0.08)] xl:min-h-[338px]"
            >
              <div className="relative aspect-[290/169]">
                <img
                  src={audience.image}
                  alt={audience.alt}
                  loading="lazy"
                  decoding="async"
                  className={`size-full rounded-3xl object-cover ${audience.position}`}
                />
                <IconBadge
                  icon={audience.icon}
                  size="lg"
                  className="absolute -bottom-[19px] left-[25px] ring-4 ring-white"
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
            </Reveal>
          ))}
        </ul>
      </div>
    </Section>
  );
}