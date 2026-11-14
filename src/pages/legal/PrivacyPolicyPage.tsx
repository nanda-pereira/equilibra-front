
const sections = [
  {
    title: "1. Responsável pelo tratamento",
    paragraphs: [
      "O Equilibra é um projeto acadêmico vinculado a uma instituição de ensino. A entidade responsável pelo tratamento dos dados e o canal institucional de privacidade precisam ser confirmados antes da publicação definitiva desta Política.",
    ],
  },
  {
    title: "2. Quais dados podem ser tratados",
    paragraphs: [
      "Conforme as funcionalidades habilitadas, a plataforma pode tratar dados cadastrais e de conta, informações de perfil, registros de monitoramento, dados relacionados à saúde, vínculos entre pacientes e cuidadores ou profissionais, notificações e mensagens enviadas ao chatbot.",
      "Os modelos internos também contemplam informações como frequência cardíaca, atividade, passos, sono, marcha, resultados de análises e indicadores de qualidade dos registros. A existência de uma estrutura no código não significa que todos esses dados sejam coletados de todos os usuários.",
    ],
  },
  {
    title: "3. Finalidades",
    paragraphs: [
      "Conforme as funcionalidades efetivamente disponíveis, os dados podem ser utilizados para administrar contas, autenticar usuários, manter vínculos e permissões, registrar e apresentar informações de monitoramento, calcular métricas, gerar resultados exploratórios, enviar notificações e proteger a aplicação.",
      "Qualquer utilização para pesquisa acadêmica deve estar definida e aprovada pela instituição responsável, com finalidade e base legal adequadas.",
    ],
  },
  {
    title: "4. Dados de saúde e análises",
    paragraphs: [
      "Dados de saúde são dados pessoais sensíveis e exigem proteção específica. O serviço de análise identificado no projeto calcula métricas e pode apontar desvios em registros de monitoramento.",
      "Esses resultados são experimentais e não devem ser interpretados como diagnóstico, previsão clínica validada ou recomendação médica.",
    ],
  },
  {
    title: "5. Compartilhamento",
    paragraphs: [
      "O sistema contém recursos de vínculos e permissões para pacientes, profissionais e cuidadores. O acesso deve respeitar as permissões implementadas e as autorizações ou bases legais aplicáveis.",
      "Os registros de monitoramento são enviados ao serviço de análise configurado pela aplicação. Os fornecedores de hospedagem, banco de dados e infraestrutura utilizados e seus papéis precisam ser confirmados e informados na versão definitiva desta Política.",
    ],
  },
  {
    title: "6. Armazenamento e retenção",
    paragraphs: [
      "Os dados podem ser armazenados no banco de dados e nos serviços de infraestrutura configurados para a aplicação. Os prazos de retenção, o procedimento de descarte e o tratamento de cópias de segurança ainda precisam ser definidos pela instituição responsável.",
    ],
  },
  {
    title: "7. Segurança",
    paragraphs: [
      "O código analisado inclui mecanismos como hash de senhas, autenticação, controles de acesso e registros de auditoria para determinadas operações. A existência desses mecanismos não garante, por si só, a segurança integral do ambiente.",
      "A instituição responsável deve avaliar a configuração de produção, os acessos ao banco, a proteção de segredos, os backups, os registros técnicos e os procedimentos de resposta a incidentes.",
    ],
  },
  {
    title: "8. Direitos dos titulares",
    paragraphs: [
      "Nos termos da legislação aplicável, o titular pode solicitar confirmação do tratamento, acesso e correção de dados e, quando cabível, informações sobre compartilhamento, anonimização, bloqueio, eliminação, portabilidade e revogação do consentimento.",
      "As solicitações devem ser encaminhadas ao canal institucional de privacidade, que precisa ser definido antes da publicação definitiva. Os pedidos serão avaliados conforme a legislação aplicável e as circunstâncias do tratamento.",
    ],
  },
  {
    title: "9. Alterações desta Política",
    paragraphs: [
      "Esta Política poderá ser atualizada quando houver mudanças relevantes no projeto ou no tratamento de dados. As alterações deverão ser comunicadas de forma acessível e acompanhadas das providências necessárias, inclusive novo consentimento quando aplicável.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-page px-5 py-8 text-ink sm:px-8 sm:py-12">
      <article className="mx-auto w-full max-w-3xl">
        <header className="border-b border-brand/20 pb-8 sm:pb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-action-hover">
            Equilibra
          </p>

          <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
            Política de Privacidade
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-ink/70">
            Saiba quais informações podem ser tratadas, para quais finalidades
            e como os direitos de privacidade devem ser exercidos.
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
            Esta minuta precisa ser revisada pela instituição responsável,
            especialmente quanto às bases legais, aos fornecedores, aos prazos
            de retenção e ao canal de atendimento aos titulares.
          </p>

          <a
            href="/termos-de-uso"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex text-sm font-semibold text-action-hover underline underline-offset-4 transition-colors hover:text-ink"
          >
            Termos de Uso
          </a>
        </footer>
      </article>
    </main>
  );
}