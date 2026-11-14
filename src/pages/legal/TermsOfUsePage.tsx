
const sections = [
  {
    title: "1. Sobre o Equilibra",
    paragraphs: [
      "O Equilibra é um projeto acadêmico e experimental voltado à exploração de recursos tecnológicos de apoio ao acompanhamento e à organização de informações relacionadas ao cuidado de pessoas com doença de Parkinson.",
      "A plataforma pode disponibilizar recursos para pacientes, médicos e cuidadores, conforme as funcionalidades efetivamente habilitadas.",
    ],
  },
  {
    title: "2. Finalidade e limitações",
    paragraphs: [
      "O Equilibra não substitui consultas, avaliações, orientações ou acompanhamento por profissionais de saúde. Seus recursos experimentais não devem ser utilizados isoladamente para diagnosticar doenças, alterar medicamentos ou definir tratamentos.",
      "As análises automatizadas podem apresentar erros, limitações ou resultados insuficientes. Não constituem diagnóstico médico nem garantem eficácia clínica.",
    ],
  },
  {
    title: "3. Cadastro e segurança da conta",
    paragraphs: [
      "O usuário deve fornecer informações corretas e manter a confidencialidade de suas credenciais. Suspeitas de acesso não autorizado devem ser comunicadas à equipe responsável pelo projeto.",
      "O acesso a funcionalidades e informações depende do perfil, dos vínculos e das permissões efetivamente disponibilizados pela plataforma.",
    ],
  },
  {
    title: "4. Pacientes, profissionais e cuidadores",
    paragraphs: [
      "O acesso de profissionais e cuidadores às informações de um paciente deve respeitar os vínculos, as permissões configuradas e as autorizações ou bases legais aplicáveis.",
      "Ter acesso a uma informação não significa ter autorização para divulgá-la ou utilizá-la para finalidades incompatíveis com as informadas.",
    ],
  },
  {
    title: "5. Uso acadêmico e disponibilidade",
    paragraphs: [
      "Por ser um projeto experimental, as funcionalidades podem ser alteradas, suspensas ou descontinuadas durante o desenvolvimento. Não há garantia de disponibilidade contínua ou de precisão absoluta dos resultados.",
      "A participação no projeto não representa promessa de atendimento médico, benefício clínico ou eficácia terapêutica.",
    ],
  },
  {
    title: "6. Privacidade e dados pessoais",
    paragraphs: [
      "O tratamento de dados pessoais é explicado na Política de Privacidade do Equilibra. Dados de saúde exigem proteção especial e devem ser tratados conforme as finalidades informadas, a legislação aplicável e as medidas de segurança adotadas.",
    ],
  },
  {
    title: "7. Uso adequado",
    paragraphs: [
      "É vedado tentar acessar informações sem autorização, contornar controles de segurança, comprometer a plataforma ou divulgar dados de outros usuários sem autorização ou fundamento legal.",
    ],
  },
  {
    title: "8. Alterações dos Termos",
    paragraphs: [
      "Estes Termos poderão ser atualizados em razão de mudanças no projeto. Alterações relevantes deverão ser comunicadas de forma acessível e, quando necessário, poderão exigir novo aceite.",
    ],
  },
];

export default function TermsOfUsePage() {
  return (
    <main className="min-h-screen bg-page px-5 py-8 text-ink sm:px-8 sm:py-12">
      <article className="mx-auto w-full max-w-3xl">
        <header className="border-b border-brand/20 pb-8 sm:pb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-action-hover">
            Equilibra
          </p>

          <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
            Termos de Uso
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-ink/70">
            As condições de utilização da plataforma, sua finalidade acadêmica
            e as limitações dos recursos disponibilizados.
          </p>

          <p className="mt-5 text-xs text-ink/55">
            Minuta para revisão institucional · Versão 0.1
          </p>
        </header>

        <div className="divide-y divide-brand/15">
          {sections.map((section) => (
            <section key={section.title} className="py-7 sm:py-8">
              <h2 className="text-base font-semibold leading-7 sm:text-lg">
                {section.title}
              </h2>

              <div className="mt-3 space-y-4">
                {section.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-sm leading-7 text-ink/75 sm:text-base"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <footer className="border-t border-brand/20 pt-6 pb-4">
          <p className="text-sm leading-7 text-ink/65">
            Antes da utilização com pessoas reais, estes Termos devem ser
            revisados e aprovados pela instituição responsável pelo projeto.
          </p>

          <a
            href="/politica-de-privacidade"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex text-sm font-semibold text-action-hover underline underline-offset-4 transition-colors hover:text-ink"
          >
            Política de Privacidade
          </a>
        </footer>
      </article>
    </main>
  );
}